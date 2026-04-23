/**
 * KeyAuth.cc API Client
 * Validates license keys against KeyAuth's service.
 * Docs: https://docs.keyauth.cc/
 */

const KEYAUTH_API = 'https://keyauth.win/api/1.3/'

interface KeyAuthResponse {
    success: boolean
    message: string
    sessionid?: string
    info?: {
        username?: string
        subscriptions?: Array<{
            subscription: string
            expiry: string
            timeleft: number
        }>
        ip?: string
        hwid?: string
        createdate?: string
        lastlogin?: string
    }
}

/**
 * Initialize a KeyAuth session. Required before any other calls.
 */
async function initSession(): Promise<string | null> {
    const name = process.env.KEYAUTH_APP_NAME
    const ownerid = process.env.KEYAUTH_OWNER_ID
    const ver = process.env.KEYAUTH_VERSION || '1.0'

    if (!name || !ownerid) {
        console.error('[KeyAuth] Missing KEYAUTH_APP_NAME or KEYAUTH_OWNER_ID env vars')
        return null
    }

    try {
        const body = new URLSearchParams({
            type: 'init',
            ver,
            name,
            ownerid,
        })

        const res = await fetch(KEYAUTH_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
            cache: 'no-store',
        })

        const data: KeyAuthResponse = await res.json()

        if (!data.success) {
            console.error('[KeyAuth] Init failed:', data.message)
            return null
        }

        return data.sessionid || null
    } catch (err) {
        console.error('[KeyAuth] Init error:', err)
        return null
    }
}

export interface KeyAuthVerifyResult {
    valid: boolean
    error?: string
    info?: KeyAuthResponse['info']
}

/**
 * Verify a KeyAuth license key.
 * Returns { valid: true, info } if the key is valid.
 */
export async function verifyKeyAuthLicense(key: string): Promise<KeyAuthVerifyResult> {
    const name = process.env.KEYAUTH_APP_NAME
    const ownerid = process.env.KEYAUTH_OWNER_ID

    if (!name || !ownerid) {
        return { valid: false, error: 'KeyAuth not configured on server' }
    }

    const sessionid = await initSession()
    if (!sessionid) {
        return { valid: false, error: 'Failed to connect to KeyAuth service' }
    }

    try {
        // Generate a random HWID per-verification so keys don't get locked to a single device.
        const hwid = `web-${Math.random().toString(36).slice(2, 12)}`

        const body = new URLSearchParams({
            type: 'license',
            key,
            hwid,
            sessionid,
            name,
            ownerid,
        })

        const res = await fetch(KEYAUTH_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
            cache: 'no-store',
        })

        const data: KeyAuthResponse = await res.json()

        if (!data.success) {
            return { valid: false, error: data.message || 'Invalid license key' }
        }

        return { valid: true, info: data.info }
    } catch (err) {
        console.error('[KeyAuth] License verify error:', err)
        return { valid: false, error: 'Failed to verify license' }
    }
}
