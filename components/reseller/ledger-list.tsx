"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus, Minus, RefreshCw, Settings, History } from "lucide-react"

export interface LedgerEntry {
    id: string
    delta: number
    reason: string
    note: string | null
    balanceAfter: number
    createdAt: string
}

const REASON_META: Record<string, { label: string; Icon: any; color: string }> = {
    topup: { label: "Top-up", Icon: Plus, color: "text-green-400" },
    spend: { label: "Spend", Icon: Minus, color: "text-amber-400" },
    refund: { label: "Refund", Icon: RefreshCw, color: "text-blue-400" },
    adjustment: { label: "Adjustment", Icon: Settings, color: "text-purple-400" },
}

function timeAgo(iso: string) {
    const ms = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(ms / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export function LedgerList({ entries, compact = false }: { entries: LedgerEntry[]; compact?: boolean }) {
    if (entries.length === 0) {
        return (
            <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-white/10 rounded-xl">
                No activity yet.
            </div>
        )
    }

    return (
        <Card>
            <CardContent className={compact ? "p-3" : "p-4"}>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                    {entries.map((e) => {
                        const meta = REASON_META[e.reason] ?? { label: e.reason, Icon: History, color: "text-muted-foreground" }
                        const Icon = meta.Icon
                        const isPositive = e.delta > 0
                        return (
                            <div key={e.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className={`p-1.5 rounded-md bg-white/5 ${meta.color}`}>
                                    <Icon className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{e.note || meta.label}</div>
                                    <div className="text-[10px] text-muted-foreground">{timeAgo(e.createdAt)}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-bold text-sm ${isPositive ? "text-green-400" : "text-amber-400"}`}>
                                        {isPositive ? "+" : ""}
                                        {e.delta}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">→ {e.balanceAfter}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
