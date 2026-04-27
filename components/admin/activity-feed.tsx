"use client"

import { useEffect, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Minus,
    RefreshCw,
    Settings,
    CheckCircle2,
    Activity as ActivityIcon,
    User,
} from "lucide-react"
import { getRecentActivity, type ActivityEntry } from "@/app/actions/admin-activity"

const TYPE_META: Record<
    ActivityEntry["type"],
    { label: string; Icon: any; color: string; bg: string }
> = {
    topup: { label: "Top-up", Icon: Plus, color: "text-green-400", bg: "bg-green-500/10" },
    spend: { label: "Claimed key", Icon: Minus, color: "text-amber-400", bg: "bg-amber-500/10" },
    refund: { label: "Refund", Icon: RefreshCw, color: "text-blue-400", bg: "bg-blue-500/10" },
    adjustment: { label: "Adjusted", Icon: Settings, color: "text-purple-400", bg: "bg-purple-500/10" },
    redeem: { label: "Customer redeemed", Icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
}

function timeAgo(iso: string) {
    const ms = Date.now() - new Date(iso).getTime()
    const secs = Math.floor(ms / 1000)
    if (secs < 60) return `${secs}s ago`
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export function ActivityFeed({ initialEntries }: { initialEntries: ActivityEntry[] }) {
    const [entries, setEntries] = useState<ActivityEntry[]>(initialEntries)
    const [isPending, startTransition] = useTransition()
    const [lastRefresh, setLastRefresh] = useState(Date.now())
    const [autoRefresh, setAutoRefresh] = useState(true)

    const refresh = () => {
        startTransition(async () => {
            try {
                const fresh = await getRecentActivity(50)
                setEntries(fresh)
                setLastRefresh(Date.now())
            } catch {
                // ignore — will retry next interval
            }
        })
    }

    // Auto-refresh every 15s
    useEffect(() => {
        if (!autoRefresh) return
        const interval = setInterval(refresh, 15_000)
        return () => clearInterval(interval)
    }, [autoRefresh])

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                        <ActivityIcon className="h-6 w-6 text-blue-400" />
                        Activity Feed
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Real-time stream of reseller actions across the system.
                        {autoRefresh && " Auto-refreshes every 15 seconds."}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        className={autoRefresh ? "border-green-500/40 text-green-400" : "border-white/20"}
                    >
                        <span className={`inline-block h-2 w-2 rounded-full mr-2 ${autoRefresh ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
                        {autoRefresh ? "Live" : "Paused"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setAutoRefresh((v) => !v)}>
                        {autoRefresh ? "Pause" : "Resume"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={refresh} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 mr-1 ${isPending ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {entries.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-muted-foreground">
                        No activity yet. As resellers top up, generate keys, or get redemptions, events will appear here.
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-2">
                        <div className="divide-y divide-white/5">
                            {entries.map((e) => {
                                const meta = TYPE_META[e.type] ?? TYPE_META.adjustment
                                const Icon = meta.Icon
                                return (
                                    <div
                                        key={e.id}
                                        className="flex items-center gap-4 py-3 px-3 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg ${meta.bg} ${meta.color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        {/* Reseller avatar + name */}
                                        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                            {e.reseller.avatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={e.reseller.avatar}
                                                    alt={e.reseller.username}
                                                    className="h-7 w-7 rounded-full border border-white/10"
                                                />
                                            ) : (
                                                <div className="h-7 w-7 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-xs font-bold">
                                                    {e.reseller.username.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-semibold text-sm truncate max-w-[140px]">
                                                {e.reseller.username}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm truncate">
                                                <span className={`font-medium ${meta.color}`}>{meta.label}</span>
                                                {e.note && <span className="text-muted-foreground"> — {e.note}</span>}
                                            </div>
                                            {e.redeemedBy && (
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <User className="h-3 w-3" />
                                                    {e.redeemedBy.username}
                                                    {e.redeemedBy.robloxUsername && (
                                                        <span className="text-muted-foreground/70">
                                                            ({e.redeemedBy.robloxUsername})
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Delta + timestamp */}
                                        <div className="text-right flex-shrink-0">
                                            {e.delta !== 0 && (
                                                <div className={`font-bold text-sm ${e.delta > 0 ? "text-green-400" : "text-amber-400"}`}>
                                                    {e.delta > 0 ? "+" : ""}
                                                    {e.delta}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                {timeAgo(e.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <p className="text-xs text-muted-foreground text-right">
                Last refreshed {timeAgo(new Date(lastRefresh).toISOString())}
            </p>
        </div>
    )
}
