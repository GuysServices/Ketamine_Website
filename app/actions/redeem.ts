'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { verifyKeyAuthLicense } from '@/lib/keyauth'
import { revalidatePath } from 'next/cache'

export interface RedeemResult {
    success?: boolean
    error?: string
    expiresAt?: string | null
}

/**
 * Redeem a new KeyAuth license key for the currently logged-in user.
 * Replaces any existing license key attached to the account.
 */
export async function redeemLicenseKey(prevState: unknown, formData: FormData): Promise<RedeemResult> {
    const session = await getSession()
    if (!session?.userId) {
        return { error: 'You must be logged in' }
    }

    const rawKey = (formData.get('licenseKey') as string | null)?.trim()
    if (!rawKey) {
        return { error: 'License key is required' }
    }

    // Verify against KeyAuth
    const verification = await verifyKeyAuthLicense(rawKey)
    if (!verification.valid) {
        return { error: verification.error || 'Invalid license key' }
    }

    // Check if this key is already owned by a different user
    const existing = await prisma.licenseKey.findUnique({
        where: { key: rawKey },
        include: { user: true },
    })

    if (existing?.userId && existing.userId !== session.userId) {
        return { error: 'This license key is already linked to another account' }
    }

    // Extract expiry from KeyAuth subscription info
    const subscription = verification.info?.subscriptions?.[0]
    const expiresAt = subscription?.expiry
        ? new Date(Number(subscription.expiry) * 1000)
        : null

    try {
        await prisma.$transaction(async (tx) => {
            // Detach the user's current license key (if any) so the 1-to-1
            // relation doesn't conflict when connecting the new one.
            const current = await tx.licenseKey.findUnique({
                where: { userId: session.userId },
            })

            if (current && current.key !== rawKey) {
                await tx.licenseKey.update({
                    where: { id: current.id },
                    data: { userId: null },
                })
            }

            // Upsert the new license key and connect it to this user
            await tx.licenseKey.upsert({
                where: { key: rawKey },
                create: {
                    key: rawKey,
                    isUsed: true,
                    isActive: true,
                    maxUses: 1,
                    usedCount: 1,
                    lastUsedAt: new Date(),
                    expiresAt,
                    userId: session.userId,
                    metadata: {
                        source: 'keyauth',
                        subscription: subscription?.subscription || null,
                    },
                },
                update: {
                    isUsed: true,
                    isActive: true,
                    lastUsedAt: new Date(),
                    expiresAt,
                    userId: session.userId,
                },
            })
        })
    } catch (err) {
        console.error('[Redeem] Failed:', err)
        return { error: 'Failed to redeem license key' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')

    return {
        success: true,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
    }
}
