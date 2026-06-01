import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, identifier } = body

    if (!type || !identifier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type !== "external" && type !== "script") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // Upsert the session, setting lastSeen to now
    await prisma.activeSession.upsert({
      where: {
        type_identifier: {
          type,
          identifier,
        },
      },
      update: {
        lastSeen: new Date(),
      },
      create: {
        type,
        identifier,
      },
    })

    // Lightweight cleanup of sessions older than 1 hour (1% chance to run so it doesn't impact performance on every ping)
    if (Math.random() < 0.01) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      await prisma.activeSession.deleteMany({
        where: {
          lastSeen: {
            lt: oneHourAgo,
          },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ping Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
