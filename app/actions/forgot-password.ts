"use server"

import { prisma } from "@/lib/prisma"
import { sendDiscordDM } from "@/lib/discord-dm"
import { hash, compare } from "bcryptjs"
import crypto from "crypto"

const CODE_TTL_MINUTES = 15
const MAX_ATTEMPTS = 5
const COOLDOWN_SECONDS = 60

async function verifyTurnstile(token: string): Promise<boolean> {
    // Allow bypassing Turnstile in development so the flow can be tested
    // locally where the Turnstile widget often fails to load.
    if (process.env.NODE_ENV !== "production") {
        return true
    }
    if (!token) return false
    const verifyFormData = new URLSearchParams()
    verifyFormData.append("secret", process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "")
    verifyFormData.append("response", token)
    try {
        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: verifyFormData,
        }).then((r) => r.json())
        return !!res.success
    } catch {
        return false
    }
}

/**
 * Step 1: Look up the user by username, generate a 6-digit code, store its
 * hash in the DB, and DM the code to the user's linked Discord account.
 *
 * Always returns a generic success response so attackers can't enumerate
 * which usernames exist or which have Discord linked.
 */
export async function requestPasswordReset(
    username: string,
    turnstileToken: string,
): Promise<{ success: true; message: string }> {
    if (!(await verifyTurnstile(turnstileToken))) {
        throw new Error("Turnstile verification failed")
    }

    const generic = {
        success: true as const,
        message:
            "If that account exists and has Discord linked, a reset code has been sent. Check your DMs.",
    }

    if (!username || typeof username !== "string") {
        return generic
    }

    const user = await prisma.user.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
        select: { id: true, discordId: true, isBanned: true },
    })

    if (!user || !user.discordId || user.isBanned) {
        return generic
    }

    // Cooldown: don't allow spamming new codes within COOLDOWN_SECONDS
    const recent = await prisma.passwordResetCode.findFirst({
        where: {
            userId: user.id,
            used: false,
            createdAt: { gt: new Date(Date.now() - COOLDOWN_SECONDS * 1000) },
        },
        orderBy: { createdAt: "desc" },
    })
    if (recent) {
        return generic
    }

    // Invalidate any older un-used codes for this user
    await prisma.passwordResetCode.updateMany({
        where: { userId: user.id, used: false },
        data: { used: true },
    })

    // Generate a 6-digit code
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0")
    const codeHash = await hash(code, 10)
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000)

    await prisma.passwordResetCode.create({
        data: {
            userId: user.id,
            codeHash,
            expiresAt,
        },
    })

    try {
        await sendDiscordDM(
            user.discordId,
            `**Ketamine — Password Reset**\n\nYour reset code is: \`${code}\`\n\nThis code expires in ${CODE_TTL_MINUTES} minutes. If you didn't request this, ignore this message.`,
        )
    } catch (err) {
        console.error("[forgot-password] Discord DM failed:", err)
        // Don't leak the failure to the client
    }

    return generic
}

/**
 * Step 2: Verify the code and set a new password.
 */
export async function confirmPasswordReset(
    username: string,
    code: string,
    newPassword: string,
    turnstileToken: string,
): Promise<{ success: true }> {
    if (!(await verifyTurnstile(turnstileToken))) {
        throw new Error("Turnstile verification failed")
    }

    if (!username || !code || !newPassword) {
        throw new Error("Missing required fields")
    }
    if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters")
    }
    if (!/^\d{6}$/.test(code)) {
        throw new Error("Invalid code format")
    }

    const user = await prisma.user.findFirst({
        where: { username: { equals: username, mode: "insensitive" } },
        select: { id: true },
    })
    if (!user) {
        throw new Error("Invalid code or username")
    }

    const reset = await prisma.passwordResetCode.findFirst({
        where: {
            userId: user.id,
            used: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    })

    if (!reset) {
        throw new Error("Reset code expired or not found. Please request a new one.")
    }

    if (reset.attempts >= MAX_ATTEMPTS) {
        await prisma.passwordResetCode.update({
            where: { id: reset.id },
            data: { used: true },
        })
        throw new Error("Too many incorrect attempts. Please request a new code.")
    }

    const valid = await compare(code, reset.codeHash)
    if (!valid) {
        await prisma.passwordResetCode.update({
            where: { id: reset.id },
            data: { attempts: { increment: 1 } },
        })
        throw new Error("Invalid code")
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.$transaction([
        prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hashedPassword },
        }),
        prisma.passwordResetCode.update({
            where: { id: reset.id },
            data: { used: true },
        }),
        // Invalidate any other outstanding codes too
        prisma.passwordResetCode.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        }),
    ])

    return { success: true }
}
