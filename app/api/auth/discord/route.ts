import { NextResponse } from "next/server"

/**
 * Kick off the Discord OAuth flow for reseller login.
 * Redirects to Discord's authorization page.
 */
export async function GET() {
    const clientId = process.env.DISCORD_CLIENT_ID
    const redirectUri = process.env.DISCORD_REDIRECT_URI

    if (!clientId || !redirectUri) {
        return NextResponse.json(
            { error: "Discord OAuth is not configured." },
            { status: 500 },
        )
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "identify",
        prompt: "consent",
    })

    return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`)
}
