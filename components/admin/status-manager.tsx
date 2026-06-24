'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Save, CheckCircle2, AlertTriangle, Wrench, XCircle } from 'lucide-react'
import { upsertServiceStatus, deleteServiceStatus } from '@/app/actions/admin-status'
import { toast } from '@/components/ui/use-toast'

export interface ServiceStatusRecord {
    id: string
    serviceKey: string
    name: string
    description: string
    status: string
    message: string | null
    autoDetect: boolean
    sortOrder: number
}

const STATUS_OPTIONS = [
    { value: 'operational', label: 'Operational', icon: CheckCircle2, color: 'text-green-400' },
    { value: 'degraded', label: 'Degraded', icon: AlertTriangle, color: 'text-yellow-400' },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'text-blue-400' },
    { value: 'offline', label: 'Offline', icon: XCircle, color: 'text-red-400' },
]

interface StatusRowProps {
    service: ServiceStatusRecord
    onSaved: () => void
}

function StatusRow({ service, onSaved }: StatusRowProps) {
    const [isPending, startTransition] = useTransition()
    const [form, setForm] = useState({
        name: service.name,
        description: service.description,
        serviceKey: service.serviceKey,
        status: service.status,
        message: service.message ?? '',
        autoDetect: service.autoDetect,
        sortOrder: service.sortOrder,
    })

    const save = () => {
        startTransition(async () => {
            try {
                await upsertServiceStatus({ id: service.id, ...form, message: form.message || null })
                toast({ title: 'Saved', description: `${form.name} updated.` })
                onSaved()
            } catch (e: any) {
                toast({ title: 'Error', description: e.message || 'Save failed', variant: 'destructive' })
            }
        })
    }

    const remove = () => {
        if (!confirm(`Delete "${service.name}"?`)) return
        startTransition(async () => {
            try {
                await deleteServiceStatus(service.id)
                toast({ title: 'Deleted', description: `${service.name} removed.` })
                onSaved()
            } catch (e: any) {
                toast({ title: 'Error', description: e.message || 'Delete failed', variant: 'destructive' })
            }
        })
    }

    return (
        <Card className="bg-slate-900/50 border-white/10">
            <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Service Key (unique)</Label>
                        <Input value={form.serviceKey} onChange={e => setForm(f => ({ ...f, serviceKey: e.target.value }))} />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Description</Label>
                        <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {STATUS_OPTIONS.map(opt => {
                                const Icon = opt.icon
                                const active = form.status === opt.value
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, status: opt.value }))}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${active
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                                            }`}
                                    >
                                        <Icon className={`h-4 w-4 ${active ? '' : opt.color}`} />
                                        {opt.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs">Custom Message (optional)</Label>
                        <Input
                            placeholder="e.g. Scheduled maintenance until 5pm EST"
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={form.autoDetect}
                            onCheckedChange={(v) => setForm(f => ({ ...f, autoDetect: v }))}
                        />
                        <div>
                            <Label className="text-sm">Auto-detect</Label>
                            <p className="text-xs text-muted-foreground">
                                {form.autoDetect ? 'Uses live health check (ignores manual status)' : 'Uses the manual status above'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={remove} disabled={isPending}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                        <Button size="sm" onClick={save} disabled={isPending}>
                            <Save className="h-4 w-4 mr-2" /> {isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function StatusManager({ services }: { services: ServiceStatusRecord[] }) {
    const [isPending, startTransition] = useTransition()
    const [showNew, setShowNew] = useState(false)
    const [newForm, setNewForm] = useState({
        serviceKey: '',
        name: '',
        description: '',
        status: 'operational',
        message: '',
        autoDetect: false,
        sortOrder: services.length,
    })

    const create = () => {
        if (!newForm.serviceKey || !newForm.name) {
            toast({ title: 'Missing fields', description: 'Service key and name are required.', variant: 'destructive' })
            return
        }
        startTransition(async () => {
            try {
                await upsertServiceStatus({ ...newForm, message: newForm.message || null })
                toast({ title: 'Created', description: `${newForm.name} added.` })
                setShowNew(false)
                setNewForm({ serviceKey: '', name: '', description: '', status: 'operational', message: '', autoDetect: false, sortOrder: services.length + 1 })
                window.location.reload()
            } catch (e: any) {
                toast({ title: 'Error', description: e.message || 'Create failed', variant: 'destructive' })
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold">Service Status</h3>
                    <p className="text-sm text-muted-foreground">Control what users see on the Status page.</p>
                </div>
                <Button onClick={() => setShowNew(!showNew)} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> {showNew ? 'Cancel' : 'Add Service'}
                </Button>
            </div>

            {showNew && (
                <Card className="bg-primary/5 border-primary/30">
                    <CardHeader><CardTitle className="text-lg">New Service</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Service Key</Label>
                                <Input placeholder="e.g. api-gateway" value={newForm.serviceKey} onChange={e => setNewForm(f => ({ ...f, serviceKey: e.target.value }))} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Display Name</Label>
                                <Input placeholder="e.g. API Gateway" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <Label className="text-xs">Description</Label>
                                <Input placeholder="Short description" value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                        </div>
                        <Button onClick={create} disabled={isPending} className="w-full">
                            <Plus className="h-4 w-4 mr-2" /> Create Service
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-3">
                {services.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                        <p className="text-muted-foreground">No services yet. Click "Add Service" to create one.</p>
                    </div>
                ) : (
                    services.map(s => <StatusRow key={s.id} service={s} onSaved={() => window.location.reload()} />)
                )}
            </div>
        </div>
    )
}
