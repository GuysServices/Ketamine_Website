'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Search,
    Upload,
    Download,
    Copy,
    Trash2,
    FileCode,
    Gamepad2,
    User,
    Tag,
    Loader2,
    X,
    Eye,
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import {
    uploadConfig,
    searchConfigs,
    downloadConfig,
    deleteConfig,
    type ConfigSummary,
} from '@/app/actions/configs'

interface Props {
    initial: ConfigSummary[]
    games: string[]
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(iso: string) {
    const d = new Date(iso)
    const days = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (days < 1) return 'today'
    if (days === 1) return '1 day ago'
    if (days < 30) return `${days} days ago`
    return d.toLocaleDateString()
}

export function ConfigsBrowser({ initial, games }: Props) {
    const [configs, setConfigs] = useState<ConfigSummary[]>(initial)
    const [query, setQuery] = useState('')
    const [gameFilter, setGameFilter] = useState('')
    const [isSearching, startSearch] = useTransition()
    const [uploadOpen, setUploadOpen] = useState(false)
    const [previewing, setPreviewing] = useState<ConfigSummary | null>(null)
    const [previewContent, setPreviewContent] = useState<string | null>(null)

    // Re-run server search whenever filters change (debounced)
    useEffect(() => {
        const handle = setTimeout(() => {
            startSearch(async () => {
                try {
                    const rows = await searchConfigs({ query, game: gameFilter })
                    setConfigs(rows)
                } catch (e: any) {
                    toast({ title: 'Search failed', description: e.message, variant: 'destructive' })
                }
            })
        }, 250)
        return () => clearTimeout(handle)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, gameFilter])

    const distinctGames = useMemo(() => {
        // Merge server-known games with whatever's in the current result list
        const fromConfigs = configs.map(c => c.game)
        return Array.from(new Set([...games, ...fromConfigs])).sort()
    }, [games, configs])

    const onDownload = async (cfg: ConfigSummary) => {
        try {
            const data = await downloadConfig(cfg.id)
            const blob = new Blob([data.content], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = data.fileName
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            // Bump local counter for instant feedback
            setConfigs(cs => cs.map(c => (c.id === cfg.id ? { ...c, downloads: c.downloads + 1 } : c)))
        } catch (e: any) {
            toast({ title: 'Download failed', description: e.message, variant: 'destructive' })
        }
    }

    const onCopy = async (cfg: ConfigSummary) => {
        try {
            const data = await downloadConfig(cfg.id)
            await navigator.clipboard.writeText(data.content)
            toast({ title: 'Copied', description: `${cfg.name} copied to clipboard` })
            setConfigs(cs => cs.map(c => (c.id === cfg.id ? { ...c, downloads: c.downloads + 1 } : c)))
        } catch (e: any) {
            toast({ title: 'Copy failed', description: e.message, variant: 'destructive' })
        }
    }

    const onPreview = async (cfg: ConfigSummary) => {
        setPreviewing(cfg)
        setPreviewContent(null)
        try {
            const data = await downloadConfig(cfg.id)
            setPreviewContent(data.content)
        } catch (e: any) {
            toast({ title: 'Preview failed', description: e.message, variant: 'destructive' })
            setPreviewing(null)
        }
    }

    const onDelete = async (cfg: ConfigSummary) => {
        if (!confirm(`Delete "${cfg.name}"? This can't be undone.`)) return
        try {
            await deleteConfig(cfg.id)
            setConfigs(cs => cs.filter(c => c.id !== cfg.id))
            toast({ title: 'Deleted', description: cfg.name })
        } catch (e: any) {
            toast({ title: 'Delete failed', description: e.message, variant: 'destructive' })
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <FileCode className="h-7 w-7 text-primary" /> Game Configs
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Browse and share configuration files for your favorite games.
                    </p>
                </div>
                <Button onClick={() => setUploadOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" /> Upload Config
                </Button>
            </div>

            {/* Search bar */}
            <Card className="bg-card/60 border-white/10">
                <CardContent className="p-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, game, tag, or uploader..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="pl-9"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Game filter chips */}
                    {distinctGames.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">Game:</span>
                            <button
                                onClick={() => setGameFilter('')}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${gameFilter === ''
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                All
                            </button>
                            {distinctGames.map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGameFilter(g === gameFilter ? '' : g)}
                                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${gameFilter === g
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Result count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isSearching ? (
                    <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Searching...
                    </>
                ) : (
                    <span>
                        {configs.length} {configs.length === 1 ? 'config' : 'configs'} found
                    </span>
                )}
            </div>

            {/* Grid */}
            {configs.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
                    <FileCode className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                        {query || gameFilter
                            ? 'No configs match your filters.'
                            : 'No configs yet. Be the first to upload one!'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {configs.map(cfg => (
                        <Card key={cfg.id} className="bg-card/60 border-white/10 hover:border-primary/40 transition-colors flex flex-col">
                            <CardContent className="p-5 flex-1 flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold leading-tight flex-1 break-words">{cfg.name}</h3>
                                    <Badge variant="outline" className="text-[10px] flex-shrink-0">
                                        <Gamepad2 className="h-3 w-3 mr-1" />
                                        {cfg.game}
                                    </Badge>
                                </div>

                                {cfg.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-3">{cfg.description}</p>
                                )}

                                {cfg.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {cfg.tags.map(t => (
                                            <span
                                                key={t}
                                                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground"
                                            >
                                                <Tag className="h-2.5 w-2.5 inline mr-0.5" />
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-auto pt-2 border-t border-white/5">
                                    <span className="flex items-center gap-1 truncate" title={cfg.uploaderName}>
                                        <User className="h-3 w-3" /> {cfg.uploaderName}
                                    </span>
                                    <span>·</span>
                                    <span>{formatBytes(cfg.fileSize)}</span>
                                    <span>·</span>
                                    <span>{cfg.downloads} dl</span>
                                    <span className="ml-auto">{formatDate(cfg.createdAt)}</span>
                                </div>

                                <div className="flex gap-1.5 pt-1">
                                    <Button size="sm" variant="default" className="flex-1" onClick={() => onDownload(cfg)}>
                                        <Download className="h-3.5 w-3.5 mr-1" /> Download
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => onPreview(cfg)} title="Preview">
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => onCopy(cfg)} title="Copy to clipboard">
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                    {cfg.isMine && (
                                        <Button size="sm" variant="outline" onClick={() => onDelete(cfg)} title="Delete" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <UploadDialog
                open={uploadOpen}
                onOpenChange={setUploadOpen}
                onUploaded={(c) => setConfigs(cs => [c, ...cs])}
                knownGames={distinctGames}
            />

            <PreviewDialog
                config={previewing}
                content={previewContent}
                onClose={() => {
                    setPreviewing(null)
                    setPreviewContent(null)
                }}
            />
        </div>
    )
}

// =====================================================================
// Upload dialog
// =====================================================================

function UploadDialog({
    open,
    onOpenChange,
    onUploaded,
    knownGames,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    onUploaded: (c: ConfigSummary) => void
    knownGames: string[]
}) {
    const [isPending, startTransition] = useTransition()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [game, setGame] = useState('')
    const [tags, setTags] = useState('')
    const [fileName, setFileName] = useState('')
    const [content, setContent] = useState('')

    const reset = () => {
        setName(''); setDescription(''); setGame(''); setTags(''); setFileName(''); setContent('')
    }

    const onFile = async (file: File | null) => {
        if (!file) return
        setFileName(file.name)
        if (!name) setName(file.name.replace(/\.[^.]+$/, ''))
        try {
            const text = await file.text()
            setContent(text)
        } catch {
            toast({ title: 'Read failed', description: 'Could not read file as text.', variant: 'destructive' })
        }
    }

    const submit = () => {
        if (!name.trim() || !game.trim() || !fileName.trim() || !content) {
            toast({ title: 'Missing fields', description: 'Name, game, and a file are required.', variant: 'destructive' })
            return
        }
        startTransition(async () => {
            try {
                const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
                const { id } = await uploadConfig({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    game: game.trim(),
                    fileName: fileName.trim(),
                    content,
                    tags: tagList,
                })
                toast({ title: 'Uploaded', description: name })
                onUploaded({
                    id,
                    name: name.trim(),
                    description: description.trim() || null,
                    game: game.trim(),
                    fileName: fileName.trim(),
                    fileSize: new Blob([content]).size,
                    tags: tagList,
                    downloads: 0,
                    uploaderId: '',
                    uploaderName: 'You',
                    createdAt: new Date().toISOString(),
                    isMine: true,
                })
                reset()
                onOpenChange(false)
            } catch (e: any) {
                toast({ title: 'Upload failed', description: e.message, variant: 'destructive' })
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" /> Upload Config
                    </DialogTitle>
                    <DialogDescription>
                        Share a config file with the community. Max 500KB. Text files only.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <Label className="text-xs">File <span className="text-red-400">*</span></Label>
                        <Input
                            type="file"
                            accept=".txt,.json,.cfg,.ini,.lua,.yaml,.yml,.toml,.xml,.config,text/*"
                            onChange={e => onFile(e.target.files?.[0] || null)}
                        />
                        {fileName && (
                            <p className="text-xs text-muted-foreground">
                                {fileName} · {formatBytes(new Blob([content]).size)}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Name <span className="text-red-400">*</span></Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aimbot Config v2" maxLength={100} />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Game <span className="text-red-400">*</span></Label>
                        <Input value={game} onChange={e => setGame(e.target.value)} placeholder="e.g. Roblox, CS2, Valorant" maxLength={60} list="known-games" />
                        <datalist id="known-games">
                            {knownGames.map(g => <option key={g} value={g} />)}
                        </datalist>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <textarea
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                            rows={3}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What does this config do?"
                            maxLength={1000}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Tags (comma-separated)</Label>
                        <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="aimbot, esp, legit" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// =====================================================================
// Preview dialog
// =====================================================================

function PreviewDialog({
    config,
    content,
    onClose,
}: {
    config: ConfigSummary | null
    content: string | null
    onClose: () => void
}) {
    return (
        <Dialog open={!!config} onOpenChange={v => !v && onClose()}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{config?.name}</DialogTitle>
                    <DialogDescription>
                        {config?.fileName} · {config && formatBytes(config.fileSize)}
                    </DialogDescription>
                </DialogHeader>
                {content === null ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading...
                    </div>
                ) : (
                    <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-auto text-xs font-mono whitespace-pre-wrap break-words flex-1">
                        {content}
                    </pre>
                )}
            </DialogContent>
        </Dialog>
    )
}
