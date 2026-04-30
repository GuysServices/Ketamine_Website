'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

const MAX_CONTENT_BYTES = 500_000 // 500KB cap on stored config text
const MAX_NAME_LENGTH = 100
const MAX_DESCRIPTION_LENGTH = 1000
const MAX_TAGS = 8

export interface ConfigSummary {
    id: string
    name: string
    description: string | null
    game: string
    fileName: string
    fileSize: number
    tags: string[]
    downloads: number
    uploaderId: string
    uploaderName: string
    createdAt: string
    isMine: boolean
}

async function requireUser() {
    const session = await getSession()
    if (!session?.userId) throw new Error('Not signed in')
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, username: true, isBanned: true, isModerator: true },
    })
    if (!user) throw new Error('User not found')
    if (user.isBanned) throw new Error('Account banned')
    return user
}

/**
 * Upload a new config. Body fields are plain strings/numbers — the client
 * reads the file with FileReader and sends the text content directly.
 */
export async function uploadConfig(input: {
    name: string
    description?: string
    game: string
    fileName: string
    content: string
    tags?: string[]
}): Promise<{ id: string }> {
    const user = await requireUser()

    const name = input.name.trim().slice(0, MAX_NAME_LENGTH)
    const game = input.game.trim().slice(0, 60)
    const fileName = input.fileName.trim().slice(0, 200)
    const description = input.description?.trim().slice(0, MAX_DESCRIPTION_LENGTH) || null
    const content = input.content
    const tags = (input.tags || [])
        .map(t => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, MAX_TAGS)

    if (!name) throw new Error('Name required')
    if (!game) throw new Error('Game required')
    if (!fileName) throw new Error('File name required')
    if (!content) throw new Error('Empty file')

    const byteSize = Buffer.byteLength(content, 'utf8')
    if (byteSize > MAX_CONTENT_BYTES) {
        throw new Error(`File too large (${(byteSize / 1024).toFixed(0)}KB). Max ${MAX_CONTENT_BYTES / 1024}KB.`)
    }

    const created = await prisma.config.create({
        data: {
            name,
            description,
            game,
            fileName,
            fileSize: byteSize,
            content,
            tags,
            uploaderId: user.id,
            uploaderName: user.username,
        },
    })

    revalidatePath('/dashboard/configs')
    return { id: created.id }
}

/**
 * Search configs by free-text query (matches name, description, game, tags, uploader).
 * Returns up to 100 results sorted by newest first.
 */
export async function searchConfigs(params: {
    query?: string
    game?: string
}): Promise<ConfigSummary[]> {
    const user = await requireUser()
    const q = (params.query || '').trim()
    const game = (params.game || '').trim()

    const where: any = {}
    if (game) where.game = { equals: game, mode: 'insensitive' }
    if (q) {
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { game: { contains: q, mode: 'insensitive' } },
            { uploaderName: { contains: q, mode: 'insensitive' } },
            { tags: { has: q.toLowerCase() } },
        ]
    }

    const rows = await prisma.config.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
            id: true,
            name: true,
            description: true,
            game: true,
            fileName: true,
            fileSize: true,
            tags: true,
            downloads: true,
            uploaderId: true,
            uploaderName: true,
            createdAt: true,
        },
    })

    return rows.map((r: any) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        isMine: r.uploaderId === user.id,
    }))
}

/**
 * Get the list of distinct games for the filter dropdown.
 */
export async function getConfigGames(): Promise<string[]> {
    await requireUser()
    const rows = await prisma.config.findMany({
        select: { game: true },
        distinct: ['game'],
        orderBy: { game: 'asc' },
        take: 50,
    })
    return rows.map((r: any) => r.game)
}

/**
 * Fetch a single config's full content for download. Increments the counter.
 */
export async function downloadConfig(id: string): Promise<{
    fileName: string
    content: string
}> {
    await requireUser()
    const cfg = await prisma.config.findUnique({
        where: { id },
        select: { id: true, fileName: true, content: true },
    })
    if (!cfg) throw new Error('Config not found')

    // Best-effort counter bump; ignore failure
    prisma.config
        .update({ where: { id }, data: { downloads: { increment: 1 } } })
        .catch(() => undefined)

    return { fileName: cfg.fileName, content: cfg.content }
}

/**
 * Delete a config. Only the uploader or a moderator can delete.
 */
export async function deleteConfig(id: string): Promise<void> {
    const user = await requireUser()
    const cfg = await prisma.config.findUnique({
        where: { id },
        select: { uploaderId: true },
    })
    if (!cfg) throw new Error('Config not found')
    if (cfg.uploaderId !== user.id && !user.isModerator) {
        throw new Error('Not authorized to delete this config')
    }
    await prisma.config.delete({ where: { id } })
    revalidatePath('/dashboard/configs')
}
