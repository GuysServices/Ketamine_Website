import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, Zap, Download, Check, ExternalLink, LucideIcon } from "lucide-react"
import { SellAuthButton } from "@/components/sellauth-embed"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl h-16 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-r from-[#0f172a]/80 via-[#1e293b]/80 to-black/80 border border-white/10 ring-1 ring-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-[#0f172a]/90 supports-[backdrop-filter]:bg-[#0f172a]/60">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer group">
          <div className="relative">
            <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent transition-all group-hover:bg-gradient-to-l group-hover:scale-105 duration-300">Ketamine</span>
          </div>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/rulebook">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Rules</Button>
          </Link>
          <Link href="/robux">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Robux</Button>
          </Link>
                    <Link href="/login">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Login</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
              Register
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center relative z-10 w-full max-w-6xl">
          {/* Ambient Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none -z-10" />

          <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300 mb-6 backdrop-blur-sm animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
            v2.0 Now Available
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] animate-in slide-in-from-bottom-5 fade-in duration-700">
            <span className="text-white drop-shadow-2xl">Dominate Roblox with</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent animate-shimmer bg-[size:200%_auto]">
              Ketamine External
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
            Fastest Attach To Roblox And Best Performance For High End and Low End PC'S
            <span className="text-purple-400 font-semibold"> No downloads required.</span>
            <br />
            Integrated directly into games by developers.
          </p>

          {/* Pricing Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-700 delay-200">
            <SellAuthButton
              cart={[{ productId: 691583, variantId: 1099667, quantity: 1 }]}
              shopId={232656}
              modal={true}
              className="h-16 px-6 flex-col shadow-purple-glow hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 text-white flex items-center justify-center"
            >
              <span className="text-lg">1 Day</span>
              <span className="text-xs opacity-80">Trial</span>
            </SellAuthButton>
            <SellAuthButton
              cart={[{ productId: 691583, variantId: 1099668, quantity: 1 }]}
              shopId={232656}
              modal={true}
              className="h-16 px-6 flex-col shadow-purple-glow hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 text-white flex items-center justify-center"
            >
              <span className="text-lg">7 Days</span>
              <span className="text-xs opacity-80">Weekly</span>
            </SellAuthButton>
            <SellAuthButton
              cart={[{ productId: 691583, variantId: 1099669, quantity: 1 }]}
              shopId={232656}
              modal={true}
              className="h-16 px-6 flex-col shadow-purple-glow hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-600 text-white flex items-center justify-center"
            >
              <span className="text-lg">30 Days</span>
              <span className="text-xs opacity-80">Monthly</span>
            </SellAuthButton>
            <SellAuthButton
              cart={[{ productId: 691583, variantId: 1099670, quantity: 1 }]}
              shopId={232656}
              modal={true}
              className="h-16 px-6 flex-col shadow-purple-glow hover:scale-105 transition-transform duration-300 rounded-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-600 text-white flex items-center justify-center ring-2 ring-yellow-500/50"
            >
              <span className="text-lg">Lifetime</span>
              <span className="text-xs opacity-80">Best Value</span>
            </SellAuthButton>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5 w-full justify-center animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
            <Link href="https://discord.gg/S4E467Kf" target="_blank">
              <Button size="lg" variant="glow" className="h-14 px-10 text-lg w-full sm:w-auto hover:bg-white/5 transition-all duration-300 rounded-full group font-semibold">
                Join Discord <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Roblox Accounts Section */}
        <section id="accounts" className="container mx-auto px-4 pb-24 relative z-10 w-full max-w-6xl">
          <div className="text-center mb-10 animate-in slide-in-from-bottom-5 fade-in duration-700">
            <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300 mb-4 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              Aged Accounts In Stock
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              <span className="text-white">Buy </span>
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">Roblox Accounts</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hand-aged Roblox accounts ready for instant delivery. Pick a tier below and check out securely via SellAuth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
            <AccountCard
              tier="30+ Day ALT"
              variantId={1109441}
              quantity={4}
              description="Fresh ALT accounts aged 30+ days. Great for quick uses & burner needs."
              accent="from-purple-600 to-purple-600"
            />
            <AccountCard
              tier="90+ Days Old"
              variantId={1109442}
              quantity={4}
              description="Accounts aged 90+ days. Better trust score, ideal for daily play."
              accent="from-purple-600 to-purple-600"
              highlight
            />
            <AccountCard
              tier="Aged 100-350 Days"
              variantId={1109443}
              quantity={1}
              description="Premium aged accounts (100-350 days). Highest trust tier we offer."
              accent="from-yellow-600 to-yellow-600"
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 pb-32 relative z-10 w-full max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={Download}
              title="External Cheat"
              desc="Easy To Use UI, Setup Is Easy And Fast"
              delay="delay-100"
            />
            <FeatureCard
              icon={Shield}
              title="Undetectable"
              desc="Since it's built-in by developers, anti-cheats don't flag it."
              delay="delay-200"
            />
            <FeatureCard
              icon={Zap}
              title="Instant Attach"
              desc="Fastest Attach To Roblox And Best Performance For High End and Low End PC'S"
              delay="delay-300"
            />
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-white/5 py-12 bg-black/40 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-2xl font-bold bg-gradient-to-tr from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">Ketamine</span>
            <p className="text-sm text-muted-foreground/60 max-w-md">
              Redefining Roblox administration with style and power.
            </p>
          </div>
          <div className="flex gap-6 justify-center text-sm text-muted-foreground mb-8">
            <Link href="#" className="hover:text-purple-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">Privacy</Link>
            <Link href="/rulebook" className="hover:text-purple-400 transition-colors">Rules</Link>
            <Link href="#" className="hover:text-purple-400 transition-colors">Guide</Link>
          </div>
          <p className="text-xs text-muted-foreground/40">
            © 2024 Ketamine. Not affiliated with Roblox Corporation.
          </p>
        </div>
      </footer>
    </div>
  )
}

function AccountCard({
  tier,
  variantId,
  quantity,
  description,
  accent,
  highlight,
}: {
  tier: string
  variantId: number
  quantity: number
  description: string
  accent: string
  highlight?: boolean
}) {
  return (
    <Card
      className={`group relative overflow-hidden border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/20 ${
        highlight ? "ring-2 ring-purple-500/50" : ""
      }`}
    >
      {highlight && (
        <div className="absolute top-3 right-3 rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
          POPULAR
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl text-white group-hover:text-purple-300 transition-colors">
          {tier}
        </CardTitle>
        <CardDescription className="text-muted-foreground/80 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <SellAuthButton
          cart={[{ productId: 696068, variantId, quantity }]}
          shopId={232656}
          modal={true}
          className={`w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r ${accent} shadow-purple-glow hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center gap-2`}
        >
          <Check className="h-4 w-4" />
          <span>Purchase</span>
        </SellAuthButton>
      </CardContent>
    </Card>
  )
}

function FeatureCard({ icon: Icon, title, desc, delay }: { icon: LucideIcon, title: string, desc: string, delay?: string }) {
  return (
    <Card className={`group border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/20 animate-in fade-in zoom-in-50 duration-700 ${delay}`}>
      <CardHeader>
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500/20 to-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl group-hover:text-purple-300 transition-colors">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground/80 leading-relaxed">
          {desc}
        </p>
      </CardContent>
    </Card>
  )
}
