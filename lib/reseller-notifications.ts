import { sendDiscordDM, type DiscordEmbed } from "@/lib/discord-dm"

/**
 * Fire-and-forget DM helpers for reseller account events.
 * All errors are caught and logged so admin actions don't fail
 * if the DM can't be delivered (e.g., user has DMs disabled).
 */

async function safeDM(discordId: string, content: string, embeds: DiscordEmbed[]) {
    try {
        await sendDiscordDM(discordId, content, embeds)
    } catch (err) {
        console.warn("[reseller-notifications] DM failed:", err)
    }
}

export function notifyTopUp(discordId: string, opts: {
    username: string
    amount: number
    newBalance: number
    note?: string | null
}) {
    const embed: DiscordEmbed = {
        title: "💰 Credits Added",
        description: `Your reseller account has been topped up with **${opts.amount} credits**.`,
        color: 0x10b981, // emerald
        fields: [
            { name: "Amount Added", value: `+${opts.amount}`, inline: true },
            { name: "New Balance", value: `${opts.newBalance} credits`, inline: true },
            ...(opts.note ? [{ name: "Note", value: opts.note }] : []),
        ],
        footer: { text: "Ketamine Reseller Program" },
        timestamp: new Date().toISOString(),
    }
    void safeDM(discordId, "", [embed])
}

export function notifyDeduct(discordId: string, opts: {
    username: string
    amount: number
    newBalance: number
    note?: string | null
}) {
    const embed: DiscordEmbed = {
        title: "⚠️ Credits Adjusted",
        description: `An admin has deducted **${opts.amount} credits** from your account.`,
        color: 0xf59e0b, // amber
        fields: [
            { name: "Amount Removed", value: `-${opts.amount}`, inline: true },
            { name: "New Balance", value: `${opts.newBalance} credits`, inline: true },
            ...(opts.note ? [{ name: "Reason", value: opts.note }] : []),
        ],
        footer: { text: "Contact an admin if you believe this is a mistake." },
        timestamp: new Date().toISOString(),
    }
    void safeDM(discordId, "", [embed])
}

export function notifySuspended(discordId: string, username: string) {
    const embed: DiscordEmbed = {
        title: "🚫 Reseller Account Suspended",
        description:
            "Your reseller account has been suspended. Existing keys will keep working for your customers, but you can't generate new keys until the suspension is lifted.",
        color: 0xef4444, // red
        footer: { text: "Contact an admin in our Discord server for details." },
        timestamp: new Date().toISOString(),
    }
    void safeDM(discordId, "", [embed])
}

export function notifyRedemption(discordId: string, opts: {
    customerUsername: string
    customerRoblox?: string | null
    planLabel: string
    keyValue: string
}) {
    const embed: DiscordEmbed = {
        title: "🎉 Customer redeemed your key!",
        description: `**${opts.customerUsername}** just redeemed one of your **${opts.planLabel}** keys.`,
        color: 0x10b981, // emerald
        fields: [
            { name: "Customer", value: opts.customerUsername, inline: true },
            ...(opts.customerRoblox
                ? [{ name: "Roblox", value: opts.customerRoblox, inline: true }]
                : []),
            { name: "Plan", value: opts.planLabel, inline: true },
            { name: "Key", value: `\`${opts.keyValue}\`` },
        ],
        footer: { text: "Ketamine Reseller Program" },
        timestamp: new Date().toISOString(),
    }
    void safeDM(discordId, "", [embed])
}

export function notifyReactivated(discordId: string, username: string) {
    const embed: DiscordEmbed = {
        title: "✅ Reseller Account Reactivated",
        description: "Welcome back! You can generate keys again.",
        color: 0x10b981, // emerald
        footer: { text: "Ketamine Reseller Program" },
        timestamp: new Date().toISOString(),
    }
    void safeDM(discordId, "", [embed])
}
