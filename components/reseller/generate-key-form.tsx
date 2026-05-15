"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, Sparkles, Copy, Check, Package } from "lucide-react"
import { PLAN_LIST, getCreditsCost, type PlanId, type Tier } from "@/lib/reseller-plans"
import { generateKeysBulk } from "@/app/actions/reseller"
import { toast } from "@/components/ui/use-toast"

const BULK_OPTIONS = [1, 5, 10, 25]

export function GenerateKeyForm({
    initialCredits,
    stockCounts,
    tier,
}: {
    initialCredits: number
    stockCounts: Record<string, number>
    tier: Tier
}) {
    const [isPending, startTransition] = useTransition()
    const [credits, setCredits] = useState(initialCredits)
    const [stock, setStock] = useState(stockCounts)
    const [selected, setSelected] = useState<PlanId>("monthly")
    const [quantity, setQuantity] = useState(1)
    const [lastKeys, setLastKeys] = useState<{ keys: string[]; plan: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const plan = PLAN_LIST.find((p) => p.id === selected)!
    const planStock = stock[plan.id] ?? 0
    const costPerKey = getCreditsCost(plan.id, tier)
    const totalCost = costPerKey * quantity
    const canAfford = credits >= totalCost
    const enoughStock = planStock >= quantity
    const canGenerate = canAfford && enoughStock

    const onGenerate = () => {
        startTransition(async () => {
            try {
                const res = await generateKeysBulk(selected, quantity)
                setCredits(res.newBalance)
                setStock((s) => ({ ...s, [plan.id]: Math.max(0, (s[plan.id] ?? 0) - quantity) }))
                setLastKeys({ keys: res.keys, plan: plan.label })
                setCopied(false)
                if (res.promoted) {
                    toast({
                        title: "\u{1F389} Tier upgraded!",
                        description: `You're now ${res.newTier.toUpperCase()} tier. Future keys will be cheaper!`,
                    })
                } else {
                    toast({
                        title: quantity === 1 ? "Key claimed" : `${quantity} keys claimed`,
                        description: `${plan.label} ready.`,
                    })
                }
            } catch (e: any) {
                toast({ title: "Failed", description: e.message, variant: "destructive" })
            }
        })
    }

    const onCopy = () => {
        if (!lastKeys) return
        navigator.clipboard.writeText(lastKeys.keys.join("\n"))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="bg-gradient-to-br from-amber-500/5 to-purple-500/5 border-amber-500/20">
            <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            Generate License Key
                        </h3>
                        <p className="text-sm text-muted-foreground">Pick a plan, spend credits, get a key.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
                        <Coins className="h-4 w-4 text-amber-400" />
                        <span className="font-bold text-amber-400">{credits} credits</span>
                    </div>
                </div>

                {/* Plan selection grid */}
                <div className="grid grid-cols-2 gap-3">
                    {PLAN_LIST.filter((p) => p.id === "monthly" || p.id === "lifetime").map((p) => {
                        const Icon = p.Icon
                        const active = selected === p.id
                        const planCost = getCreditsCost(p.id, tier)
                        const affordable = credits >= planCost
                        const pStock = stock[p.id] ?? 0
                        const outOfStock = pStock === 0
                        const dimmed = !affordable || outOfStock
                        const isBronzePrice = planCost === p.creditsCost
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelected(p.id)}
                                className={`relative p-4 rounded-xl border text-left transition-all ${active
                                    ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                                    : "bg-white/5 border-white/10 hover:bg-white/10"
                                    } ${dimmed ? "opacity-60" : ""}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Icon className={`h-5 w-5 ${p.color}`} />
                                    <span className="text-xs text-muted-foreground">${p.customerPrice}</span>
                                </div>
                                <div className="font-bold text-sm">{p.label}</div>
                                <div className="text-xs text-muted-foreground">{p.description}</div>
                                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <Coins className="h-3 w-3 text-amber-400" />
                                        <span className="font-semibold">{planCost}</span>
                                        {!isBronzePrice && (
                                            <span className="text-[9px] text-muted-foreground/70 line-through">
                                                {p.creditsCost}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-medium ${outOfStock ? "text-red-400" : pStock < 5 ? "text-amber-400" : "text-muted-foreground"}`}>
                                        {outOfStock ? "Out of stock" : `${pStock} in stock`}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Bulk quantity selector */}
                <div className="flex items-center gap-3 flex-wrap p-3 rounded-lg bg-white/5 border border-white/10">
                    <Package className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex gap-1">
                        {BULK_OPTIONS.map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => setQuantity(n)}
                                className={`px-3 py-1 rounded-md text-sm font-semibold transition ${quantity === n
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white/5 hover:bg-white/10"}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">
                        {totalCost} credits total
                    </span>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="text-sm text-muted-foreground">
                        After this, you'll have{" "}
                        <span className="font-semibold text-foreground">{Math.max(0, credits - totalCost)} credits</span> left.
                    </div>
                    <Button
                        onClick={onGenerate}
                        disabled={isPending || !canGenerate}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                    >
                        {isPending
                            ? "Generating..."
                            : !enoughStock
                                ? `Only ${planStock} in stock`
                                : !canAfford
                                    ? "Not enough credits"
                                    : quantity === 1
                                        ? `Generate ${plan.label} Key`
                                        : `Generate ${quantity}× ${plan.label} Keys`}
                    </Button>
                </div>

                {/* Last generated keys */}
                {lastKeys && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-400">
                                ✅ {lastKeys.keys.length}× {lastKeys.plan} key{lastKeys.keys.length === 1 ? "" : "s"} generated
                            </span>
                            <Button size="sm" variant="outline" onClick={onCopy}>
                                {copied ? <Check className="h-4 w-4 mr-1 text-green-400" /> : <Copy className="h-4 w-4 mr-1" />}
                                {copied ? "Copied" : `Copy${lastKeys.keys.length > 1 ? " all" : ""}`}
                            </Button>
                        </div>
                        <div className="font-mono text-sm bg-black/40 px-3 py-2 rounded border border-white/10 break-all max-h-48 overflow-y-auto whitespace-pre-line">
                            {lastKeys.keys.join("\n")}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
