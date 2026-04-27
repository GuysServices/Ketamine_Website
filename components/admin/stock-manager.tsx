"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Plus, Sparkles, Clipboard, Trash2 } from "lucide-react"
import { PLAN_LIST, type PlanId } from "@/lib/reseller-plans"
import { addStockFromPaste, generateStock, clearStock } from "@/app/actions/admin-stock"
import { toast } from "@/components/ui/use-toast"

export function StockManager({ stockCounts }: { stockCounts: Record<string, number> }) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="h-6 w-6 text-amber-400" />
                    Reseller Stock
                </h3>
                <p className="text-sm text-muted-foreground">
                    Pre-load license keys into the stock pool. Resellers claim from the pool when they generate keys.
                </p>
            </div>

            {/* Per-plan stock cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {PLAN_LIST.map((p) => (
                    <PlanStockCard key={p.id} plan={p} count={stockCounts[p.id] ?? 0} />
                ))}
            </div>
        </div>
    )
}

function PlanStockCard({
    plan,
    count,
}: {
    plan: (typeof PLAN_LIST)[number]
    count: number
}) {
    const [isPending, startTransition] = useTransition()
    const [pasteText, setPasteText] = useState("")
    const [genCount, setGenCount] = useState("10")
    const Icon = plan.Icon

    const onPaste = () => {
        startTransition(async () => {
            try {
                const res = await addStockFromPaste(plan.id, pasteText)
                toast({
                    title: "Stock added",
                    description: `${res.added} added, ${res.skipped} skipped (duplicates).`,
                })
                setPasteText("")
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" })
            }
        })
    }

    const onGenerate = () => {
        const n = parseInt(genCount, 10)
        if (!Number.isFinite(n) || n <= 0) {
            toast({ title: "Invalid count", variant: "destructive" })
            return
        }
        startTransition(async () => {
            try {
                const res = await generateStock(plan.id, n)
                toast({ title: "Stock generated", description: `${res.added} ${plan.label} keys added.` })
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" })
            }
        })
    }

    const onClear = () => {
        if (count === 0) return
        if (!confirm(`Wipe all ${count} unclaimed ${plan.label} keys from stock? This cannot be undone. (Already-claimed/redeemed keys are NOT touched.)`)) {
            return
        }
        startTransition(async () => {
            try {
                const res = await clearStock(plan.id)
                toast({ title: "Stock cleared", description: `Removed ${res.removed} ${plan.label} keys.` })
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" })
            }
        })
    }

    return (
        <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/5 ${plan.color}`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold">{plan.label}</h4>
                            <p className="text-xs text-muted-foreground">${plan.customerPrice} · {plan.creditsCost} credits</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-3xl font-bold ${count === 0 ? "text-red-400" : count < 5 ? "text-amber-400" : "text-green-400"}`}>
                            {count}
                        </div>
                        <p className="text-xs text-muted-foreground">in stock</p>
                    </div>
                </div>

                <Tabs defaultValue="generate" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="generate" className="text-xs gap-1">
                            <Sparkles className="h-3 w-3" /> Generate
                        </TabsTrigger>
                        <TabsTrigger value="paste" className="text-xs gap-1">
                            <Clipboard className="h-3 w-3" /> Paste
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="space-y-2 pt-3">
                        <Label className="text-xs">Random key count</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min={1}
                                max={500}
                                value={genCount}
                                onChange={(e) => setGenCount(e.target.value)}
                                className="h-9"
                            />
                            <Button size="sm" onClick={onGenerate} disabled={isPending}>
                                <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Auto-generates KETA-XXXX-XXXX-XXXX format keys. Useful for testing.
                        </p>
                    </TabsContent>

                    <TabsContent value="paste" className="space-y-2 pt-3">
                        <Label className="text-xs">Paste keys (one per line)</Label>
                        <textarea
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            placeholder={`ABCD-1234-EFGH-5678\nWXYZ-9876-MNOP-5432\n...`}
                            rows={4}
                            className="w-full rounded-md border border-white/10 bg-black/40 p-2 text-xs font-mono focus:outline-none focus:border-primary/50"
                        />
                        <Button size="sm" onClick={onPaste} disabled={isPending || !pasteText.trim()} className="w-full">
                            <Plus className="h-4 w-4 mr-1" /> Add to Stock
                        </Button>
                        <p className="text-[10px] text-muted-foreground">
                            Useful for KeyAuth-issued keys. Duplicates are skipped automatically.
                        </p>
                    </TabsContent>
                </Tabs>

                {count > 0 && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClear}
                        disabled={isPending}
                        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <Trash2 className="h-3 w-3 mr-1" /> Clear all unclaimed stock
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
