import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getResellerSession } from "@/lib/reseller-auth"

const ERROR_MESSAGES: Record<string, string> = {
    denied: "You cancelled the Discord login.",
    misconfigured: "Discord OAuth is not configured. Contact an admin.",
    token: "Discord rejected the authorization code. Please try again.",
    user: "We couldn't read your Discord profile. Please try again.",
    no_role: "You don't have the reseller role in our Discord server.",
}

export const dynamic = "force-dynamic"

export default async function ResellerLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams

    // If they're already signed in, send them to the dashboard
    const existing = await getResellerSession()
    if (existing) {
        redirect("/reseller")
    }

    const errorMessage = params.error ? ERROR_MESSAGES[params.error] || "Login failed." : null

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-3">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center">
                        <ShieldCheck className="h-7 w-7 text-[#5865F2]" />
                    </div>
                    <CardTitle className="text-2xl">Reseller Portal</CardTitle>
                    <CardDescription>
                        Sign in with Discord to access reseller-only tools. You must have the reseller role in our community Discord server.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errorMessage && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-300">{errorMessage}</p>
                        </div>
                    )}

                    <Button asChild className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white" size="lg">
                        <a href="/api/auth/discord">Login with Discord</a>
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        Need a normal account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in here
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
