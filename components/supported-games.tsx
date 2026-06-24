"use client";

import { useState } from "react";
import { Gamepad2, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SUPPORTED_GAMES = [
  "Airsoft Battles",
  "Arsenal",
  "Big Paintball",
  "Blox Strike",
  "Bodycam",
  "Bullet Storm",
  "Combat Arena",
  "Counter Blox",
  "Deadline",
  "Deathshot",
  "Duels",
  "FFA Headshot",
  "FPS Duels",
  "Flag Wars",
  "Flick",
  "Gun Evolution",
  "Gun Grounds FFA",
  "Gunfight Arena",
  "Havok",
  "HyperShot",
  "Ketamine Universal",
  "Murder Duels",
  "Murder Mystery 2",
  "One Scope",
  "OneTap",
  "Pistol Arena",
  "Realistic Hood",
  "Recoil",
  "Reloaded Guns",
  "Rivals",
  "Sniper Arena",
  "Sniper Duels",
  "Strafe",
  "The Bronx Duels",
  "Universal ESP",
  "Weaponry"
];

export function SupportedGames() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = SUPPORTED_GAMES.filter((game) =>
    game.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[500px] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 shrink-0">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Supported Games</h3>
          <p className="text-xs text-muted-foreground">Works natively with these titles</p>
        </div>
      </div>

      <div className="relative mb-4 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search games..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:ring-purple-500 rounded-xl h-10"
        />
      </div>

      <div className="overflow-y-auto pr-2 space-y-2 flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <div key={game} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
              <CheckCircle2 className="w-4 h-4 text-purple-500/50 group-hover:text-purple-400 transition-colors shrink-0" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{game}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            No games found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
