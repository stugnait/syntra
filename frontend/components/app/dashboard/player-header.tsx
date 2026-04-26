"use client"

import { useState } from "react"
import Link from "next/link"
import { RefreshCw, Shield, Wifi, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const SYNC_STATES = {
  active:       { text: "Auto Sync Active",      color: "emerald",  icon: Wifi },
  processing:   { text: "Processing New Demo",   color: "violet",   icon: RefreshCw },
  error:        { text: "Sync Failed",            color: "red",      icon: AlertCircle },
  disconnected: { text: "FACEIT Not Connected",  color: "amber",    icon: AlertCircle },
} as const

type SyncState = keyof typeof SYNC_STATES

const FACEIT_LEVEL_COLORS: Record<number, string> = {
  1: "#EEE1C6", 2: "#EEE1C6", 3: "#1CE400", 4: "#1CE400",
  5: "#FFCC00", 6: "#FFCC00", 7: "#FF8A00", 8: "#FF8A00",
  9: "#FE1F00", 10: "#FE1F00",
}

export function PlayerHeader() {
  const [syncing, setSyncing] = useState(false)
  const syncState: SyncState = "active"
  const state = SYNC_STATES[syncState]

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 2400)
  }

  const faceitLevel = 8
  const elo = 1842
  const levelColor = FACEIT_LEVEL_COLORS[faceitLevel] ?? "#7C3AED"

  return (
    <div
      className="rounded-3xl px-7 py-5 mb-6 flex items-center justify-between gap-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 0 1px rgba(124,58,237,0.08) inset, 0 1px 0 rgba(255,255,255,0.05) inset",
      }}
    >
      {/* Left — avatar + player info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div
            className="h-16 w-16 rounded-[20px] flex items-center justify-center text-xl font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #2D1B69 0%, #1B1B4B 100%)",
              border: "2px solid rgba(124,58,237,0.4)",
              boxShadow: "0 0 16px rgba(124,58,237,0.25)",
            }}
          >
            S
          </div>
          {/* FACEIT level badge */}
          <div
            className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: "#1A1A2E",
              border: `2px solid ${levelColor}`,
              color: levelColor,
              boxShadow: `0 0 8px ${levelColor}55`,
            }}
          >
            {faceitLevel}
          </div>
        </div>

        {/* Name + meta */}
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight leading-none mb-1.5">
            stugna.exe
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ background: `${levelColor}18`, color: levelColor, border: `1px solid ${levelColor}35` }}
            >
              <Shield className="h-3 w-3" />
              FACEIT LVL {faceitLevel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
              {elo.toLocaleString()} ELO
            </span>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/[0.05] text-zinc-400 border border-white/[0.07] hover:text-white hover:border-white/20 transition-colors"
            >
              Steam linked
            </Link>
            <Link
              href="/matches"
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/[0.05] text-zinc-400 border border-white/[0.07] hover:text-white hover:border-white/20 transition-colors"
            >
              24 matches analyzed
            </Link>
          </div>
        </div>
      </div>

      {/* Right — sync status + button */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/settings?tab=sync"
          className={cn(
            "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80",
            syncState === "active"       && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            syncState === "processing"   && "bg-violet-500/10  text-violet-300  border border-violet-500/20",
            syncState === "error"        && "bg-red-500/10     text-red-400     border border-red-500/20",
            syncState === "disconnected" && "bg-amber-500/10   text-amber-400   border border-amber-500/20",
          )}
        >
          {syncState === "active" && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          )}
          {state.text}
        </Link>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.6) 0%, rgba(109,40,217,0.8) 100%)",
            border: "1px solid rgba(124,58,237,0.4)",
            boxShadow: syncing ? "none" : "0 0 12px rgba(124,58,237,0.25)",
          }}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
          Sync Now
        </button>
      </div>
    </div>
  )
}
