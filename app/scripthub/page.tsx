import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Key, Shield } from "lucide-react"
import { getSession } from "@/lib/auth"
import { SupportedGames } from "@/components/supported-games"
import { SellAuthButton } from "@/components/sellauth-embed"

export default async function ScriptHubPage() {
  const session = await getSession()

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl h-16 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-r from-[#0f172a]/80 via-[#1e293b]/80 to-black/80 border border-white/10 ring-1 ring-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-[#0f172a]/90 supports-[backdrop-filter]:bg-[#0f172a]/60">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer group">
          <div className="relative">
            <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent transition-all group-hover:bg-gradient-to-l group-hover:scale-105 duration-300">Ketamine</span>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/rulebook">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Rules</Button>
          </Link>
          <Link href="/robux">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Robux</Button>
          </Link>
          <Link href="/scripthub">
            <Button variant="ghost" className="rounded-xl text-white bg-white/10 transition-all duration-300">Script Hub</Button>
          </Link>
          {session?.userId ? (
            <Link href="/dashboard">
              <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Login</Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                  Register
                </Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center pt-36 pb-24">
        <section className="container mx-auto px-4 w-full max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300 mb-4 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              Script Authentication
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
              <span className="text-white">Ketamine </span>
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                Script Hub
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10">
              Complete the quick steps to get your free script key, or upgrade to the paid version to skip the ads entirely.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="https://link-target.net/6118378/LEy4RkpFAoi2" target="_blank" className="w-full sm:w-auto">
                <Button size="lg" className="h-16 px-8 text-lg w-full hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center gap-3">
                  <Key className="h-5 w-5" />
                  Get Free Key
                </Button>
              </Link>

              <SellAuthButton
                cart={[{ productId: 743280, variantId: 1216403, quantity: 1 }]}
                shopId={232656}
                modal={true}
                className="h-16 px-8 text-lg w-full sm:w-auto hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 text-white shadow-purple-glow flex items-center justify-center gap-3 ring-2 ring-purple-500/50"
              >
                <Shield className="h-5 w-5" />
                Paid Script NO ADS
              </SellAuthButton>
            </div>
          </div>

          {/* Video and Games List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            {/* Video Column */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(147,51,234,0.15)] bg-black/40 aspect-video w-full">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
              <video
                src="https://cdn.discordapp.com/attachments/1290423520051859460/1510839511733633135/2026-05-31_22-54-44_-_Trim.mp4?ex=6a1e4671&is=6a1cf4f1&hm=9cb96a8451fc38d5755bd102d6fddb4e599d2f80f6fa3a01fdde94be7aacb8ef&"
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* Games List Sidebar */}
            <SupportedGames />
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-white/5 py-8 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground/40">
            © 2024 Ketamine. Not affiliated with Roblox Corporation.
          </p>
        </div>
      </footer>
    </div>
  )
}
