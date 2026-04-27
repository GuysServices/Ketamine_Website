import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getResellerSession, userHasResellerRole } from "@/lib/reseller-auth"
import { prisma } from "@/lib/prisma"
import { ProfileForm } from "@/components/reseller/profile-form"

export const dynamic = "force-dynamic"

export default async function ResellerSettingsPage() {
    const session = await getResellerSession()
    if (!session) redirect("/reseller/login")

    const stillHasRole = await userHasResellerRole(session.discordId)
    if (!stillHasRole) redirect("/api/auth/discord/logout")

    const reseller = await prisma.reseller.findUnique({
        where: { discordId: session.discordId },
    })
    if (!reseller) redirect("/api/auth/discord/logout")

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/reseller">
                            <ArrowLeft className="h-4 w-4 mr-1" /> Back
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                </div>

                <ProfileForm
                    initial={{
                        username: reseller.username,
                        displayName: reseller.displayName ?? null,
                        bannerColor: reseller.bannerColor ?? null,
                        paymentInfo: reseller.paymentInfo ?? null,
                    }}
                />
            </div>
        </div>
    )
}
