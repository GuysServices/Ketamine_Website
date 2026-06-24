import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Coins, KeyRound } from "lucide-react"

export interface LeaderboardRow {
    id: string
    discordId: string
    username: string
    avatar: string | null
    totalSpent: number
    keyCount: number
    redeemedCount: number
}

const MEDAL_COLORS = ["text-amber-400", "text-slate-300", "text-orange-400"]

export function ResellerLeaderboard({ resellers }: { resellers: LeaderboardRow[] }) {
    const top = resellers
        .filter((r) => r.totalSpent > 0 || r.keyCount > 0)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5)

    if (top.length === 0) return null

    return (
        <Card className="bg-gradient-to-br from-amber-500/5 to-purple-500/5 border-amber-500/20">
            <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <h3 className="text-lg font-bold">Top Resellers</h3>
                    <span className="text-xs text-muted-foreground ml-auto">By lifetime spend</span>
                </div>

                <div className="space-y-2">
                    {top.map((r, i) => (
                        <div
                            key={r.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5"
                        >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold ${MEDAL_COLORS[i] ?? "text-muted-foreground"}`}>
                                #{i + 1}
                            </div>
                            {r.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={r.avatar} alt={r.username} className="h-9 w-9 rounded-full border border-white/10" />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-sm font-bold">
                                    {r.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{r.username}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <KeyRound className="h-3 w-3" /> {r.keyCount}
                                    </span>
                                    <span className="text-green-400">{r.redeemedCount} redeemed</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                                <Coins className="h-4 w-4" />
                                {r.totalSpent}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
