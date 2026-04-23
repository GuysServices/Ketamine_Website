export interface ChangelogEntry {
    version: string
    date: string
    type: 'major' | 'feature' | 'fix'
    title: string
    changes: string[]
}

/**
 * Ketamine Dashboard Changelog.
 * Add new entries to the TOP of the array (newest first).
 */
export const changelog: ChangelogEntry[] = [
    {
        version: '2.1.0',
        date: 'April 23, 2026',
        type: 'major',
        title: 'KeyAuth.cc Integration & Theme Overhaul',
        changes: [
            'Integrated KeyAuth.cc for license key validation',
            'Device-locked license keys (IP + browser fingerprint)',
            'New Ketamine purple theme across the dashboard',
            'External Status page with live service health checks',
            'Added changelog section for transparent updates',
        ],
    },
    {
        version: '2.0.5',
        date: 'April 22, 2026',
        type: 'fix',
        title: 'Production Stability Fixes',
        changes: [
            'Fixed Supabase connection pooler authentication',
            'Made Redis client lazy-connect to prevent build failures',
            'Force-dynamic rendering for database-dependent pages',
            'Updated Cloudflare Turnstile configuration',
        ],
    },
    {
        version: '2.0.0',
        date: 'April 21, 2026',
        type: 'major',
        title: 'Ketamine Launch',
        changes: [
            'Initial release of the Ketamine dashboard',
            'Discord invite integration',
            'License redemption flow',
            'Cloudflare Turnstile bot protection on login',
            'Moderator panel for admin controls',
        ],
    },
]
