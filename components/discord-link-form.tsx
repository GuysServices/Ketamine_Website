"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Link2, Link2Off, CheckCircle2 } from "lucide-react"
import { getDiscordStatus, linkDiscordAccount, unlinkDiscordAccount } from "@/app/actions/user"
import { toast } from "@/components/ui/use-toast"

export function DiscordLinkForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [discordIdInput, setDiscordIdInput] = useState("")
    const [linked, setLinked] = useState(false)
    const [discordId, setDiscordId] = useState<string | null>(null)
    const [discordUsername, setDiscordUsername] = useState<string | null>(null)

    const refresh = async () => {
        const status = await getDiscordStatus()
        if (status) {
            setLinked(status.isLinked)
            setDiscordId(status.discordId)
            setDiscordUsername(status.discordUsername)
        }
        setLoading(false)
    }

    useEffect(() => {
        refresh()
    }, [])

    const handleLink = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)
            await linkDiscordAccount(discordIdInput)
            toast({
                title: "Discord Linked",
                description: "Your Discord account is now linked. You can receive password reset codes there.",
            })
            setDiscordIdInput("")
            await refresh()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to link Discord account",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const handleUnlink = async () => {
        if (!confirm("Unlink your Discord account? You won't be able to receive password reset codes.")) return
        try {
            setSaving(true)
            await unlinkDiscordAccount()
            toast({
                title: "Discord Unlinked",
                description: "Your Discord account has been removed.",
            })
            await refresh()
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to unlink Discord account",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
        )
    }

    if (linked) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-white">
                            {discordUsername || "Linked"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                            ID: {discordId}
                        </div>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={handleUnlink}
                    disabled={saving}
                    className="gap-2"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2Off className="h-4 w-4" />}
                    Unlink Discord
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleLink} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="discord-id">Discord User ID</Label>
                <Input
                    id="discord-id"
                    value={discordIdInput}
                    onChange={(e) => setDiscordIdInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456789012345678"
                    inputMode="numeric"
                    required
                    className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                    In Discord: Settings → Advanced → enable Developer Mode, then right-click your name and pick <span className="font-semibold">Copy User ID</span>. The bot must share a server with you.
                </p>
            </div>
            <Button type="submit" disabled={saving || !discordIdInput} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Link Discord
            </Button>
        </form>
    )
}
