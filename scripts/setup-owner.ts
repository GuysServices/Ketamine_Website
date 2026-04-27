/**
 * One-shot script to set up the admin/owner account.
 *
 * Usage (PowerShell):
 *   npx tsx scripts/setup-owner.ts <username> <password> [discordId]
 *
 * - Creates the user if missing, otherwise updates the password.
 * - Creates the KETAMINEOWNER license key if missing, and links it to the user.
 * - Optionally sets the user's Discord ID for password-reset DMs.
 *
 * Examples:
 *   npx tsx scripts/setup-owner.ts guyzmodz MyStrongPass!1
 *   npx tsx scripts/setup-owner.ts guyzmodz MyStrongPass!1 123456789012345678
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const ADMIN_LICENSE_KEY = "KETAMINEOWNER"

async function main() {
    const [, , username, password, discordId] = process.argv

    if (!username || !password) {
        console.error("Usage: npx tsx scripts/setup-owner.ts <username> <password> [discordId]")
        process.exit(1)
    }

    const prisma = new PrismaClient()
    try {
        const passwordHash = await bcrypt.hash(password, 12)

        // 1) Upsert the user with this password (and optional discord ID)
        const user = await prisma.user.upsert({
            where: { username },
            update: {
                passwordHash,
                isBanned: false,
                ...(discordId ? { discordId } : {}),
            },
            create: {
                username,
                passwordHash,
                isBanned: false,
                ...(discordId ? { discordId } : {}),
            },
        })

        // 2) Make sure the KETAMINEOWNER license key exists, and detach
        //    it from any other user before linking to this one.
        const existingKey = await prisma.licenseKey.findUnique({
            where: { key: ADMIN_LICENSE_KEY },
            include: { user: true },
        })

        if (existingKey) {
            if (existingKey.userId && existingKey.userId !== user.id) {
                console.log(
                    `Detaching ${ADMIN_LICENSE_KEY} from previous user (${existingKey.user?.username}) ...`,
                )
                await prisma.licenseKey.update({
                    where: { id: existingKey.id },
                    data: { userId: null, isUsed: false, usedCount: 0 },
                })
            }
            await prisma.licenseKey.update({
                where: { id: existingKey.id },
                data: {
                    userId: user.id,
                    isUsed: true,
                    isActive: true,
                    usedCount: 1,
                    maxUses: 1,
                    lastUsedAt: new Date(),
                },
            })
        } else {
            await prisma.licenseKey.create({
                data: {
                    key: ADMIN_LICENSE_KEY,
                    userId: user.id,
                    isUsed: true,
                    isActive: true,
                    usedCount: 1,
                    maxUses: 1,
                    lastUsedAt: new Date(),
                },
            })
        }

        console.log("✅ Owner account is ready.")
        console.log(`   Username:   ${user.username}`)
        console.log(`   Password:   ${password}`)
        console.log(`   License:    ${ADMIN_LICENSE_KEY}`)
        if (discordId) {
            console.log(`   Discord ID: ${discordId}`)
        } else {
            console.log("   (No Discord ID set — link it via /dashboard/settings)")
        }
    } finally {
        await prisma.$disconnect()
    }
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
