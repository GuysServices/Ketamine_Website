"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function CopyScriptBox({ script }: { script: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl w-full mx-auto mb-10 group relative animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative p-4 sm:p-5 rounded-xl bg-[#0f172a]/80 border border-white/10 flex flex-col gap-3 backdrop-blur-md hover:border-purple-500/30 transition-all shadow-[0_0_20px_rgba(147,51,234,0.1)]">
        <div className="flex justify-between items-center w-full">
          <div className="text-xs text-slate-400 uppercase tracking-widest font-sans font-bold flex items-center gap-2">
            <span className="h-px w-4 sm:w-8 bg-white/10"></span>
            Script
          </div>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 py-1.5 px-3 rounded-lg transition-colors border border-purple-500/20 hover:border-purple-500/40"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
        </div>
        <div className="w-full overflow-x-auto bg-black/50 rounded-lg p-4 border border-white/5 scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
          <code className="text-purple-300 font-mono text-sm sm:text-base whitespace-nowrap block">
            {script}
          </code>
        </div>
      </div>
    </div>
  )
}
