'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { verifyKeyAuthLicense } from '@/lib/keyauth'

export async function register(prevState: unknown, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const licenseKey = formData.get('licenseKey') as string

    if (!username || !password || !licenseKey) {
        return { error: 'All fields are required' }
    }

    // Verify license key against KeyAuth.cc
    const verification = await verifyKeyAuthLicense(licenseKey.trim())
    if (!verification.valid) {
        return { error: verification.error || 'Invalid license key' }
    }

    // Check if this license key has already been used to create an account
    const existingKeyRecord = await prisma.licenseKey.findUnique({
        where: { key: licenseKey.trim() },
        include: { user: true }
    })

    if (existingKeyRecord?.user) {
        return { error: 'This license key has already been registered to an account' }
    }

    // Check if username already exists (case-insensitive)
    const existingUser = await prisma.user.findFirst({
        where: {
            username: {
                equals: username,
                mode: 'insensitive'
            }
        }
    })

    if (existingUser) {
        return { error: 'Username already taken' }
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10)

    // Pull subscription info from KeyAuth response if available
    const subscription = verification.info?.subscriptions?.[0]
    const expiresAt = subscription?.expiry
        ? new Date(Number(subscription.expiry) * 1000)
        : null

    try {
        // Upsert the license key record locally for tracking (linked to KeyAuth)
        const keyRecord = await prisma.licenseKey.upsert({
            where: { key: licenseKey.trim() },
            create: {
                key: licenseKey.trim(),
                isUsed: true,
                isActive: true,
                maxUses: 1,
                usedCount: 1,
                lastUsedAt: new Date(),
                expiresAt,
                metadata: {
                    source: 'keyauth',
                    subscription: subscription?.subscription || null,
                },
            },
            update: {
                isUsed: true,
                usedCount: { increment: 1 },
                lastUsedAt: new Date(),
            },
        })

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash: hashedPassword,
                licenseKey: {
                    connect: { id: keyRecord.id }
                }
            }
        })

        await createSession(user.id)
    } catch (e) {
        console.error('[Register] Failed:', e)
        return { error: 'Registration failed' }
    }

    redirect('/dashboard')
}

export async function login(prevState: unknown, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const turnstileToken = formData.get('cf-turnstile-response') as string

    // Skip Turnstile in development so local testing works even when the
    // Cloudflare widget can't load.
    const isDev = process.env.NODE_ENV !== 'production'

    if (!isDev) {
        if (!turnstileToken) {
            return { error: 'Please complete the Turnstile challenge' }
        }

        // Verify Turnstile
        const verifyFormData = new URLSearchParams()
        verifyFormData.append('secret', process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "")
        verifyFormData.append('response', turnstileToken)

        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: verifyFormData,
        }).then(res => res.json())

        if (!turnstileRes.success) {
            return { error: 'Turnstile verification failed' }
        }
    }

    const user = await prisma.user.findFirst({
        where: {
            username: {
                equals: username,
                mode: 'insensitive'
            }
        }
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return { error: 'Invalid credentials' }
    }

    await createSession(user.id)
    redirect('/dashboard')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
