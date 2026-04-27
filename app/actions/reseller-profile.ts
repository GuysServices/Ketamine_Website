"use server"

import { prisma } from "@/lib/prisma"
import { getResellerSession, userHasResellerRole } from "@/lib/reseller-auth"
import { revalidatePath } from "next/cache"

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/

async function requireResellerForProfile() {
    const session = await getResellerSession()
    if (!session) throw new Error("Not authenticated")
    const hasRole = await userHasResellerRole(session.discordId)
    if (!hasRole) throw new Error("Reseller role missing")
    const reseller = await prisma.reseller.findUnique({ where: { discordId: session.discordId } })
    if (!reseller) throw new Error("Reseller not found")
    return reseller
}

export async function updateResellerProfile(input: {
    displayName?: string
    bannerColor?: string
    paymentInfo?: string
}) {
    const reseller = await requireResellerForProfile()

    const data: any = {}

    if (input.displayName !== undefined) {
        const trimmed = input.displayName.trim()
        if (trimmed.length > 50) throw new Error("Display name too long (max 50 chars).")
        data.displayName = trimmed || null
    }

    if (input.bannerColor !== undefined) {
        const trimmed = input.bannerColor.trim()
        if (trimmed && !HEX_COLOR.test(trimmed)) {
            throw new Error("Banner color must be a hex color (e.g. #5865F2).")
        }
        data.bannerColor = trimmed || null
    }

    if (input.paymentInfo !== undefined) {
        const trimmed = input.paymentInfo.trim()
        if (trimmed.length > 500) throw new Error("Payment info too long (max 500 chars).")
        data.paymentInfo = trimmed || null
    }

    await prisma.reseller.update({
        where: { id: reseller.id },
        data,
    })

    revalidatePath("/reseller")
    revalidatePath("/reseller/settings")
    return { success: true }
}
