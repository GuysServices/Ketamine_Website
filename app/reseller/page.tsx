import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, LogOut, KeyRound, BarChart3, Coins, TrendingUp, AlertTriangle, Settings, Trophy } from "lucide-react"
import Link from "next/link"
import { TIERS, type Tier } from "@/lib/reseller-plans"
import { getResellerSession, userHasResellerRole } from "@/lib/reseller-auth"
import { prisma } from "@/lib/prisma"
import { GenerateKeyForm } from "@/components/reseller/generate-key-form"
import { MyKeysList, type MyKey } from "@/components/reseller/my-keys-list"
import { LedgerList, type LedgerEntry } from "@/components/reseller/ledger-list"
import { CustomerLookup } from "@/components/reseller/customer-lookup"
import { History } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ResellerDashboardPage() {
    const session = await getResellerSession()
    if (!session) redirect("/reseller/login")

    // Re-verify role on every request so revoked resellers are kicked out
    const stillHasRole = await userHasResellerRole(session.discordId)
    if (!stillHasRole) {
        redirect("/api/auth/discord/logout")
    }

    // Load reseller record + their keys
    const reseller = await prisma.reseller.findUnique({
        where: { discordId: session.discordId },
        include: {
            keys: {
                orderBy: { createdAt: "desc" },
                take: 100,
                include: { user: { select: { username: true } } },
            },
        },
    })

    if (!reseller) {
        // Edge case: shouldn't happen because callback auto-provisions, but be safe.
        redirect("/api/auth/discord/logout")
    }

    const myKeys: MyKey[] = reseller.keys.map((k: any) => ({
        id: k.id,
        key: k.key,
        plan: k.plan,
        creditsCost: k.creditsCost,
        isUsed: k.isUsed,
        createdAt: k.createdAt.toISOString(),
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
        redeemedByUsername: k.user?.username ?? null,
    }))

    const totalKeys = myKeys.length
    const redeemedKeys = myKeys.filter((k) => k.isUsed).length

    // Pull current stock counts (no auth required for the reseller's own portal —
    // we just count rows directly so we don't import requireAdmin)
    const stockGrouped = await prisma.licenseKey.groupBy({
        by: ["plan"],
        where: { plan: { not: null }, resellerId: null, userId: null, isUsed: false },
        _count: { _all: true },
    })
    const stockCounts: Record<string, number> = { daily: 0, weekly: 0, monthly: 0, lifetime: 0 }
    for (const g of stockGrouped) {
        if (g.plan) stockCounts[g.plan] = g._count._all
    }

    // Recent ledger entries (last 30)
    const ledgerRaw = await prisma.resellerLedger.findMany({
        where: { resellerId: reseller.id },
        orderBy: { createdAt: "desc" },
        take: 30,
    })
    const ledger: LedgerEntry[] = ledgerRaw.map((e: any) => ({
        id: e.id,
        delta: e.delta,
        reason: e.reason,
        note: e.note,
        balanceAfter: e.balanceAfter,
        createdAt: e.createdAt.toISOString(),
    }))

    const banner = reseller.bannerColor || null
    const displayName = reseller.displayName?.trim() || session.username

    // Build banner gradient style if a color is set
    const bannerStyle = banner
        ? {
            background: `linear-gradient(135deg, ${banner}33 0%, ${banner}11 50%, transparent 100%)`,
            borderColor: `${banner}66`,
        }
        : undefined

    return (
        <div
            className="min-h-screen p-4 md:p-8 transition-colors"
            style={banner ? { background: `radial-gradient(circle at top, ${banner}11 0%, transparent 60%), hsl(var(--background))` } : undefined}
        >
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header card with banner styling */}
                <Card
                    className={`border-2 transition-colors ${banner ? "" : "border-white/10"}`}
                    style={bannerStyle}
                >
                    <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        {session.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={session.avatar}
                                alt={displayName}
                                className="h-14 w-14 rounded-full border-2"
                                style={banner ? { borderColor: `${banner}99` } : { borderColor: "#5865F2aa" }}
                            />
                        ) : (
                            <div
                                className="h-14 w-14 rounded-full border-2 flex items-center justify-center text-xl font-bold"
                                style={banner
                                    ? { backgroundColor: `${banner}33`, borderColor: `${banner}99` }
                                    : { backgroundColor: "#5865F233", borderColor: "#5865F2aa" }}
                            >
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold">{displayName}</h1>
                                <Badge variant="outline" className="border-[#5865F2]/40 text-[#5865F2]">
                                    <ShieldCheck className="h-3 w-3 mr-1" /> Reseller
                                </Badge>
                                {(() => {
                                    const tierConfig = TIERS[(reseller.tier as Tier) || "bronze"]
                                    return (
                                        <Badge variant="outline" className={tierConfig.badgeClass}>
                                            <Trophy className="h-3 w-3 mr-1" /> {tierConfig.label}
                                        </Badge>
                                    )
                                })()}
                                {!reseller.isActive && (
                                    <Badge variant="outline" className="border-red-500/40 text-red-400">
                                        Suspended
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {reseller.displayName?.trim() ? <span className="text-foreground/70">{session.username} · </span> : null}
                                <span className="font-mono">{session.discordId}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/reseller/settings">
                                <Settings className="h-4 w-4 mr-2" /> Settings
                            </Link>
                        </Button>
                        <form action="/api/auth/discord/logout" method="post">
                            <Button variant="outline" type="submit">
                                <LogOut className="h-4 w-4 mr-2" /> Sign Out
                            </Button>
                        </form>
                    </div>
                    </CardContent>
                </Card>

                {/* Payment info card (if set) */}
                {reseller.paymentInfo && (
                    <Card style={banner ? { borderColor: `${banner}40` } : undefined}>
                        <CardContent className="p-4">
                            <p className="text-xs text-muted-foreground mb-1">Your customer-facing payment info</p>
                            <p className="text-sm whitespace-pre-wrap font-mono">{reseller.paymentInfo}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Suspended banner */}
                {!reseller.isActive && (
                    <Card className="bg-red-500/10 border-red-500/30">
                        <CardContent className="p-4 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-red-300">Your reseller account is suspended.</p>
                                <p className="text-sm text-muted-foreground">
                                    Existing keys will keep working for your customers, but you can't generate new ones. Contact an admin in Discord.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats strip */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <Coins className="h-3 w-3" /> Credits
                            </div>
                            <div className="text-2xl font-bold text-amber-400">{reseller.credits}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <KeyRound className="h-3 w-3" /> Keys minted
                            </div>
                            <div className="text-2xl font-bold">{totalKeys}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <BarChart3 className="h-3 w-3" /> Redeemed
                            </div>
                            <div className="text-2xl font-bold text-green-400">{redeemedKeys}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                                <TrendingUp className="h-3 w-3" /> Lifetime spent
                            </div>
                            <div className="text-2xl font-bold">{reseller.totalSpent}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Generate form (hidden if suspended) */}
                {reseller.isActive && (
                    <GenerateKeyForm
                        initialCredits={reseller.credits}
                        stockCounts={stockCounts}
                        tier={(reseller.tier as Tier) || "bronze"}
                    />
                )}

                {/* Customer lookup */}
                <CustomerLookup />

                {/* Two-column: keys + ledger */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-amber-400" />
                                My Keys
                            </h2>
                            <p className="text-sm text-muted-foreground">Latest 100</p>
                        </div>
                        <MyKeysList keys={myKeys} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <History className="h-5 w-5 text-blue-400" />
                                Activity
                            </h2>
                            <p className="text-sm text-muted-foreground">Last 30</p>
                        </div>
                        <LedgerList entries={ledger} />
                    </div>
                </div>
            </div>
        </div>
    )
}
