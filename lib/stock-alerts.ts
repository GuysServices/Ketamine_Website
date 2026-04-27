import { prisma } from "@/lib/prisma"
import { PLANS, type PlanId } from "@/lib/reseller-plans"
import { redis } from "@/lib/redis"

export const LOW_STOCK_THRESHOLD = 5
const ALERT_COOLDOWN_SECONDS = 60 * 60 // 1 hour between repeat alerts per plan

/**
 * After any stock-affecting operation, call this to fire a Discord webhook
 * if a plan has dropped below the threshold. Uses Redis to debounce so we
 * don't spam the channel on every claim.
 */
export async function checkLowStockAndAlert(planId: PlanId | string) {
    const webhookUrl = process.env.DISCORD_LOW_STOCK_WEBHOOK_URL
    if (!webhookUrl) return // feature disabled — no env var set

    if (!(planId in PLANS)) return
    const plan = PLANS[planId as PlanId]

    const count = await prisma.licenseKey.count({
        where: {
            plan: planId,
            resellerId: null,
            userId: null,
            isUsed: false,
        },
    })

    const flagKey = `low-stock-alerted:${planId}`

    if (count >= LOW_STOCK_THRESHOLD) {
        // Stock is healthy — clear any existing alert flag so we'll alert again next time it drops
        try {
            await redis.del(flagKey)
        } catch {
            // ignore — Redis is non-critical here
        }
        return
    }

    // Stock is low. Check if we've already alerted recently.
    let alreadyAlerted = false
    try {
        alreadyAlerted = (await redis.get(flagKey)) !== null
    } catch {
        // Redis down — fall through and alert anyway, better to spam than miss
    }
    if (alreadyAlerted) return

    // Fire the webhook
    const isOut = count === 0
    const payload = {
        username: "Stock Watcher",
        embeds: [
            {
                title: isOut ? `🚨 Out of stock: ${plan.label}` : `⚠️ Low stock: ${plan.label}`,
                description: isOut
                    ? `**${plan.label}** keys are completely sold out. Resellers can't generate any more until you restock.`
                    : `Only **${count}** ${plan.label} key${count === 1 ? "" : "s"} left in stock.`,
                color: isOut ? 0xef4444 : 0xf59e0b,
                fields: [
                    { name: "Plan", value: plan.label, inline: true },
                    { name: "In Stock", value: String(count), inline: true },
                    { name: "Customer Price", value: `$${plan.customerPrice}`, inline: true },
                ],
                footer: {
                    text: "You won't get another alert for this plan for 1 hour or until restocked.",
                },
                timestamp: new Date().toISOString(),
            },
        ],
    }

    try {
        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
        if (!res.ok) {
            console.warn(`[stock-alerts] Webhook returned ${res.status}`)
            return
        }

        // Set the alert flag so we don't spam
        try {
            await redis.set(flagKey, "1", "EX", ALERT_COOLDOWN_SECONDS)
        } catch {
            // ignore
        }
    } catch (err) {
        console.warn("[stock-alerts] Failed to send webhook:", err)
    }
}
