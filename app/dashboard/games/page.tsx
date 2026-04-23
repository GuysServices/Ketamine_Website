import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRedisStatus } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { Activity, CheckCircle2, XCircle, Server, Database, Shield, Sparkles } from "lucide-react"
import { changelog } from "@/lib/changelog"

export const dynamic = 'force-dynamic'

export default async function StatusPage() {
    // Check Postgres
    let isPostgresAlive = false
    try {
        await prisma.$queryRaw`SELECT 1`
        isPostgresAlive = true
    } catch {
        isPostgresAlive = false
    }

    // Check Redis / external services
    const isRedisAlive = await getRedisStatus()

    // Check KeyAuth (just env presence; live check would hit their API)
    const isKeyAuthConfigured = !!(process.env.KEYAUTH_APP_NAME && process.env.KEYAUTH_OWNER_ID)

    const services = [
        {
            name: "Main Database",
            icon: Database,
            status: isPostgresAlive,
            desc: "PostgreSQL cluster (Supabase)",
        },
        {
            name: "External Services",
            icon: Server,
            status: isRedisAlive,
            desc: "Cache / real-time layer",
        },
        {
            name: "License Validation",
            icon: Shield,
            status: isKeyAuthConfigured,
            desc: "KeyAuth.cc integration",
        },
    ]

    const allOnline = services.every(s => s.status)

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
            <div className="grid gap-4 md:grid-cols-3">
                {services.map(service => {
                    const Icon = service.icon
                    return (
                        <Card key={service.name} className="bg-black/40 border-white/10 backdrop-blur-md">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {service.name}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${service.status ? "text-green-400" : "text-red-400"}`}>
                                    {service.status ? "Operational" : "Offline"}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{service.desc}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Changelog */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <h3 className="text-2xl font-bold text-white">Changelog</h3>
                </div>
                <div className="space-y-4">
                    {changelog.map((entry) => (
                        <Card key={entry.version} className="bg-black/40 border-white/10 backdrop-blur-md overflow-hidden">
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
            </div>
        </div>
    )
}

