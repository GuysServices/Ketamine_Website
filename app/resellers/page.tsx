import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Trophy, Users, Sparkles, Coins, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { TIERS, type Tier } from "@/lib/reseller-plans"

export const dynamic = "force-dynamic"
export const metadata = {
    title: "Active Resellers — Ketamine",
    description: "Browse our official resellers. Buy keys directly from a verified seller.",
}

function timeAgo(iso: string) {
    const ms = Date.now() - new Date(iso).getTime()
    const days = Math.floor(ms / 86400000)
    if (days < 1) return "today"
    if (days === 1) return "1 day ago"
    if (days < 30) return `${days} days ago`
    const months = Math.floor(days / 30)
    if (months === 1) return "1 month ago"
    if (months < 12) return `${months} months ago`
    const years = Math.floor(months / 12)
    return `${years}y ago`
}

const TIER_ORDER: Record<string, number> = { gold: 0, silver: 1, bronze: 2 }

export default async function PublicResellersPage() {
    const raw = await prisma.reseller.findMany({
        where: { isActive: true },
        include: {
            keys: { select: { isUsed: true } },
        },
    })

    // Sort: by tier (gold first), then by redemption count desc
    const resellers = raw
        .map((r: any) => ({
            id: r.id,
            username: r.username,
            displayName: r.displayName,
            avatar: r.avatar,
            bannerColor: r.bannerColor,
            paymentInfo: r.paymentInfo,
            tier: (r.tier as string) ?? "bronze",
            keyCount: r.keys.length,
            redeemedCount: r.keys.filter((k: any) => k.isUsed).length,
            createdAt: r.createdAt.toISOString(),
        }))
        .sort((a: any, b: any) => {
            const tierDiff = (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99)
            if (tierDiff !== 0) return tierDiff
            return b.redeemedCount - a.redeemedCount
        })

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back to home
                        </Link>
                    </Button>

                    <div className="text-center space-y-3 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-sm">
                            <Users className="h-4 w-4 text-[#5865F2]" />
                            <span className="font-medium">Verified Resellers</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Buy from an Official Reseller
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These are our verified resellers. They sell legitimate keys at competitive prices.
                            Click their name to see how to contact them.
                        </p>
                    </div>
                </div>

                {/* Counts strip */}
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    {(["gold", "silver", "bronze"] as Tier[]).map((t) => {
                        const count = resellers.filter((r) => r.tier === t).length
                        const tc = TIERS[t]
                        return (
                            <Card key={t} className="text-center">
                                <CardContent className="p-3">
                                    <Trophy className={`h-4 w-4 mx-auto mb-1 ${tc.glowClass}`} />
                                    <div className="text-lg font-bold">{count}</div>
                                    <div className="text-xs text-muted-foreground">{tc.label}</div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Reseller grid */}
                {resellers.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No active resellers right now. Check back soon.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {resellers.map((r) => {
                            const tc = TIERS[(r.tier as Tier) || "bronze"]
                            const banner = r.bannerColor || null
                            const name = r.displayName?.trim() || r.username

                            return (
                                <Card
                                    key={r.id}
                                    className="overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-xl"
                                    style={banner ? { borderColor: `${banner}55` } : undefined}
                                >
                                    {/* Banner strip */}
                                    <div
                                        className="h-20 relative"
                                        style={{
                                            background: banner
                                                ? `linear-gradient(135deg, ${banner}cc 0%, ${banner}55 100%)`
                                                : "linear-gradient(135deg, hsl(var(--muted)) 0%, transparent 100%)",
                                        }}
                                    >
                                        {/* Tier badge top-right */}
                                        <div className="absolute top-2 right-2">
                                            <Badge variant="outline" className={`${tc.badgeClass} backdrop-blur-sm`}>
                                                <Trophy className="h-3 w-3 mr-1" /> {tc.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardContent className="p-5 -mt-10 relative">
                                        {/* Avatar overlapping banner */}
                                        <div className="flex items-end justify-between mb-3">
                                            {r.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={r.avatar}
                                                    alt={name}
                                                    className="h-16 w-16 rounded-full border-4 border-background"
                                                />
                                            ) : (
                                                <div
                                                    className="h-16 w-16 rounded-full border-4 border-background flex items-center justify-center text-xl font-bold"
                                                    style={{
                                                        backgroundColor: banner
                                                            ? `${banner}33`
                                                            : "hsl(var(--muted))",
                                                    }}
                                                >
                                                    {name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-lg truncate">{name}</h3>
                                                <ShieldCheck className="h-4 w-4 text-[#5865F2] flex-shrink-0" />
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    {r.redeemedCount} sold
                                                </span>
                                                <span>·</span>
                                                <span>Active since {timeAgo(r.createdAt)}</span>
                                            </div>

                                            {/* Payment info */}
                                            {r.paymentInfo && (
                                                <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                                        How to buy
                                                    </p>
                                                    <p className="text-xs whitespace-pre-wrap font-mono break-words">
                                                        {r.paymentInfo}
                                                    </p>
                                                </div>
                                            )}
                                            {!r.paymentInfo && (
                                                <p className="text-xs text-muted-foreground italic mt-3">
                                                    Contact this reseller in our Discord server.
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* CTA footer */}
                <Card className="bg-gradient-to-br from-[#5865F2]/10 to-purple-500/5 border-[#5865F2]/30">
                    <CardContent className="p-6 text-center space-y-2">
                        <Coins className="h-6 w-6 text-amber-400 mx-auto" />
                        <h3 className="text-lg font-bold">Want to become a reseller?</h3>
                        <p className="text-sm text-muted-foreground">
                            Earn up to 60% off retail and resell keys to your community. Apply in our Discord server.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
