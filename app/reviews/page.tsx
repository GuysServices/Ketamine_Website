import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Quote, ExternalLink } from "lucide-react"
import { LiveCounter } from "@/components/live-counter"
import { getSession } from "@/lib/auth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const REVIEWS = [
  {
    id: 1,
    author: "NightBlade",
    rating: 5,
    date: "1 day ago",
    content: "Ketamine is by far the best script I've used. The execution speed is insane and I haven't experienced a single crash. The customer support is also top-tier.",
    verified: true,
  },
  {
    id: 2,
    author: "xX_Sniper_Xx",
    rating: 5,
    date: "3 days ago",
    content: "Bought lifetime and it was the best decision ever. The aimbot is incredibly smooth and the ESP works flawlessly. Definitely worth the price.",
    verified: true,
  },
  {
    id: 3,
    author: "PhantomGhost",
    rating: 5,
    date: "1 week ago",
    content: "I've tried many other executors and scripts, but this one takes the crown. The configs are perfectly tuned and the setup was very simple.",
    verified: true,
  },
  {
    id: 4,
    author: "ToxicVenom",
    rating: 4,
    date: "2 weeks ago",
    content: "Great product! Only giving 4 stars because the free key system can be a bit tedious, but the script itself is amazing. Upgraded to premium shortly after.",
    verified: true,
  },
  {
    id: 5,
    author: "ShadowNinja",
    rating: 5,
    date: "1 month ago",
    content: "Incredible value for the features you get. The UI is clean, easy to navigate, and the regular updates keep it undetected.",
    verified: true,
  },
  {
    id: 6,
    author: "LethalStrike",
    rating: 5,
    date: "1 month ago",
    content: "The best purchase I've made for Roblox. The support team on Discord is super helpful and the script injection is basically instant.",
    verified: true,
  }
]

export default async function ReviewsPage() {
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
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Script Hub</Button>
          </Link>
          <Link href="/reviews">
            <Button variant="ghost" className="rounded-xl text-white bg-white/10 transition-all duration-300">Reviews</Button>
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
              Customer Feedback
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
              <span className="text-white">Trusted by </span>
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                Thousands
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              See what our community has to say about Ketamine. We pride ourselves on providing the best experience possible.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full justify-center mt-8 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
              <Link href="https://discord.gg/S4E467Kf" target="_blank">
                <Button size="lg" variant="glow" className="h-14 px-10 text-lg w-full sm:w-auto hover:bg-white/5 transition-all duration-300 rounded-full group font-semibold">
                  Join our Discord <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            {REVIEWS.map((review) => (
              <Card key={review.id} className="group border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/20">
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white group-hover:text-purple-300 transition-colors">{review.author}</span>
                      {review.verified && (
                        <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-slate-600"}`} />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-white/5 rotate-180" />
                    <p className="text-muted-foreground/80 leading-relaxed text-sm relative z-10 pl-4">
                      {review.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
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
