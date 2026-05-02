"use client"

import { useEffect, useState, useTransition } from "react"
import { Bell, Sparkles, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getChangelog, type PublicChangelogEntry } from "@/app/actions/changelog"

const LAST_SEEN_KEY = "ketamine_changelog_last_seen"

const TYPE_STYLES: Record<string, string> = {
    major: "bg-primary/20 text-primary border-primary/30",
    feature: "bg-green-500/20 text-green-400 border-green-500/30",
    fix: "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

interface ChangelogBellProps {
    /** Wrapper class for the trigger button (the bell). Lets the sidebar control sizing/layout. */
    triggerClassName?: string
    /** When true, show the "Notifications" label next to the bell (sidebar expanded). */
    showLabel?: boolean
}

export function ChangelogBell({ triggerClassName, showLabel = true }: ChangelogBellProps) {
    const [open, setOpen] = useState(false)
    const [entries, setEntries] = useState<PublicChangelogEntry[] | null>(null)
    const [isPending, startTransition] = useTransition()
    const [hasUnread, setHasUnread] = useState(true)

    // Load entries once when the dialog first opens
    const ensureLoaded = () => {
        if (entries !== null || isPending) return
        startTransition(async () => {
            try {
                const data = await getChangelog(30)
                setEntries(data)
                // Update unread state based on freshly fetched data
                if (typeof window !== "undefined" && data.length > 0) {
                    const lastSeen = localStorage.getItem(LAST_SEEN_KEY)
                    setHasUnread(!lastSeen || lastSeen < data[0].createdAt)
                }
            } catch (e) {
                console.error("[Changelog] Fetch failed:", e)
                setEntries([])
            }
        })
    }

    // On first render, peek at unread state without fetching the full list:
    // we just check if the user has *ever* opened the changelog.
    useEffect(() => {
        if (typeof window === "undefined") return
        const lastSeen = localStorage.getItem(LAST_SEEN_KEY)
        if (lastSeen) {
            // If they've opened before, optimistically hide the dot;
            // it'll get re-evaluated against newest entry once they open the dialog.
            setHasUnread(false)
        }
    }, [])

    // When dialog opens, mark all current entries as seen
    useEffect(() => {
        if (!open || !entries || entries.length === 0) return
        if (typeof window === "undefined") return
        localStorage.setItem(LAST_SEEN_KEY, entries[0].createdAt)
        setHasUnread(false)
    }, [open, entries])

    const handleOpenChange = (next: boolean) => {
        setOpen(next)
        if (next) ensureLoaded()
    }

    return (
        <>
            <button
                type="button"
                onClick={() => handleOpenChange(true)}
                className={cn(
                    "relative group/bell flex items-center transition-all duration-300 cursor-pointer h-12 rounded-[1.25rem] w-full",
                    "max-md:w-10 max-md:h-10 max-md:rounded-full max-md:justify-center",
                    "md:px-3 md:gap-3 md:justify-start",
                    triggerClassName,
                )}
                title="What's new"
                aria-label="Open changelog"
            >
                <div className="absolute inset-0 bg-white/5 rounded-[1.25rem] max-md:rounded-full scale-0 group-hover/bell:scale-100 transition-transform duration-300" />
                <div className="relative flex-shrink-0">
                    <Bell className="h-5 w-5 text-slate-400 group-hover/bell:text-white transition-colors duration-300" />
                    {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0f0f1e] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    )}
                </div>
                {showLabel && (
                    <span className="max-md:hidden whitespace-nowrap text-sm font-medium text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        What's new
                    </span>
                )}
            </button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col bg-card/95 backdrop-blur-xl border-white/10">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="h-6 w-6 text-primary" />
                            What's New
                        </DialogTitle>
                        <DialogDescription>
                            Latest updates, fixes, and features for the Ketamine dashboard.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 -mx-6 px-6 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-3 pb-2">
                            {isPending && entries === null && (
                                <div className="flex items-center justify-center py-12 text-muted-foreground">
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Loading...
                                </div>
                            )}

                            {entries !== null && entries.length === 0 && (
                                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                                    <p className="text-muted-foreground text-sm">No changelog entries yet.</p>
                                </div>
                            )}

                            {entries?.map((entry) => (
                                <Card key={entry.id} className="bg-black/30 border-white/10">
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30">
                                                    v{entry.version}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{entry.date}</span>
                                            </div>
                                            <span
                                                className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border",
                                                    TYPE_STYLES[entry.type] ?? TYPE_STYLES.fix,
                                                )}
                                            >
                                                {entry.type}
                                            </span>
                                        </div>

                                        <h4 className="font-semibold text-base">{entry.title}</h4>

                                        <ul className="space-y-1.5">
                                            {entry.changes.map((change, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                                                    <span>{change}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    )
}
