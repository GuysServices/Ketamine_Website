import { Calendar, CalendarDays, CalendarRange, Infinity as InfinityIcon, type LucideIcon } from "lucide-react"

export type PlanId = "daily" | "weekly" | "monthly" | "lifetime"

export interface PlanConfig {
    id: PlanId
    label: string
    description: string
    durationDays: number | null // null = lifetime
    customerPrice: number // USD
    creditsCost: number // 1 credit = $1, 40% off customer price (rounded)
    Icon: LucideIcon
    color: string
}

export type Tier = "bronze" | "silver" | "gold"

export interface TierConfig {
    id: Tier
    label: string
    description: string
    color: string
    glowClass: string
    badgeClass: string
    /** Threshold of `totalSpent` (lifetime credits spent) needed to auto-promote to this tier. */
    promoteAt: number
    /** Discount percentage off customer price (visual/marketing only). */
    discountPercent: number
}

export const TIERS: Record<Tier, TierConfig> = {
    bronze: {
        id: "bronze",
        label: "Bronze",
        description: "Default tier — 40% off retail",
        color: "#cd7f32",
        glowClass: "text-orange-400",
        badgeClass: "bg-orange-500/15 text-orange-300 border-orange-500/40",
        promoteAt: 0,
        discountPercent: 40,
    },
    silver: {
        id: "silver",
        label: "Silver",
        description: "50% off — earned at 100 lifetime credits spent",
        color: "#c0c0c0",
        glowClass: "text-slate-300",
        badgeClass: "bg-slate-400/15 text-slate-200 border-slate-400/40",
        promoteAt: 100,
        discountPercent: 50,
    },
    gold: {
        id: "gold",
        label: "Gold",
        description: "60% off — earned at 500 lifetime credits spent",
        color: "#ffd700",
        glowClass: "text-amber-400",
        badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/40",
        promoteAt: 500,
        discountPercent: 60,
    },
}

export const TIER_LIST: TierConfig[] = ["bronze", "silver", "gold"].map((id) => TIERS[id as Tier])

export function isValidTier(t: string): t is Tier {
    return t in TIERS
}

/** Returns the tier a reseller should be in given their lifetime spend. */
export function tierForSpend(totalSpent: number): Tier {
    if (totalSpent >= TIERS.gold.promoteAt) return "gold"
    if (totalSpent >= TIERS.silver.promoteAt) return "silver"
    return "bronze"
}

/**
 * Per-tier credit cost for each plan. Bronze is the base; Silver/Gold get
 * progressively cheaper. We round to nice whole-credit numbers.
 */
const TIER_PRICING: Record<Tier, Record<PlanId, number>> = {
    bronze: { daily: 1, weekly: 3, monthly: 5, lifetime: 9 },
    silver: { daily: 1, weekly: 2, monthly: 4, lifetime: 8 },
    gold: { daily: 1, weekly: 2, monthly: 3, lifetime: 6 },
}

export function getCreditsCost(planId: PlanId, tier: Tier = "bronze"): number {
    return TIER_PRICING[tier]?.[planId] ?? TIER_PRICING.bronze[planId]
}

export const PLANS: Record<PlanId, PlanConfig> = {
    daily: {
        id: "daily",
        label: "1 Day",
        description: "24 hour access",
        durationDays: 1,
        customerPrice: 2,
        creditsCost: 1,
        Icon: Calendar,
        color: "text-emerald-400",
    },
    weekly: {
        id: "weekly",
        label: "7 Days",
        description: "Week-long access",
        durationDays: 7,
        customerPrice: 5,
        creditsCost: 3,
        Icon: CalendarDays,
        color: "text-blue-400",
    },
    monthly: {
        id: "monthly",
        label: "30 Days",
        description: "Full month access",
        durationDays: 30,
        customerPrice: 8,
        creditsCost: 5,
        Icon: CalendarRange,
        color: "text-purple-400",
    },
    lifetime: {
        id: "lifetime",
        label: "Lifetime",
        description: "Forever access",
        durationDays: null,
        customerPrice: 15,
        creditsCost: 9,
        Icon: InfinityIcon,
        color: "text-amber-400",
    },
}

export const PLAN_LIST: PlanConfig[] = ["daily", "weekly", "monthly", "lifetime"].map(
    (id) => PLANS[id as PlanId],
)

export function isValidPlan(id: string): id is PlanId {
    return id in PLANS
}

/** Refund window: keys can be refunded within 1 hour if unredeemed. */
export const REFUND_WINDOW_MS = 60 * 60 * 1000

/** Generate a human-readable license key like KETA-XXXX-XXXX-XXXX */
export function generateLicenseKey(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    const segment = () =>
        Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    return `KETA-${segment()}-${segment()}-${segment()}`
}
