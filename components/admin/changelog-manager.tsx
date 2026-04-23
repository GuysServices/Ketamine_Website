'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Save, X } from 'lucide-react'
import { upsertChangelogEntry, deleteChangelogEntry } from '@/app/actions/admin-status'
import { toast } from '@/components/ui/use-toast'

export interface ChangelogRecord {
    id: string
    version: string
    date: string
    type: string
    title: string
    changes: string[]
}

const TYPE_OPTIONS = [
    { value: 'major', label: 'Major', color: 'bg-primary/20 text-primary border-primary/30' },
    { value: 'feature', label: 'Feature', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { value: 'fix', label: 'Fix', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
]

interface EntryFormProps {
    entry?: ChangelogRecord
    onSaved: () => void
    onCancel?: () => void
}

function EntryForm({ entry, onSaved, onCancel }: EntryFormProps) {
    const [isPending, startTransition] = useTransition()
    const [form, setForm] = useState({
        version: entry?.version ?? '',
        date: entry?.date ?? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        type: entry?.type ?? 'feature',
        title: entry?.title ?? '',
        changes: entry?.changes.length ? entry.changes : [''],
    })

    const save = () => {
        if (!form.version || !form.title) {
            toast({ title: 'Missing fields', description: 'Version and title required.', variant: 'destructive' })
            return
        }
        startTransition(async () => {
            try {
                await upsertChangelogEntry({ id: entry?.id, ...form })
                toast({ title: 'Saved', description: `v${form.version} saved.` })
                onSaved()
            } catch (e: any) {
                toast({ title: 'Error', description: e.message || 'Save failed', variant: 'destructive' })
            }
        })
    }

    const updateChange = (idx: number, value: string) => {
        setForm(f => ({ ...f, changes: f.changes.map((c, i) => (i === idx ? value : c)) }))
    }
    const addChange = () => setForm(f => ({ ...f, changes: [...f.changes, ''] }))
    const removeChange = (idx: number) => setForm(f => ({ ...f, changes: f.changes.filter((_, i) => i !== idx) }))

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs">Version</Label>
                    <Input placeholder="e.g. 2.1.0" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input placeholder="April 23, 2026" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <div className="flex gap-2">
                        {TYPE_OPTIONS.map(t => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, type: t.value }))}
                                className={`flex-1 px-2 py-2 rounded-lg border text-xs font-medium uppercase transition-all ${form.type === t.value ? t.color : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input placeholder="e.g. KeyAuth.cc Integration" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div className="space-y-2">
                <Label className="text-xs">Changes</Label>
                {form.changes.map((change, idx) => (
                    <div key={idx} className="flex gap-2">
                        <Input
                            placeholder={`Change #${idx + 1}`}
                            value={change}
                            onChange={e => updateChange(idx, e.target.value)}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeChange(idx)} disabled={form.changes.length === 1}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addChange}>
                    <Plus className="h-4 w-4 mr-2" /> Add Change
                </Button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                {onCancel && <Button variant="ghost" onClick={onCancel} disabled={isPending}>Cancel</Button>}
                <Button onClick={save} disabled={isPending}>
                    <Save className="h-4 w-4 mr-2" /> {isPending ? 'Saving...' : 'Save Entry'}
                </Button>
            </div>
        </div>
    )
}

export function ChangelogManager({ entries }: { entries: ChangelogRecord[] }) {
    const [isPending, startTransition] = useTransition()
    const [showNew, setShowNew] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const remove = (entry: ChangelogRecord) => {
        if (!confirm(`Delete v${entry.version}?`)) return
        startTransition(async () => {
            try {
                await deleteChangelogEntry(entry.id)
                toast({ title: 'Deleted', description: `v${entry.version} removed.` })
                window.location.reload()
            } catch (e: any) {
                toast({ title: 'Error', description: e.message || 'Delete failed', variant: 'destructive' })
            }
        })
    }

    const reload = () => window.location.reload()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold">Changelog</h3>
                    <p className="text-sm text-muted-foreground">Entries shown on the public Status page.</p>
                </div>
                <Button onClick={() => setShowNew(!showNew)} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> {showNew ? 'Cancel' : 'New Entry'}
                </Button>
            </div>

            {showNew && (
                <Card className="bg-primary/5 border-primary/30">
                    <CardHeader><CardTitle className="text-lg">New Changelog Entry</CardTitle></CardHeader>
                    <CardContent>
                        <EntryForm onSaved={reload} onCancel={() => setShowNew(false)} />
                    </CardContent>
                </Card>
            )}

            <div className="space-y-3">
                {entries.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <p className="text-muted-foreground">No changelog entries yet.</p>
                    </div>
                ) : (
                    entries.map(entry => (
                        <Card key={entry.id} className="bg-slate-900/50 border-white/10">
                            <CardContent className="p-5">
                                {editingId === entry.id ? (
                                    <EntryForm entry={entry} onSaved={reload} onCancel={() => setEditingId(null)} />
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold border border-primary/30">
                                                    v{entry.version}
                                                </span>
                                                <span className="text-sm text-muted-foreground">{entry.date}</span>
                                                <span className={`text-xs px-2 py-1 rounded-md font-medium uppercase border ${TYPE_OPTIONS.find(t => t.value === entry.type)?.color ?? ''
                                                    }`}>
                                                    {entry.type}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => setEditingId(entry.id)}>Edit</Button>
                                                <Button variant="destructive" size="sm" onClick={() => remove(entry)} disabled={isPending}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-semibold">{entry.title}</h4>
                                        <ul className="space-y-1 text-sm text-muted-foreground">
                                            {entry.changes.map((c, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                    <span>{c}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
