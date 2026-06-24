import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { searchConfigs, getConfigGames } from '@/app/actions/configs'
import { ConfigsBrowser } from '@/components/configs-browser'

export const dynamic = 'force-dynamic'

export default async function ConfigsPage() {
    const session = await getSession()
    if (!session?.userId) {
        redirect('/login')
    }

    const [initial, games] = await Promise.all([
        searchConfigs({}),
        getConfigGames(),
    ])

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <ConfigsBrowser initial={initial} games={games} />
            </div>
        </div>
    )
}
