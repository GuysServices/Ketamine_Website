import { prisma } from './prisma'
import { getSession } from './auth'

/**
 * The admin is gated by owning this specific KeyAuth license key.
 * Only the user whose linked licenseKey.key matches this will be treated as admin.
 */
export const ADMIN_LICENSE_KEY = 'KETAMINEOWNER'

/**
 * Returns true if the user owns the admin license key.
 */
export async function isAdminUser(userId: string | null | undefined): Promise<boolean> {
    if (!userId) return false
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { licenseKey: { select: { key: true } } },
    })
    return user?.licenseKey?.key === ADMIN_LICENSE_KEY
}

/**
 * Returns the current session user ID if they are admin, otherwise null.
 */
export async function getAdminUserId(): Promise<string | null> {
    const session = await getSession()
    if (!session?.userId) return null
    const ok = await isAdminUser(session.userId)
    return ok ? session.userId : null
}

/**
 * Throws if the current session user is not the admin key holder.
 */
export async function requireAdmin(): Promise<string> {
    const userId = await getAdminUserId()
    if (!userId) throw new Error('Forbidden: admin access required')
    return userId
}
