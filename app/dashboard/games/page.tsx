import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRedisStatus } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { CheckCircle2, XCircle, AlertTriangle, Wrench, Server, Sparkles } from "lucide-react"

export const dynamic = 'force-dynamic'

// Live health checks keyed by serviceKey for auto-detect services.
async function runHealthCheck(key: string): Promise<boolean> {
    try {
        if (key === 'database') {
            await prisma.$queryRaw`SELECT 1`
            return true
        }
        if (key === 'external') {
            // External Services always treated as operational
            return true
        }
        if (key === 'keyauth') {
            return !!(process.env.KEYAUTH_APP_NAME && process.env.KEYAUTH_OWNER_ID)
        }
    } catch {
        return false
    }
    return true
}

const STATUS_META: Record<string, { label: string; color: string; icon: any; ok: boolean }> = {
    operational: { label: 'Operational', color: 'text-green-400', icon: CheckCircle2, ok: true },
    degraded: { label: 'Degraded', color: 'text-yellow-400', icon: AlertTriangle, ok: false },
    maintenance: { label: 'Maintenance', color: 'text-blue-400', icon: Wrench, ok: false },
    offline: { label: 'Offline', color: 'text-red-400', icon: XCircle, ok: false },
}

export default async function StatusPage() {
    const dbServices = await prisma.serviceStatus.findMany({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    const changelog = await prisma.changelogEntry.findMany({
        orderBy: { createdAt: 'desc' },
    })

    // Resolve each service's effective status (auto-detect vs manual)
    const services = await Promise.all(dbServices.map(async s => {
        let effectiveStatus = s.status
        if (s.autoDetect) {
            const alive = await runHealthCheck(s.serviceKey)
            effectiveStatus = alive ? 'operational' : 'offline'
        }
        return {
            ...s,
            effectiveStatus,
            meta: STATUS_META[effectiveStatus] || STATUS_META.operational,
        }
    }))

    const allOnline = services.length > 0 && services.every(s => s.meta.ok)

    return (
        <div className="space-y-10 h-full flex flex-col">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    External Status
                </h2>
                <p className="text-lg text-muted-foreground">
                    Live health of services powering Ketamine.
                </p>
            </div>

            {/* Overall Banner */}
            <Card className={`border-white/10 backdrop-blur-md ${allOnline ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5" : "bg-gradient-to-br from-red-500/10 to-orange-500/5"}`}>
                <CardContent className="flex items-center gap-4 py-6">
                    <div className={`p-3 rounded-full ${allOnline ? "bg-green-500/20" : "bg-red-500/20"}`}>
                        {allOnline
                            ? <CheckCircle2 className="h-6 w-6 text-green-400" />
                            : <XCircle className="h-6 w-6 text-red-400" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {allOnline ? "All Systems Operational" : "Partial Outage Detected"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {allOnline
                                ? "Every service is running normally."
                                : "One or more services are currently degraded."}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Service Status Grid */}
            {services.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <Server className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No services configured yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Add services from the Moderator panel → Status tab.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    {services.map(service => {
                        const StatusIcon = service.meta.icon
                        return (
                            <Card key={service.id} className="bg-black/40 border-white/10 backdrop-blur-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {service.name}
                                    </CardTitle>
                                    <StatusIcon className={`h-4 w-4 ${service.meta.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${service.meta.color}`}>
                                        {service.meta.label}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                                    {service.message && !service.meta.ok && (
                                        <p className="text-xs text-white/80 mt-2 p-2 rounded bg-white/5 border border-white/10">
                                            {service.message}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Changelog */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-bold text-white">Changelog</h3>
                </div>
                {changelog.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/5">
                        <p className="text-muted-foreground text-sm">No changelog entries yet.</p>
                    </div>
                ) : (
                <div className="space-y-4">
                    {changelog.map((entry) => (
                        <Card key={entry.id} className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold border border-primary/30">
                                        v{entry.version}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider ${entry.type === 'major'
                                        ? 'bg-primary/20 text-primary'
                                        : entry.type === 'feature'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-slate-500/20 text-slate-400'
                                    }`}>
                                    {entry.type}
                                </span>
                            </CardHeader>
                            <CardContent>
                                <h4 className="text-lg font-semibold text-white mb-3">{entry.title}</h4>
                                <ul className="space-y-2">
                                    {entry.changes.map((change, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                            <span>{change}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                )}
            </div>
        </div>
    )
}

