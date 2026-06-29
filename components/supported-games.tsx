"use client";
import { useState } from "react";
import { Gamepad2, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const FPS_GAMES = [
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

const TYCOON_SIM_GAMES = [
  "Sell Lemons",
  "1 Squish a Dumpling Escape",
  "+1 Speed Brick Escape",
  "+1 SPEED Backrooms Escape - +1 Speed By Luqwig",
  "+1 Speed Keyboard Brainrot Escape",
  "+1 Backrooms Keyboard Escape! - Games About Backrooms",
  "+1 Speed Butter Escape",
];

function GamePanel({ title, subtitle, games }: { title: string; subtitle: string; games: string[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = games.filter((g) =>
    g.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex flex-col h-[500px] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 shrink-0">
        <div className="p-2 bg-purple-500/20 rounded-lg shrink-0">
          <Gamepad2 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
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
        {filtered.length > 0 ? (
          filtered.map((game) => (
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

export function SupportedGames() {
  return (
    <div className="flex flex-col gap-6">
      <GamePanel
        title="Supported Games FPS HUB"
        subtitle="Works natively with these titles"
        games={FPS_GAMES}
      />
      <GamePanel
        title="Supported Games Tycoon/Sim HUB"
        subtitle="Works natively with these titles"
        games={TYCOON_SIM_GAMES}
      />
    </div>
  );
}
