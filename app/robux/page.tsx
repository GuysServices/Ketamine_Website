'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SellAuthButton } from "@/components/sellauth-embed"
import { ChevronDown, ExternalLink } from "lucide-react"

const SHOP_ID = 232656
const PRODUCT_ID = 696102
const DISCORD = "https://discord.gg/GvAnaf2n8H"

const CATEGORIES = [
  {
    label: "� High Tiers",
    tiers: [
      { amount: "100,000 Robux", price: "$559.99", discord: true },
      { amount: "90,000 Robux",  price: "$504.99", discord: true },
      { amount: "80,000 Robux",  price: "$449.99", discord: true },
      { amount: "70,000 Robux",  price: "$399.99", discord: true },
      { amount: "60,000 Robux",  price: "$349.99", discord: true },
      { amount: "50,000 Robux",  price: "$299.99", discord: true },
      { amount: "45,000 Robux",  price: "$269.99", discord: true },
      { amount: "40,000 Robux",  price: "$239.99", discord: true },
    ],
  },
  {
    label: "⭐ Mid Tiers (BEST VALUE)",
    tiers: [
      { amount: "35,000 Robux", price: "$179.99", discord: true },
      { amount: "30,000 Robux", price: "$149.99", discord: true },
      { amount: "25,000 Robux", price: "$124.99", discord: true },
      { amount: "20,000 Robux", price: "$99.99",  discord: true },
      { amount: "15,000 Robux", price: "$79.99",  discord: true },
      { amount: "12,000 Robux", price: "$64.99",  discord: true },
    ],
  },
  {
    label: "� Popular Tiers",
    tiers: [
      { amount: "10,000 Robux", price: "$59.99", discord: true },
      { amount: "9,000 Robux",  price: "$53.99", discord: true },
      { amount: "8,000 Robux",  price: "$47.99", discord: true },
      { amount: "7,000 Robux",  price: "$42.99", discord: true },
      { amount: "6,000 Robux",  price: "$36.99", discord: true },
    ],
  },
  {
    label: "💰 Budget Deal",
    tiers: [
      { amount: "5,000 Robux", price: "$29.99", variantId: 1109544 },
    ],
  },
  {
    label: "⚪ Standard & Low Tiers",
    tiers: [
      { amount: "4,000 Robux", price: "$24.99", variantId: 1109543 },
      { amount: "3,500 Robux", price: "$22.99", variantId: 1109542 },
      { amount: "3,000 Robux", price: "$19.99", variantId: 1109541 },
      { amount: "2,500 Robux", price: "$16.99", variantId: 1109540 },
      { amount: "2,000 Robux", price: "$13.99", variantId: 1109539 },
      { amount: "1,500 Robux", price: "$9.99",  variantId: 1109502 },
      { amount: "1,000 Robux", price: "$6.99",  variantId: 1109501 },
      { amount: "800 Robux",   price: "$5.49",  variantId: 1109500 },
    ],
  },
]

type Tier = { amount: string; price: string; discord?: boolean; variantId?: number }

function CategoryAccordion({
  label,
  tiers,
  defaultOpen,
}: {
  label: string
  tiers: Tier[]
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors duration-200 group"
      >
        <span className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
          {label}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-purple-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          {tiers.map((tier) => (
            <div
              key={tier.amount}
              className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors duration-150 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-white">{tier.amount}</span>
                <span className="text-xs text-purple-400 font-semibold">{tier.price}</span>
              </div>
              {tier.discord ? (
                <Link
                  href={DISCORD}
                  target="_blank"
                  className="h-8 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="h-3 w-3" />
                  Discord
                </Link>
              ) : (
                <SellAuthButton
                  cart={[{ productId: PRODUCT_ID, variantId: tier.variantId!, quantity: 1 }]}
                  shopId={SHOP_ID}
                  modal={true}
                  className="h-8 px-4 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-purple-600 hover:scale-105 transition-transform duration-200 flex items-center justify-center"
                >
                  Buy
                </SellAuthButton>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RobuxPage() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl h-16 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-r from-[#0f172a]/80 via-[#1e293b]/80 to-black/80 border border-white/10 ring-1 ring-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer group">
          <div className="relative">
            <div className="absolute -inset-2 bg-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent transition-all group-hover:bg-gradient-to-l group-hover:scale-105 duration-300">
              Ketamine
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/rulebook">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">
              Rules
            </Button>
          </Link>
          <Link href="/robux">
            <Button variant="ghost" className="rounded-xl text-white bg-white/10 transition-all duration-300">
              Robux
            </Button>
          </Link>
          <Link href="/scripthub">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">
              Script Hub
            </Button>
          </Link>
          <Link href="/reviews">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">
              Reviews
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
              Register
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center pt-36 pb-24">
        <section className="container mx-auto px-4 w-full max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300 mb-4 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-purple-500 mr-2 animate-pulse"></span>
              Instant Delivery
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
              <span className="text-white">Buy </span>
              <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                Robux
              </span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Pick your tier below and check out securely via SellAuth. All orders are delivered instantly.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {CATEGORIES.map((cat, i) => (
              <CategoryAccordion
                key={cat.label}
                label={cat.label}
                tiers={cat.tiers}
                defaultOpen={i === 2}
              />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="https://discord.gg/S4E467Kf" target="_blank">
              <Button variant="glow" className="h-12 px-8 rounded-full font-semibold hover:bg-white/5 transition-all duration-300 group">
                Questions? Join Discord <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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
