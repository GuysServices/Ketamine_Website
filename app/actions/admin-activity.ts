"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { PLANS, type PlanId } from "@/lib/reseller-plans"

export interface ActivityEntry {
    id: string
    type: "topup" | "spend" | "refund" | "adjustment" | "redeem"
    delta: number
    note: string | null
    balanceAfter: number | null
    createdAt: string
    reseller: {
        id: string
        username: string
        avatar: string | null
    }
    redeemedBy?: {
        username: string
        robloxUsername: string | null
    } | null
    keyPlan?: string | null
    keyPlanLabel?: string | null
}

/**
 * Returns a unified activity feed across all resellers, combining ledger
 * entries (topups/spends/refunds) and recent key redemptions.
 */
export async function getRecentActivity(limit = 50): Promise<ActivityEntry[]> {
    await requireAdmin()

    // 1. Ledger entries
    const ledgerRaw = await prisma.resellerLedger.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
    })

    const resellerIds = Array.from(new Set(ledgerRaw.map((e: any) => e.resellerId)))
    const resellers = await prisma.reseller.findMany({
        where: { id: { in: resellerIds } },
        select: { id: true, username: true, avatar: true },
    })
    const resellerMap = new Map<string, { id: string; username: string; avatar: string | null }>(
        resellers.map((r: any) => [r.id, r]),
    )

    const ledgerEntries: ActivityEntry[] = ledgerRaw.flatMap((e: any) => {
        const r = resellerMap.get(e.resellerId)
        if (!r) return []
        return [
            {
                id: `ledger:${e.id}`,
                type: e.reason as ActivityEntry["type"],
                delta: e.delta,
                note: e.note,
                balanceAfter: e.balanceAfter,
                createdAt: e.createdAt.toISOString(),
                reseller: {
                    id: r.id,
                    username: r.username,
                    avatar: r.avatar,
                },
            },
        ]
    })

    // 2. Recent key redemptions (so admin can see when customers redeem)
    const redemptionsRaw = await prisma.licenseKey.findMany({
        where: {
            resellerId: { not: null },
            isUsed: true,
            lastUsedAt: { not: null },
        },
        orderBy: { lastUsedAt: "desc" },
        take: limit,
        include: {
            user: { select: { username: true, robloxUsername: true } },
            reseller: { select: { id: true, username: true, avatar: true } },
        },
    })

    const redemptionEntries: ActivityEntry[] = redemptionsRaw.flatMap((k: any) => {
        if (!k.reseller || !k.lastUsedAt) return []
        const planLabel = k.plan && k.plan in PLANS ? PLANS[k.plan as PlanId].label : null
        return [
            {
                id: `redeem:${k.id}`,
                type: "redeem",
                delta: 0,
                note: `Customer redeemed ${planLabel ?? "key"}`,
                balanceAfter: null,
                createdAt: k.lastUsedAt.toISOString(),
                reseller: {
                    id: k.reseller.id,
                    username: k.reseller.username,
                    avatar: k.reseller.avatar,
                },
                redeemedBy: k.user
                    ? {
                        username: k.user.username,
                        robloxUsername: k.user.robloxUsername,
                    }
                    : null,
                keyPlan: k.plan,
                keyPlanLabel: planLabel,
            },
        ]
    })

    // Merge and sort by timestamp, slice to limit
    const merged = [...ledgerEntries, ...redemptionEntries]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)

    return merged
}
