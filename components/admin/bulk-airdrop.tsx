"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gift, Coins } from "lucide-react"
import { TIER_LIST } from "@/lib/reseller-plans"
import { bulkAirdrop } from "@/app/actions/admin-resellers"
import { toast } from "@/components/ui/use-toast"

const TARGETS: Array<{ id: "all" | "bronze" | "silver" | "gold"; label: string }> = [
    { id: "all", label: "All Resellers" },
    { id: "bronze", label: "Bronze" },
    { id: "silver", label: "Silver" },
    { id: "gold", label: "Gold" },
]

export function BulkAirdrop() {
    const [target, setTarget] = useState<"all" | "bronze" | "silver" | "gold">("all")
    const [amount, setAmount] = useState("")
    const [note, setNote] = useState("")
    const [isPending, startTransition] = useTransition()

    const onAirdrop = () => {
        const n = parseInt(amount, 10)
        if (!Number.isFinite(n) || n <= 0) {
            toast({ title: "Invalid amount", variant: "destructive" })
            return
        }
        const targetLabel = TARGETS.find((t) => t.id === target)?.label ?? target
        if (!confirm(`Give ${n} credits to every active reseller in "${targetLabel}"?`)) return

        startTransition(async () => {
            try {
                const res = await bulkAirdrop({ targetTier: target, amount: n, note: note || undefined })
                toast({
                    title: "Airdrop complete",
                    description: `Sent ${n} credits to ${res.count} reseller${res.count === 1 ? "" : "s"} (${res.total} total).`,
                })
                setAmount("")
                setNote("")
            } catch (e: any) {
                toast({ title: "Failed", description: e.message, variant: "destructive" })
            }
        })
    }

    return (
        <Card className="bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-purple-500/20">
            <CardContent className="p-5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Gift className="h-5 w-5 text-purple-400" />
                        Bulk Credit Airdrop
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Drop credits into every active reseller in a tier. They'll all get a Discord DM receipt.
                    </p>
                </div>

                <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Target</Label>
                        <div className="grid grid-cols-2 gap-1">
                            {TARGETS.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTarget(t.id)}
                                    className={`px-2 py-1.5 rounded-md text-xs font-semibold transition ${target === t.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-white/5 hover:bg-white/10"}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Credits per reseller</Label>
                        <Input
                            type="number"
                            min={1}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 10"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Note (optional)</Label>
                        <Input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Holiday bonus"
                        />
                    </div>
                </div>

                <Button
                    onClick={onAirdrop}
                    disabled={isPending || !amount}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                >
                    <Coins className="h-4 w-4 mr-2" />
                    {isPending ? "Airdropping..." : `Airdrop ${amount || "?"} credits`}
                </Button>
            </CardContent>
        </Card>
    )
}
