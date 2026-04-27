import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Server, Shield, CheckCircle2, XCircle, AlertTriangle, Wrench, Activity, type LucideIcon } from "lucide-react"
import { getRedisStatus } from "@/lib/redis"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type StatusValue = "operational" | "degraded" | "maintenance" | "offline"

const ICONS_BY_KEY: Record<string, LucideIcon> = {
    database: Database,
    postgres: Database,
    redis: Server,
    external: Server,
    keyauth: Shield,
    auth: Shield,
    authentication: Shield,
}

const STATUS_META: Record<StatusValue, { label: string; color: string; dot: string; Icon: LucideIcon; pulse: boolean }> = {
    operational: { label: "Operational", color: "text-green-400", dot: "bg-green-500", Icon: CheckCircle2, pulse: true },
    degraded: { label: "Degraded", color: "text-yellow-400", dot: "bg-yellow-500", Icon: AlertTriangle, pulse: true },
    maintenance: { label: "Maintenance", color: "text-blue-400", dot: "bg-blue-500", Icon: Wrench, pulse: false },
    offline: { label: "Offline", color: "text-red-400", dot: "bg-red-500", Icon: XCircle, pulse: false },
}

function asStatus(s: string): StatusValue {
    return (["operational", "degraded", "maintenance", "offline"].includes(s) ? s : "operational") as StatusValue
}

async function autoDetectStatus(serviceKey: string): Promise<StatusValue | null> {
    const k = serviceKey.toLowerCase()
    if (k === "database" || k === "postgres" || k === "auth" || k === "authentication" || k === "keyauth") {
        try {
            await prisma.$queryRaw`SELECT 1`
            return "operational"
        } catch {
            return "offline"
        }
    }
    if (k === "redis") {
        try {
            return (await getRedisStatus()) ? "operational" : "offline"
        } catch {
            return "offline"
        }
    }
    return null
}

export async function ServiceStatus() {
    // Pull admin-managed services from the DB. Fall back to a sensible
    // default trio if the table is empty or unavailable.
    type ServiceRow = {
        id: string
        serviceKey: string
        name: string
        description: string
        status: string
        message: string | null
        autoDetect: boolean
        sortOrder: number
    }

    let serviceRows: ServiceRow[] = []
    try {
        serviceRows = await prisma.serviceStatus.findMany({
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        })
    } catch (err) {
        console.error("[service-status] Failed to load services:", err)
    }

    if (serviceRows.length === 0) {
        serviceRows = [
            { id: "fb-db", serviceKey: "database", name: "Main Database", description: "PostgreSQL Cluster", status: "operational", message: null, autoDetect: true, sortOrder: 0 },
            { id: "fb-ext", serviceKey: "redis", name: "External Services", description: "Cache / Real-time Layer", status: "operational", message: null, autoDetect: true, sortOrder: 1 },
            { id: "fb-auth", serviceKey: "auth", name: "Authentication", description: "Identity Provider", status: "operational", message: null, autoDetect: true, sortOrder: 2 },
        ]
    }

    const services = await Promise.all(
        serviceRows.map(async (row) => {
            let status: StatusValue = asStatus(row.status)
            if (row.autoDetect) {
                const detected = await autoDetectStatus(row.serviceKey)
                if (detected) status = detected
            }
            const Icon = ICONS_BY_KEY[row.serviceKey.toLowerCase()] ?? Server
            return {
                id: row.id,
                name: row.name,
                description: row.description,
                message: row.message,
                status,
                Icon,
            }
        }),
    )

    return (
        <section className="container mx-auto px-4 pb-24 relative z-10 w-full max-w-6xl">
            <div className="flex flex-col items-center mb-12 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-4">
                    <Activity className="h-4 w-4 animate-pulse text-green-400" />
                    <span>Live Systems Status</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                    Operational Integrity
                </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {services.map((service) => {
                    const meta = STATUS_META[service.status]
                    const StatusIcon = meta.Icon
                    const ServiceIcon = service.Icon
                    return (
                        <Card key={service.id} className="bg-black/40 border-white/10 backdrop-blur-sm hover:bg-white/5 transition-colors overflow-hidden animate-in fade-in zoom-in-50 duration-700">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5">
                                        <ServiceIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <CardTitle className="text-base font-medium">{service.name}</CardTitle>
                                        <p className="text-xs text-muted-foreground">{service.description}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            {meta.pulse && (
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${meta.dot} opacity-75`}></span>
                                            )}
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${meta.dot}`}></span>
                                        </span>
                                        <span className={`text-sm font-medium ${meta.color}`}>{meta.label}</span>
                                    </div>
                                    <StatusIcon className={`h-5 w-5 ${meta.color} opacity-60`} />
                                </div>
                                {service.message && service.status !== "operational" && (
                                    <p className={`text-xs mt-3 ${meta.color}`}>{service.message}</p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </section>
    )
}
