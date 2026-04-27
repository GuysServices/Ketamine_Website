"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"
import { isValidPlan, generateLicenseKey, type PlanId } from "@/lib/reseller-plans"
import { revalidatePath } from "next/cache"

/**
 * A stock key is an unclaimed, unredeemed license key tagged with a plan.
 * Identified by: plan IS NOT NULL AND resellerId IS NULL AND userId IS NULL
 * AND isUsed = false.
 */

/** Returns counts of in-stock keys per plan. */
export async function getStockCounts() {
    await requireAdmin()
    const grouped = await prisma.licenseKey.groupBy({
        by: ["plan"],
        where: {
            plan: { not: null },
            resellerId: null,
            userId: null,
            isUsed: false,
        },
        _count: { _all: true },
    })
    const counts: Record<string, number> = { daily: 0, weekly: 0, monthly: 0, lifetime: 0 }
    for (const g of grouped) {
        if (g.plan) counts[g.plan] = g._count._all
    }
    return counts
}

export async function addStockFromPaste(planId: string, rawKeys: string) {
    await requireAdmin()
    if (!isValidPlan(planId)) throw new Error("Invalid plan.")

    // Split, trim, dedupe, drop blanks
    const keys = Array.from(
        new Set(
            rawKeys
                .split(/[\r\n,;\t ]+/)
                .map((k) => k.trim())
                .filter(Boolean),
        ),
    )

    if (keys.length === 0) throw new Error("No keys provided.")
    if (keys.length > 1000) throw new Error("Too many keys at once (max 1000).")

    // Skip keys that already exist
    const existing = await prisma.licenseKey.findMany({
        where: { key: { in: keys } },
        select: { key: true },
    })
    const existingSet = new Set(existing.map((e) => e.key))
    const newKeys = keys.filter((k) => !existingSet.has(k))

    if (newKeys.length === 0) {
        return { added: 0, skipped: keys.length, total: keys.length }
    }

    await prisma.licenseKey.createMany({
        data: newKeys.map((k) => ({
            key: k,
            plan: planId,
            isUsed: false,
            isActive: true,
            maxUses: 1,
        })),
        skipDuplicates: true,
    })

    revalidatePath("/dashboard/moderator")
    revalidatePath("/reseller")
    return { added: newKeys.length, skipped: keys.length - newKeys.length, total: keys.length }
}

export async function generateStock(planId: string, count: number) {
    await requireAdmin()
    if (!isValidPlan(planId)) throw new Error("Invalid plan.")
    if (!Number.isInteger(count) || count <= 0) throw new Error("Count must be a positive integer.")
    if (count > 500) throw new Error("Generate at most 500 keys at a time.")

    // Build N unique keys, retrying on collision
    const keys = new Set<string>()
    while (keys.size < count) {
        keys.add(generateLicenseKey())
    }

    await prisma.licenseKey.createMany({
        data: Array.from(keys).map((k) => ({
            key: k,
            plan: planId,
            isUsed: false,
            isActive: true,
            maxUses: 1,
        })),
        skipDuplicates: true,
    })

    revalidatePath("/dashboard/moderator")
    revalidatePath("/reseller")
    return { added: count }
}

/** Wipe all unclaimed stock for a plan (does NOT touch claimed/redeemed keys). */
export async function clearStock(planId: string) {
    await requireAdmin()
    if (!isValidPlan(planId)) throw new Error("Invalid plan.")

    const result = await prisma.licenseKey.deleteMany({
        where: {
            plan: planId,
            resellerId: null,
            userId: null,
            isUsed: false,
        },
    })

    revalidatePath("/dashboard/moderator")
    revalidatePath("/reseller")
    return { removed: result.count }
}
