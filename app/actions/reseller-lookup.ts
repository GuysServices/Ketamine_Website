"use server"

import { prisma } from "@/lib/prisma"
import { getResellerSession, userHasResellerRole } from "@/lib/reseller-auth"
import { PLANS, type PlanId } from "@/lib/reseller-plans"

export interface LookupResult {
    found: boolean
    key?: string
    plan?: string | null
    planLabel?: string | null
    isUsed?: boolean
    isActive?: boolean
    createdAt?: string
    lastUsedAt?: string | null
    redeemedBy?: {
        username: string
        robloxUsername: string | null
        discordId: string | null
    } | null
    creditsCost?: number
    error?: string
}

/**
 * Look up a license key by its value. Only returns data for keys
 * that were claimed by the calling reseller — they can't snoop on
 * other resellers' keys.
 */
export async function lookupKey(rawKey: string): Promise<LookupResult> {
    const session = await getResellerSession()
    if (!session) return { found: false, error: "Not authenticated" }

    const hasRole = await userHasResellerRole(session.discordId)
    if (!hasRole) return { found: false, error: "Reseller role missing" }

    const reseller = await prisma.reseller.findUnique({ where: { discordId: session.discordId } })
    if (!reseller) return { found: false, error: "Reseller not found" }

    const keyValue = rawKey.trim()
    if (!keyValue) return { found: false, error: "Enter a key to look up" }

    const license = await prisma.licenseKey.findUnique({
        where: { key: keyValue },
        include: {
            user: { select: { username: true, robloxUsername: true, discordId: true } },
        },
    })

    if (!license) return { found: false, error: "No key matches that value." }

    if (license.resellerId !== reseller.id) {
        return { found: false, error: "That key isn't one of yours." }
    }

    const planLabel = license.plan && license.plan in PLANS ? PLANS[license.plan as PlanId].label : null

    return {
        found: true,
        key: license.key,
        plan: license.plan,
        planLabel,
        isUsed: license.isUsed,
        isActive: license.isActive,
        createdAt: license.createdAt.toISOString(),
        lastUsedAt: license.lastUsedAt?.toISOString() ?? null,
        creditsCost: license.creditsCost,
        redeemedBy: license.user
            ? {
                username: license.user.username,
                robloxUsername: license.user.robloxUsername,
                discordId: license.user.discordId,
            }
            : null,
    }
}
