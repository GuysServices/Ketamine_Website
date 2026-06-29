import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ExternalLink, Key, Shield } from "lucide-react"
import { getSession } from "@/lib/auth"
import { SupportedGames } from "@/components/supported-games"
import { SellAuthButton } from "@/components/sellauth-embed"
import { CopyScriptBox } from "@/components/copy-script-box"
import { LiveCounter } from "@/components/live-counter"

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
        <LiveCounter />
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
          <Link href="/reviews">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Reviews</Button>
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
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Complete the quick steps to get your free script key, or upgrade to the paid version to skip the ads entirely.
            </p>

            <CopyScriptBox 
              title="FPS Script Hub"
              script='loadstring(game:HttpGet("https://first-repository-flvb.onrender.com/loader"))()' 
            />

            <CopyScriptBox 
              title="Simulator/Tycoon Script Hub"
              script='getgenv().SCRIPT_KEY = "REPLACE_THIS_TEXT_WITH_KEY"
loadstring(game:HttpGet("https://api.jnkie.com/api/v1/luascripts/public/5ebbbea1ae6350768a593007ee4b66cdd892c17ba7a94816fb0690b246252539/download"))()' 
            />

            <div className="flex flex-col lg:flex-row gap-4 justify-center items-center flex-wrap">
              <Link href="https://link-target.net/1035663/bX9qvMCAikwz" target="_blank" className="w-full lg:w-auto">
                <Button size="lg" className="h-16 px-6 text-base w-full hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 shrink-0" />
                    <span>Free FPS Key</span>
                  </div>
                </Button>
              </Link>

              <Link href="https://loot-link.com/s?EDcFzQwd" target="_blank" className="w-full lg:w-auto">
                <Button size="lg" className="h-16 px-6 text-base w-full hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 flex flex-col items-center justify-center gap-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 shrink-0" />
                    <span>Free Tycoon/Sim Key</span>
                  </div>
                </Button>
              </Link>

              <SellAuthButton
                cart={[{ productId: 743280, variantId: 1216403, quantity: 1 }]}
                shopId={232656}
                modal={true}
                className="h-16 px-6 text-base w-full lg:w-auto hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 text-white shadow-purple-glow flex flex-col items-center justify-center gap-1 ring-2 ring-purple-500/50"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Paid Script NO ADS</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider opacity-80 font-bold leading-none">Unlocks Both Hubs</span>
              </SellAuthButton>
            </div>
          </div>

          {/* Video and Games List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            {/* Video Column */}

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
