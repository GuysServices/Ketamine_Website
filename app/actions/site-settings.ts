'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

const DEFAULT_LOADER_URL =
    'https://raw.githubusercontent.com/GuysModz/GuyzModzScheduleITrainer/main/Loader.zip'

/**
 * Get the current loader download URL.
 * Falls back to the hardcoded default if no DB override exists.
 */
export async function getLoaderDownloadUrl(): Promise<string> {
    try {
        const row = await prisma.siteSetting.findUnique({
            where: { key: 'loader_download_url' },
        })
        return row?.value || DEFAULT_LOADER_URL
    } catch {
        return DEFAULT_LOADER_URL
    }
}

/**
 * Admin-only: update the loader download URL stored in the database.
 */
export async function updateLoaderDownloadUrl(url: string): Promise<{ success: boolean; error?: string }> {
    await requireAdmin()

    const trimmed = url.trim()
    if (!trimmed) {
        return { success: false, error: 'URL cannot be empty' }
    }

    try {
        new URL(trimmed) // validate URL format
    } catch {
        return { success: false, error: 'Invalid URL format' }
    }

    await prisma.siteSetting.upsert({
        where: { key: 'loader_download_url' },
        create: { key: 'loader_download_url', value: trimmed },
        update: { value: trimmed },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/moderator')
    return { success: true }
}
