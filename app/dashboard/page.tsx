import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'
import { ServiceStatus } from "@/app/components/service-status"
import { Button } from "@/components/ui/button"
import { ExternalLink, Zap, Shield, Activity, User, Download, Cpu } from "lucide-react"
import Link from "next/link"

const LOADER_DOWNLOAD_URL = process.env.NEXT_PUBLIC_LOADER_URL || "https://github.com/GuysServices/Ketamine_Roblox_External2/raw/refs/heads/main/Ketamine%20External.exe"

export default async function DashboardPage() {
    const session = await getSession()
    const user = await prisma.user.findUnique({
        where: { id: session?.userId },
        include: { licenseKey: true }
    })

    return (
        <div className="space-y-12 h-full flex flex-col">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Command Center
                </h2>
                <p className="text-lg text-muted-foreground">
                    Welcome, <span className="text-primary font-semibold">{user?.username}</span>, get ready to troll!
                </p>
            </div>

            {/* Download Loader CTA */}
            <Card className="group relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/20 via-purple-600/10 to-black/40 backdrop-blur-md">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.primary/20),transparent_60%)] pointer-events-none" />
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                            <Cpu className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Ketamine Loader</h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Download the latest loader to inject Ketamine into your games. Requires an active license.
                            </p>
                        </div>
                    </div>
                    <a href={LOADER_DOWNLOAD_URL} download className="w-full md:w-auto">
                        <Button size="lg" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30">
                            <Download className="mr-2 h-5 w-5" />
                            Download Loader
                        </Button>
                    </a>
                </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group overflow-hidden border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">License Status</CardTitle>
                        <Shield className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">Active</div>
                        <p className="text-xs text-muted-foreground mt-1 truncate font-mono opacity-70">
                            {user?.licenseKey?.key}
                        </p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Access Level</CardTitle>
                        <Zap className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">Premium Tier</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            External Fully Unlocked
                        </p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Roblox Account</CardTitle>
                        <User className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white truncate">
                            {user?.robloxUsername || "Not Linked"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Connected Identity
                        </p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden border-white/10 bg-gradient-to-br from-primary/20 to-purple-600/20 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary">Quick Actions</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/dashboard/games" className="block">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-primary hover:text-primary hover:bg-primary/20">
                                <ExternalLink className="mr-2 h-3 w-3" />
                                View Active Games
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-white/10 pb-2">System Status</h3>
                <ServiceStatus />
            </div>
        </div>
    )
}

