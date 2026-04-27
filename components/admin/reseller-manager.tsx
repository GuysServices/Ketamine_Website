"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Coins, ShieldCheck, ShieldX, Plus, Minus, StickyNote, History, Trophy, RotateCcw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
    topUpReseller,
    deductCredits,
    setResellerActive,
    updateResellerNotes,
    setResellerTier,
} from "@/app/actions/admin-resellers"
import { ResellerLeaderboard } from "@/components/admin/reseller-leaderboard"
import { BulkAirdrop } from "@/components/admin/bulk-airdrop"
import { TIERS, TIER_LIST, type Tier } from "@/lib/reseller-plans"

export interface ResellerRow {
    id: string
    discordId: string
    username: string
    avatar: string | null
    credits: number
    totalSpent: number
    isActive: boolean
    notes: string | null
    tier: string
    manualTier: boolean
    createdAt: string
    keyCount: number
    redeemedCount: number
}

function ResellerCard({ reseller }: { reseller: ResellerRow }) {
    const [isPending, startTransition] = useTransition()
    const [topUpAmount, setTopUpAmount] = useState("")
    const [topUpNote, setTopUpNote] = useState("")
    const [notes, setNotes] = useState(reseller.notes ?? "")
    const [showLedger, setShowLedger] = useState(false)

    const onTopUp = (delta: number) => {
        const amount = parseInt(topUpAmount, 10)
        if (!Number.isFinite(amount) || amount <= 0) {
            toast({ title: "Invalid amount", description: "Enter a whole number of credits.", variant: "destructive" })
            return
        }
        startTransition(async () => {
            try {
                if (delta > 0) {
                    await topUpReseller(reseller.id, amount, topUpNote || undefined)
                    toast({ title: "Credits added", description: `+${amount} credits to ${reseller.username}.` })
                } else {
                    await deductCredits(reseller.id, amount, topUpNote || undefined)
                    toast({ title: "Credits removed", description: `-${amount} credits from ${reseller.username}.` })
                }
                setTopUpAmount("")
                setTopUpNote("")
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" })
            }
        })
    }

    const onToggleActive = () => {
        startTransition(async () => {
            try {
                await setResellerActive(reseller.id, !reseller.isActive)
                toast({
                    title: reseller.isActive ? "Suspended" : "Reactivated",
                    description: reseller.username,
                })
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" })
            }
        })
    }

    const onSaveNotes = () => {
        startTransition(async () => {
            try {
                await updateResellerNotes(reseller.id, notes)
                toast({ title: "Notes saved" })
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" })
            }
        })
    }

    return (
        <Card className={`bg-slate-900/50 border-white/10 ${!reseller.isActive ? "opacity-60" : ""}`}>
            <CardContent className="p-5 space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {reseller.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={reseller.avatar} alt={reseller.username} className="h-12 w-12 rounded-full border border-[#5865F2]/40" />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center font-bold">
                                {reseller.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-lg">{reseller.username}</h4>
                                {(() => {
                                    const tc = TIERS[(reseller.tier as Tier) || "bronze"]
                                    return (
                                        <Badge variant="outline" className={`text-xs ${tc.badgeClass}`}>
                                            <Trophy className="h-3 w-3 mr-1" /> {tc.label}
                                            {reseller.manualTier && <span className="ml-1 opacity-60">(manual)</span>}
                                        </Badge>
                                    )
                                })()}
                                {reseller.isActive ? (
                                    <Badge variant="outline" className="border-green-500/40 text-green-400 text-xs">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-red-500/40 text-red-400 text-xs">
                                        Suspended
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">{reseller.discordId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="flex items-center gap-2 text-2xl font-bold">
                                <Coins className="h-5 w-5 text-amber-400" />
                                {reseller.credits}
                            </div>
                            <p className="text-xs text-muted-foreground">credits</p>
                        </div>
                    </div>
                </div>

                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3 text-center text-sm border-y border-white/5 py-3">
                    <div>
                        <div className="font-bold">{reseller.keyCount}</div>
                        <div className="text-xs text-muted-foreground">Keys minted</div>
                    </div>
                    <div>
                        <div className="font-bold text-green-400">{reseller.redeemedCount}</div>
                        <div className="text-xs text-muted-foreground">Redeemed</div>
                    </div>
                    <div>
                        <div className="font-bold text-amber-400">{reseller.totalSpent}</div>
                        <div className="text-xs text-muted-foreground">Lifetime spent</div>
                    </div>
                </div>

                {/* Top-up controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Adjust credits</Label>
                        <Input
                            type="number"
                            min={1}
                            placeholder="Amount"
                            value={topUpAmount}
                            onChange={(e) => setTopUpAmount(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Note (optional)</Label>
                        <Input
                            placeholder="e.g. Paid $50 via PayPal"
                            value={topUpNote}
                            onChange={(e) => setTopUpNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => onTopUp(1)} disabled={isPending} className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onTopUp(-1)} disabled={isPending}>
                            <Minus className="h-4 w-4 mr-1" /> Deduct
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowLedger((v) => !v)}>
                            <History className="h-4 w-4 mr-1" /> {showLedger ? "Hide" : "Notes"}
                        </Button>
                        <Button
                            size="sm"
                            variant={reseller.isActive ? "destructive" : "default"}
                            onClick={onToggleActive}
                            disabled={isPending}
                        >
                            {reseller.isActive ? (
                                <>
                                    <ShieldX className="h-4 w-4 mr-1" /> Suspend
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4 mr-1" /> Reactivate
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Tier override controls */}
                <div className="pt-2 border-t border-white/5">
                    <Label className="text-xs flex items-center gap-2 mb-2">
                        <Trophy className="h-3 w-3" /> Override tier
                    </Label>
                    <div className="flex gap-1 flex-wrap">
                        {TIER_LIST.map((t) => {
                            const isActive = reseller.tier === t.id && reseller.manualTier
                            return (
                                <Button
                                    key={t.id}
                                    size="sm"
                                    variant={isActive ? "default" : "outline"}
                                    onClick={() => {
                                        startTransition(async () => {
                                            try {
                                                await setResellerTier(reseller.id, t.id)
                                                toast({ title: `Set to ${t.label}` })
                                            } catch (e: any) {
                                                toast({ title: "Error", description: e.message, variant: "destructive" })
                                            }
                                        })
                                    }}
                                    disabled={isPending}
                                    className="text-xs"
                                >
                                    {t.label}
                                </Button>
                            )
                        })}
                        {reseller.manualTier && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    startTransition(async () => {
                                        try {
                                            await setResellerTier(reseller.id, null)
                                            toast({ title: "Reverted to auto" })
                                        } catch (e: any) {
                                            toast({ title: "Error", description: e.message, variant: "destructive" })
                                        }
                                    })
                                }}
                                disabled={isPending}
                                className="text-xs"
                            >
                                <RotateCcw className="h-3 w-3 mr-1" /> Auto
                            </Button>
                        )}
                    </div>
                </div>

                {/* Admin notes */}
                {showLedger && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                        <Label className="text-xs flex items-center gap-2">
                            <StickyNote className="h-3 w-3" /> Private admin notes
                        </Label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Anything you want to remember about this reseller..."
                            rows={3}
                            className="w-full rounded-md border border-white/10 bg-black/40 p-2 text-sm focus:outline-none focus:border-primary/50"
                        />
                        <Button size="sm" onClick={onSaveNotes} disabled={isPending}>
                            Save notes
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export function ResellerManager({ resellers }: { resellers: ResellerRow[] }) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-2xl font-bold">Resellers</h3>
                <p className="text-sm text-muted-foreground">
                    Resellers auto-provision when they first log in via Discord. Top up their credits here after they pay you.
                </p>
            </div>

            {resellers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                    <p className="text-muted-foreground">No resellers yet. They'll show up here after their first Discord login.</p>
                </div>
            ) : (
                <>
                    <ResellerLeaderboard resellers={resellers} />
                    <BulkAirdrop />
                    <div className="space-y-3">
                        {resellers.map((r) => (
                            <ResellerCard key={r.id} reseller={r} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
