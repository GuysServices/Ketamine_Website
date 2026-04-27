"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle2, Clock, User, AlertCircle } from "lucide-react"
import { lookupKey, type LookupResult } from "@/app/actions/reseller-lookup"

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

export function CustomerLookup() {
    const [keyInput, setKeyInput] = useState("")
    const [result, setResult] = useState<LookupResult | null>(null)
    const [isPending, startTransition] = useTransition()

    const onLookup = (e: React.FormEvent) => {
        e.preventDefault()
        if (!keyInput.trim()) return
        startTransition(async () => {
            const res = await lookupKey(keyInput)
            setResult(res)
        })
    }

    return (
        <Card>
            <CardContent className="p-5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-400" />
                        Lookup a Key
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Paste a key you sold to see who's using it. You can only look up your own keys.
                    </p>
                </div>

                <form onSubmit={onLookup} className="flex gap-2">
                    <Input
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="KETA-XXXX-XXXX-XXXX"
                        className="font-mono"
                    />
                    <Button type="submit" disabled={isPending || !keyInput.trim()}>
                        <Search className="h-4 w-4 mr-1" /> {isPending ? "Searching..." : "Lookup"}
                    </Button>
                </form>

                {result && !result.found && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-300">{result.error}</p>
                    </div>
                )}

                {result && result.found && (
                    <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="font-mono text-sm font-semibold break-all">{result.key}</div>
                            {result.isUsed ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/40 border">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Redeemed
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-blue-500/40 text-blue-400">
                                    <Clock className="h-3 w-3 mr-1" /> Unused
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                                <div className="text-xs text-muted-foreground">Plan</div>
                                <div className="font-medium">{result.planLabel ?? "—"}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Cost</div>
                                <div className="font-medium">{result.creditsCost} credits</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Created</div>
                                <div className="font-medium">{result.createdAt && timeAgo(result.createdAt)}</div>
                            </div>
                        </div>

                        {result.redeemedBy ? (
                            <div className="pt-3 border-t border-white/5 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="h-3 w-3" /> Redeemed by
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <div className="text-xs text-muted-foreground">Username</div>
                                        <div className="font-semibold">{result.redeemedBy.username}</div>
                                    </div>
                                    {result.redeemedBy.robloxUsername && (
                                        <div>
                                            <div className="text-xs text-muted-foreground">Roblox</div>
                                            <div className="font-medium">{result.redeemedBy.robloxUsername}</div>
                                        </div>
                                    )}
                                    {result.redeemedBy.discordId && (
                                        <div>
                                            <div className="text-xs text-muted-foreground">Discord ID</div>
                                            <div className="font-mono text-xs">{result.redeemedBy.discordId}</div>
                                        </div>
                                    )}
                                </div>
                                {result.lastUsedAt && (
                                    <div className="text-xs text-muted-foreground">
                                        Last used {timeAgo(result.lastUsedAt)}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="pt-3 border-t border-white/5 text-sm text-muted-foreground">
                                Nobody has redeemed this key yet.
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
