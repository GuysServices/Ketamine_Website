import { NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

// You will get this secret from your SellAuth Dashboard -> Developer Settings -> Webhooks
const WEBHOOK_SECRET = process.env.SELLAUTH_WEBHOOK_SECRET || ""

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const headersList = await headers()
    
    // SellAuth usually sends the signature in a header like X-Signature or X-Sellauth-Signature
    const signature = headersList.get("x-signature") || headersList.get("x-sellauth-signature")

    if (!WEBHOOK_SECRET) {
      console.error("[SellAuth Webhook] Webhook secret is not configured in .env")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // Verify the HMAC signature to ensure it actually came from SellAuth
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(bodyText)
      .digest("hex")

    // Secure compare to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error("[SellAuth Webhook] Invalid signature mismatch.")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Parse the JSON body now that we know it's authentic
    const payload = JSON.parse(bodyText)
    console.log("[SellAuth Webhook] Received authentic event:", payload.event || payload.type)

    // We only care about completed orders
    if (payload.event === "order.completed" || payload.type === "order.completed") {
      const orderData = payload.data || payload

      // Extract Discord ID. 
      // This varies depending on how SellAuth sends it. It might be in custom_fields or customer object.
      let discordId = null;
      let discordUsername = null;

      if (orderData.customer?.discord_id) {
        discordId = orderData.customer.discord_id
        discordUsername = orderData.customer.discord_username
      } else if (orderData.custom_fields) {
        // Fallback if they provide it via a custom field at checkout
        const discordField = orderData.custom_fields.find((f: any) => f.name.toLowerCase().includes("discord"))
        if (discordField) {
            discordId = discordField.value // Might be username or ID depending on how you configured the field
        }
      }

      const email = orderData.customer?.email || orderData.email
      
      if (!discordId && !email) {
          console.log("[SellAuth Webhook] No Discord ID or email found, cannot sync buyer.")
          return NextResponse.json({ success: true, note: "No identifier found" }, { status: 200 })
      }

      // 1. Ensure the "Verified Buyer" badge exists in the database
      let buyerBadge = await prisma.badge.findFirst({
        where: { name: "Verified Buyer" }
      })

      if (!buyerBadge) {
        buyerBadge = await prisma.badge.create({
          data: {
            name: "Verified Buyer",
            description: "Has purchased a product from Ketamine via SellAuth",
            color: "#8b5cf6", // Purple
            icon: "check-circle"
          }
        })
      }

      // 2. Find or create the user based on discordId
      // Because discordId might just be their username if entered manually, we handle this carefully
      let user = null;

      if (discordId) {
          user = await prisma.user.findFirst({
              where: { discordId: discordId }
          })
      }

      // Fallback: If not found by Discord, we can't reliably find them by email if we don't store email,
      // but let's assume we create a skeleton account for them if they don't exist yet!
      if (!user && discordId) {
          console.log(`[SellAuth Webhook] Creating new user for Discord ID: ${discordId}`)
          user = await prisma.user.create({
              data: {
                  username: discordUsername || `Buyer_${Math.random().toString(36).substring(2, 8)}`,
                  passwordHash: "external_oauth_no_password",
                  discordId: discordId,
                  discordUsername: discordUsername || discordId,
              }
          })
      }

      // 3. Assign the badge to the user
      if (user) {
          await prisma.user.update({
              where: { id: user.id },
              data: {
                  badges: {
                      connect: { id: buyerBadge.id }
                  }
              }
          })
          console.log(`[SellAuth Webhook] Successfully granted Verified Buyer badge to user ${user.username}`)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("[SellAuth Webhook Error]:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
