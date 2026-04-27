import { NextRequest, NextResponse } from "next/server"
import { destroyResellerSession } from "@/lib/reseller-auth"

export async function POST(req: NextRequest) {
    await destroyResellerSession()
    return NextResponse.redirect(new URL("/reseller/login", req.url), { status: 303 })
}

export async function GET(req: NextRequest) {
    await destroyResellerSession()
    return NextResponse.redirect(new URL("/reseller/login", req.url), { status: 303 })
}
