"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { revalidatePath } from "next/cache"
import {
    notifyTopUp,
    notifyDeduct,
    notifySuspended,
    notifyReactivated,
} from "@/lib/reseller-notifications"
import { isValidTier, type Tier } from "@/lib/reseller-plans"

/**
 * Atomically adjust a reseller's credit balance and write a ledger entry.
 * `delta` may be positive (top-up) or negative (deduction).
 */
async function adjustCredits(opts: {
    resellerId: string
    delta: number
    reason: string
    note?: string
}) {
    return await prisma.$transaction(async (tx) => {
        const reseller = await tx.reseller.findUnique({ where: { id: opts.resellerId } })
        if (!reseller) throw new Error("Reseller not found")

        const newBalance = reseller.credits + opts.delta
        if (newBalance < 0) {
            throw new Error(`Insufficient credits. Balance is ${reseller.credits}.`)
        }

        const updated = await tx.reseller.update({
            where: { id: opts.resellerId },
            data: {
                credits: newBalance,
                totalSpent: opts.delta < 0 ? reseller.totalSpent + Math.abs(opts.delta) : reseller.totalSpent,
            },
        })

        await tx.resellerLedger.create({
            data: {
                resellerId: opts.resellerId,
                delta: opts.delta,
                reason: opts.reason,
                note: opts.note ?? null,
                balanceAfter: newBalance,
            },
        })

        return updated
    })
}

export async function topUpReseller(resellerId: string, amount: number, note?: string) {
    await requireAdmin()
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("Amount must be a positive whole number of credits.")
    }
    const updated = await adjustCredits({ resellerId, delta: amount, reason: "topup", note })

    // Fire-and-forget Discord receipt DM
    notifyTopUp(updated.discordId, {
        username: updated.username,
        amount,
        newBalance: updated.credits,
        note,
    })

    revalidatePath("/dashboard/moderator")
    return { success: true }
}

export async function deductCredits(resellerId: string, amount: number, note?: string) {
    await requireAdmin()
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("Amount must be a positive whole number of credits.")
    }
    const updated = await adjustCredits({ resellerId, delta: -amount, reason: "adjustment", note })

    notifyDeduct(updated.discordId, {
        username: updated.username,
        amount,
        newBalance: updated.credits,
        note,
    })

    revalidatePath("/dashboard/moderator")
    return { success: true }
}

export async function setResellerActive(resellerId: string, isActive: boolean) {
    await requireAdmin()
    const updated = await prisma.reseller.update({
        where: { id: resellerId },
        data: { isActive },
    })

    if (isActive) {
        notifyReactivated(updated.discordId, updated.username)
    } else {
        notifySuspended(updated.discordId, updated.username)
    }

    revalidatePath("/dashboard/moderator")
    return { success: true }
}

/**
 * Manually set a reseller's tier. Sets `manualTier=true` so it won't get
 * auto-overwritten by the next claim. Pass `null` for tier to revert to
 * automatic promotion.
 */
export async function setResellerTier(resellerId: string, tier: string | null) {
    await requireAdmin()

    if (tier === null) {
        // Revert to auto: clear manualTier flag, recalculate from totalSpent
        const r = await prisma.reseller.findUnique({ where: { id: resellerId } })
        if (!r) throw new Error("Reseller not found")
        const { tierForSpend } = await import("@/lib/reseller-plans")
        await prisma.reseller.update({
            where: { id: resellerId },
            data: { manualTier: false, tier: tierForSpend(r.totalSpent) },
        })
    } else {
        if (!isValidTier(tier)) throw new Error("Invalid tier")
        await prisma.reseller.update({
            where: { id: resellerId },
            data: { manualTier: true, tier },
        })
    }

    revalidatePath("/dashboard/moderator")
    return { success: true }
}

/**
 * Drop N credits into every reseller in a given tier (or all resellers).
 * Useful for promotional events or compensation.
 */
export async function bulkAirdrop(opts: {
    targetTier?: Tier | "all"
    amount: number
    note?: string
}) {
    await requireAdmin()
    const { targetTier = "all", amount, note } = opts

    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error("Amount must be a positive integer.")
    }
    if (targetTier !== "all" && !isValidTier(targetTier)) {
        throw new Error("Invalid target tier.")
    }

    const where: any = { isActive: true }
    if (targetTier !== "all") where.tier = targetTier

    const resellers = await prisma.reseller.findMany({ where })
    if (resellers.length === 0) {
        return { success: true, count: 0, total: 0 }
    }

    let dispensed = 0
    for (const r of resellers) {
        try {
            const updated = await adjustCredits({
                resellerId: r.id,
                delta: amount,
                reason: "topup",
                note: note || `Airdrop (${targetTier})`,
            })
            // Fire DM
            notifyTopUp(updated.discordId, {
                username: updated.username,
                amount,
                newBalance: updated.credits,
                note: note || `Airdrop bonus`,
            })
            dispensed++
        } catch (err) {
            console.warn("[bulkAirdrop] Failed for", r.id, err)
        }
    }

    revalidatePath("/dashboard/moderator")
    return { success: true, count: dispensed, total: amount * dispensed }
}

export async function getResellerLedger(resellerId: string, limit = 50) {
    await requireAdmin()
    const entries = await prisma.resellerLedger.findMany({
        where: { resellerId },
        orderBy: { createdAt: "desc" },
        take: limit,
    })
    return entries.map((e: any) => ({
        id: e.id,
        delta: e.delta,
        reason: e.reason,
        note: e.note,
        balanceAfter: e.balanceAfter,
        createdAt: e.createdAt.toISOString(),
    }))
}

export async function updateResellerNotes(resellerId: string, notes: string) {
    await requireAdmin()
    await prisma.reseller.update({
        where: { id: resellerId },
        data: { notes: notes || null },
    })
    revalidatePath("/dashboard/moderator")
    return { success: true }
}
