"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, RefreshCw, CheckCircle2, Clock } from "lucide-react"
import { PLANS, REFUND_WINDOW_MS, type PlanId } from "@/lib/reseller-plans"
import { refundKey } from "@/app/actions/reseller"
import { toast } from "@/components/ui/use-toast"

export interface MyKey {
    id: string
    key: string
    plan: string | null
    creditsCost: number
    isUsed: boolean
    createdAt: string
    lastUsedAt: string | null
    redeemedByUsername: string | null
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

export function MyKeysList({ keys }: { keys: MyKey[] }) {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const onCopy = (k: MyKey) => {
        navigator.clipboard.writeText(k.key)
        setCopiedId(k.id)
        setTimeout(() => setCopiedId((cur) => (cur === k.id ? null : cur)), 2000)
    }

    const onRefund = (k: MyKey) => {
        if (!confirm(`Refund this ${k.plan} key? You'll get ${k.creditsCost} credits back.`)) return
        startTransition(async () => {
            try {
                await refundKey(k.id)
                toast({ title: "Refunded", description: `+${k.creditsCost} credits returned.` })
            } catch (e: any) {
                toast({ title: "Cannot refund", description: e.message, variant: "destructive" })
            }
        })
    }

    if (keys.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                <p className="text-muted-foreground">No keys generated yet. Use the form above to mint your first one.</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {keys.map((k) => {
                const plan = k.plan && k.plan in PLANS ? PLANS[k.plan as PlanId] : null
                const ageMs = Date.now() - new Date(k.createdAt).getTime()
                const refundable = !k.isUsed && ageMs < REFUND_WINDOW_MS
                const PlanIcon = plan?.Icon

                return (
                    <div
                        key={k.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex-wrap"
                    >
                        {plan && PlanIcon && (
                            <div className={`p-2 rounded-lg bg-white/5 ${plan.color}`}>
                                <PlanIcon className="h-4 w-4" />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-semibold truncate">{k.key}</span>
                                {plan && (
                                    <Badge variant="outline" className="text-xs">
                                        {plan.label}
                                    </Badge>
                                )}
                                {k.isUsed ? (
                                    <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/40 border">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Redeemed
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-400">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Unused
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                                Created {timeAgo(k.createdAt)} · {k.creditsCost} credits
                                {k.isUsed && k.redeemedByUsername && (
                                    <> · Redeemed by <span className="text-foreground font-semibold">{k.redeemedByUsername}</span></>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => onCopy(k)}>
                                {copiedId === k.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            {refundable && (
                                <Button size="sm" variant="ghost" onClick={() => onRefund(k)} disabled={isPending} className="text-amber-400 hover:text-amber-300">
                                    <RefreshCw className="h-4 w-4 mr-1" /> Refund
                                </Button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
