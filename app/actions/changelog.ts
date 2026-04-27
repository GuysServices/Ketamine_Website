'use server'

import { prisma } from '@/lib/prisma'

export interface PublicChangelogEntry {
    id: string
    version: string
    date: string
    type: string
    title: string
    changes: string[]
    createdAt: string
}

/**
 * Public read-only changelog fetch — no auth required.
 * Returns newest entries first.
 */
export async function getChangelog(limit = 30): Promise<PublicChangelogEntry[]> {
    const entries = await prisma.changelogEntry.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
    return entries.map((e: any) => ({
        id: e.id,
        version: e.version,
        date: e.date,
        type: e.type,
        title: e.title,
        changes: e.changes,
        createdAt: e.createdAt.toISOString(),
    }))
}
