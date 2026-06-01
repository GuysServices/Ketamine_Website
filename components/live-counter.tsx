"use client"

import { useState, useEffect } from "react"
import { Activity } from "lucide-react"

export function LiveCounter() {
  const [counts, setCounts] = useState({ external: 0, script: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/active-users")
        if (res.ok) {
          const data = await res.json()
          setCounts(data)
        }
      } catch (error) {
        // Silently fail if API is down
      }
    }

    // Fetch immediately
    fetchCounts()

    // Then poll every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!isClient) return null

  const total = counts.external + counts.script
  // We can show "0 Online" to show the feature works, or hide it. 
  // Let's always show it, or maybe just show 0 if they want to test it.

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md hidden lg:flex shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all hover:bg-white/10 hover:border-white/20">
      <div className="flex items-center gap-2 pr-2 border-r border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs font-semibold text-slate-300">
          <span className="text-white font-bold">{total}</span> Online
        </span>
      </div>
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-slate-400">
        <span className="flex items-center gap-1.5" title="Script Hub Active Users">
          <Activity className="w-3 h-3 text-purple-400" />
          <span className="text-purple-300">{counts.script}</span> Hub
        </span>
        <span className="flex items-center gap-1.5" title="External Active Users">
          <Activity className="w-3 h-3 text-blue-400" />
          <span className="text-blue-300">{counts.external}</span> Ext
        </span>
      </div>
    </div>
  )
}
