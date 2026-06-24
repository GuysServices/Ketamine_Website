export interface DiscordEmbed {
    title?: string
    description?: string
    color?: number
    fields?: Array<{ name: string; value: string; inline?: boolean }>
    footer?: { text: string }
    timestamp?: string
}

/**
 * Sends a direct message (with optional embeds) to a Discord user via the bot token.
 * Requires DISCORD_BOT_TOKEN env var, and the bot must share at least
 * one server with the target user (and the user must allow DMs from
 * server members).
 */
export async function sendDiscordDM(
    discordUserId: string,
    content: string,
    embeds?: DiscordEmbed[],
): Promise<void> {
    const token = process.env.DISCORD_BOT_TOKEN
    if (!token) {
        console.warn('[discord-dm] DISCORD_BOT_TOKEN not configured. Skipping DM.')
        console.log(`[MOCK DM] To: ${discordUserId}, Content: ${content}`)
        return
    }

    // Step 1: open / fetch the DM channel for this user
    const channelRes = await fetch('https://discord.com/api/v10/users/@me/channels', {
        method: 'POST',
        headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient_id: discordUserId }),
    })

    if (!channelRes.ok) {
        const text = await channelRes.text()
        console.error('[discord-dm] Failed to open DM channel:', channelRes.status, text)
        throw new Error('Failed to open Discord DM channel')
    }

    const channel = (await channelRes.json()) as { id: string }

    // Step 2: send the message
    const msgRes = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bot ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, ...(embeds && embeds.length ? { embeds } : {}) }),
    })

    if (!msgRes.ok) {
        const text = await msgRes.text()
        console.error('[discord-dm] Failed to send DM:', msgRes.status, text)
        throw new Error('Failed to send Discord DM')
    }
}
