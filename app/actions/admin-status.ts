'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

async function requireModerator() {
    await requireAdmin()
}

// ============================================================================
// SERVICE STATUS
// ============================================================================

export async function upsertServiceStatus(data: {
    id?: string
    serviceKey: string
    name: string
    description: string
    status: string
    message?: string | null
    autoDetect: boolean
    sortOrder?: number
}) {
    await requireModerator()

    if (data.id) {
        await prisma.serviceStatus.update({
            where: { id: data.id },
            data: {
                serviceKey: data.serviceKey,
                name: data.name,
                description: data.description,
                status: data.status,
                message: data.message ?? null,
                autoDetect: data.autoDetect,
                sortOrder: data.sortOrder ?? 0,
            },
        })
    } else {
        await prisma.serviceStatus.create({
            data: {
                serviceKey: data.serviceKey,
                name: data.name,
                description: data.description,
                status: data.status,
                message: data.message ?? null,
                autoDetect: data.autoDetect,
                sortOrder: data.sortOrder ?? 0,
            },
        })
    }

    revalidatePath('/dashboard/games')
    revalidatePath('/dashboard/moderator')
    return { success: true }
}

export async function deleteServiceStatus(id: string) {
    await requireModerator()
    await prisma.serviceStatus.delete({ where: { id } })
    revalidatePath('/dashboard/games')
    revalidatePath('/dashboard/moderator')
    return { success: true }
}

// ============================================================================
// CHANGELOG
// ============================================================================

export async function upsertChangelogEntry(data: {
    id?: string
    version: string
    date: string
    type: string
    title: string
    changes: string[]
}) {
    await requireModerator()

    const cleanChanges = data.changes.map(c => c.trim()).filter(Boolean)

    if (data.id) {
        await prisma.changelogEntry.update({
            where: { id: data.id },
            data: {
                version: data.version,
                date: data.date,
                type: data.type,
                title: data.title,
                changes: cleanChanges,
            },
        })
    } else {
        await prisma.changelogEntry.create({
            data: {
                version: data.version,
                date: data.date,
                type: data.type,
                title: data.title,
                changes: cleanChanges,
            },
        })
    }

    revalidatePath('/dashboard/games')
    revalidatePath('/dashboard/moderator')
    return { success: true }
}

export async function deleteChangelogEntry(id: string) {
    await requireModerator()
    await prisma.changelogEntry.delete({ where: { id } })
    revalidatePath('/dashboard/games')
    revalidatePath('/dashboard/moderator')
    return { success: true }
}
