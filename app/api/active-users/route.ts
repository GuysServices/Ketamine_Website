import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Consider active if pinged in the last 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)

    const [externalCount, scriptCount] = await Promise.all([
      prisma.activeSession.count({
        where: {
          type: "external",
          lastSeen: {
            gte: threeMinutesAgo,
          },
        },
      }),
      prisma.activeSession.count({
        where: {
          type: "script",
          lastSeen: {
            gte: threeMinutesAgo,
          },
        },
      }),
    ])

    return NextResponse.json({
      external: externalCount,
      script: scriptCount,
    })
  } catch (error) {
    console.error("Fetch Active Users Error:", error)
    return NextResponse.json({ external: 0, script: 0 }, { status: 500 })
  }
}
