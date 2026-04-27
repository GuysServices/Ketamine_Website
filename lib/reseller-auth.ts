import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const COOKIE_NAME = "reseller_session"
const SESSION_TTL_HOURS = 12

function getSecretKey(): Uint8Array {
    const secretKey = process.env.JWT_SECRET || "default-dev-secret-do-not-use-in-prod"
    return new TextEncoder().encode(secretKey)
}

export interface ResellerSession {
    discordId: string
    username: string
    avatar: string | null
    expires: number
}

/** Create a signed cookie for a verified reseller. */
export async function createResellerSession(data: Omit<ResellerSession, "expires">) {
    const expires = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000
    const token = await new SignJWT({ ...data, expires })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_TTL_HOURS}h`)
        .sign(getSecretKey())

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(expires),
    })
}

export async function getResellerSession(): Promise<ResellerSession | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    try {
        const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] })
        return payload as unknown as ResellerSession
    } catch {
        return null
    }
}

export async function destroyResellerSession() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}

/**
 * Use the bot token to look up a guild member and check whether they own
 * the configured reseller role.
 */
export async function userHasResellerRole(discordUserId: string): Promise<boolean> {
    const botToken = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID
    const roleId = process.env.DISCORD_RESELLER_ROLE_ID

    if (!botToken || !guildId || !roleId) {
        console.error("[reseller-auth] Missing Discord env vars")
        return false
    }

    try {
        const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}`, {
            headers: { Authorization: `Bot ${botToken}` },
            cache: "no-store",
        })
        if (!res.ok) {
            // 404 = user not in the guild
            return false
        }
        const member = (await res.json()) as { roles?: string[] }
        return Array.isArray(member.roles) && member.roles.includes(roleId)
    } catch (err) {
        console.error("[reseller-auth] Role lookup failed:", err)
        return false
    }
}
