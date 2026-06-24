import { NextRequest, NextResponse } from "next/server"
import { createResellerSession, userHasResellerRole } from "@/lib/reseller-auth"
import { prisma } from "@/lib/prisma"

/**
 * Discord OAuth callback. Exchanges the auth code for an access token,
 * fetches the user, then verifies they own the reseller role in our guild
 * via the bot token.
 */
export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get("code")
    const error = req.nextUrl.searchParams.get("error")

    if (error || !code) {
        return NextResponse.redirect(new URL("/reseller/login?error=denied", req.url))
    }

    const clientId = process.env.DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET
    const redirectUri = process.env.DISCORD_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
        return NextResponse.redirect(new URL("/reseller/login?error=misconfigured", req.url))
    }

    // 1. Exchange code for access token
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
        }),
    })

    if (!tokenRes.ok) {
        console.error("[discord-callback] Token exchange failed:", await tokenRes.text())
        return NextResponse.redirect(new URL("/reseller/login?error=token", req.url))
    }

    const tokenData = (await tokenRes.json()) as { access_token: string }

    // 2. Fetch the user with the access token
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userRes.ok) {
        console.error("[discord-callback] User fetch failed:", await userRes.text())
        return NextResponse.redirect(new URL("/reseller/login?error=user", req.url))
    }

    const user = (await userRes.json()) as {
        id: string
        username: string
        global_name?: string
        avatar?: string | null
    }

    // 3. Use the bot to confirm they own the reseller role in our guild
    const hasRole = await userHasResellerRole(user.id)
    if (!hasRole) {
        return NextResponse.redirect(new URL("/reseller/login?error=no_role", req.url))
    }

    const displayName = user.global_name || user.username
    const avatarUrl = user.avatar
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : null

    // 4. Auto-provision a Reseller row on first login, or refresh their
    //    cached username/avatar so the admin panel stays current.
    try {
        await prisma.reseller.upsert({
            where: { discordId: user.id },
            update: {
                username: displayName,
                avatar: avatarUrl,
            },
            create: {
                discordId: user.id,
                username: displayName,
                avatar: avatarUrl,
                credits: 0,
            },
        })
    } catch (err) {
        console.error("[discord-callback] Failed to upsert reseller:", err)
    }

    // 5. Issue our session cookie
    await createResellerSession({
        discordId: user.id,
        username: displayName,
        avatar: avatarUrl,
    })

    return NextResponse.redirect(new URL("/reseller", req.url))
}
