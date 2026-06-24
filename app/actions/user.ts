"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function changeOwnPassword(currentPassword: string, newPassword: string) {
    const session = await getSession()
    if (!session?.userId) {
        throw new Error("Not authenticated")
    }

    if (!currentPassword || !newPassword) {
        throw new Error("Both current and new passwords are required")
    }

    if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters")
    }

    if (currentPassword === newPassword) {
        throw new Error("New password must be different from current password")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { passwordHash: true }
    })

    if (!user?.passwordHash) {
        throw new Error("User not found")
    }

    const valid = await compare(currentPassword, user.passwordHash)
    if (!valid) {
        throw new Error("Current password is incorrect")
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
        where: { id: session.userId },
        data: { passwordHash: hashedPassword }
    })

    revalidatePath('/dashboard/settings')
    return { success: true }
}

export async function getCurrentUsername() {
    try {
        const session = await getSession()
        if (!session?.userId) return null

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { username: true }
        })

        return user?.username || null
    } catch (e) {
        return null
    }
}

export async function getOwnedThemes() {
    try {
        const session = await getSession()
        if (!session?.userId) return ["default"]

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { ownedThemes: true, username: true } // Fetch username too for nate logic
        })

        if (!user) return ["default"]

        // Ensure default is always there
        const themes = [...new Set([...(user.ownedThemes || []), "default"])]

        // Legacy/Special handling for Nate
        if (user.username === 'NateDaPlayerYT' && !themes.includes('nate')) {
            themes.push('nate')
        }

        return themes
    } catch (e) {
        return ["default"]
    }
}

export async function getDiscordStatus() {
    try {
        const session = await getSession()
        if (!session?.userId) return null

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { discordId: true, discordUsername: true }
        })

        return {
            isLinked: !!user?.discordId,
            discordId: user?.discordId ?? null,
            discordUsername: user?.discordUsername ?? null,
        }
    } catch (e) {
        return null
    }
}

/**
 * Manually link a Discord account by user-supplied snowflake ID.
 * We then call the bot API to fetch the username for display purposes.
 */
export async function linkDiscordAccount(discordId: string) {
    const session = await getSession()
    if (!session?.userId) {
        throw new Error("Not authenticated")
    }

    const trimmed = (discordId || "").trim()
    if (!/^\d{17,20}$/.test(trimmed)) {
        throw new Error("That doesn't look like a valid Discord user ID. Right-click your name in Discord with Developer Mode on and pick 'Copy User ID'.")
    }

    // Make sure no other account already owns this Discord ID
    const existing = await prisma.user.findFirst({
        where: { discordId: trimmed, NOT: { id: session.userId } },
        select: { id: true },
    })
    if (existing) {
        throw new Error("That Discord account is already linked to a different user.")
    }

    // Try to look up the username via the bot, but don't fail if it doesn't work
    let discordUsername: string | null = null
    const token = process.env.DISCORD_BOT_TOKEN
    if (token) {
        try {
            const res = await fetch(`https://discord.com/api/v10/users/${trimmed}`, {
                headers: { Authorization: `Bot ${token}` },
            })
            if (res.ok) {
                const data = (await res.json()) as { username?: string; global_name?: string }
                discordUsername = data.global_name || data.username || null
            }
        } catch {
            // ignore
        }
    }

    await prisma.user.update({
        where: { id: session.userId },
        data: {
            discordId: trimmed,
            discordUsername,
        },
    })

    return { success: true, discordUsername }
}

export async function unlinkDiscordAccount() {
    const session = await getSession()
    if (!session?.userId) {
        throw new Error("Not authenticated")
    }

    await prisma.user.update({
        where: { id: session.userId },
        data: { discordId: null, discordUsername: null },
    })

    return { success: true }
}
