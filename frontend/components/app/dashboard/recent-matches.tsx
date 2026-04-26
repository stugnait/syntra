"use client"

import Link from "next/link"
import { ArrowRight, Loader2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type MatchStatus = "ready" | "processing" | "waiting_demo" | "failed" | "no_demo"

interface RecentMatch {
  id: string
  map: string
  result: "WIN" | "LOSS" | "DRAW"
  score: string
  kd: string
  adr: number
  eloChange: number
  grade: string
  status: MatchStatus
  date: string
}

const GRADE_COLORS: Record<string, string> = {
  "A+": "#10B981", A: "#10B981", "A-": "#22D3EE",
  "B+": "#9F67FF", B: "#9F67FF", "B-": "#7C3AED",
  "C+": "#F59E0B", C: "#F59E0B", "C-": "#D97706",
  D: "#EF4444", F: "#EF4444",
}

const matches: RecentMatch[] = [
  { id: "m1", map: "Mirage",  result: "WIN",  score: "13:9",  kd: "22/15", adr: 91, eloChange: +24, grade: "A-",  status: "ready",       date: "Today, 21:44" },
  { id: "m2", map: "Inferno", result: "LOSS", score: "11:13", kd: "18/19", adr: 76, eloChange: -18, grade: "B",   status: "ready",       date: "Today, 19:11" },
  { id: "m3", map: "Ancient", result: "WIN",  score: "13:7",  kd: "26/12", adr: 98, eloChange: +27, grade: "A",   status: "ready",       date: "Apr 25" },
  { id: "m4", map: "Anubis",  result: "WIN",  score: "13:11", kd: "21/16", adr: 84, eloChange: +21, grade: "B+",  status: "processing",  date: "Apr 25" },
  { id: "m5", map: "Vertigo", result: "LOSS", score: "10:13", kd: "15/18", adr: 68, eloChange: -22, grade: "C+",  status: "waiting_demo",date: "Apr 24" },
]

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: string; textColor: string }> = {
  ready:        { label: "Report Ready",    color: "rgba(34,197,94,0.12)",    textColor: "#22C55E" },
  processing:   { label: "Processing",      color: "rgba(124,58,237,0.12)",   textColor: "#A78BFA" },
  waiting_demo: { label: "Waiting Demo",    color: "rgba(251,191,36,0.10)",   textColor: "#FCD34D" },
  failed:       { label: "Failed",          color: "rgba(239,68,68,0.12)",    textColor: "#F87171" },
  no_demo:      { label: "No Demo",         color: "rgba(113,113,122,0.12)",  textColor: "#A1A1AA" },
}

export function RecentMatches() {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col h-full"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-white">Recent Matches</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Auto-imported from FACEIT</p>
        </div>
        <Link
          href="/matches"
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Match rows */}
      <div className="flex flex-col divide-y divide-white/[0.04]">
        {matches.map((m) => {
          const gradeColor = GRADE_COLORS[m.grade] ?? "#71717A"
          const statusCfg = STATUS_CONFIG[m.status]
          const isReady = m.status === "ready"

          return (
            <div
              key={m.id}
              className={cn(
                "flex items-center gap-3 py-3 transition-colors rounded-xl px-1 -mx-1",
                isReady && "hover:bg-white/[0.03] cursor-pointer"
              )}
              onClick={() => isReady && (window.location.href = `/matches/${m.id}`)}
            >
              {/* Map name */}
              <div className="w-[68px] shrink-0">
                <p className="text-sm font-semibold text-white">{m.map}</p>
                <p className="text-[10px] text-zinc-600">{m.date}</p>
              </div>

              {/* Result badge */}
              <span
                className={cn(
                  "shrink-0 text-[11px] font-black tracking-wider rounded-lg px-2 py-0.5",
                  m.result === "WIN"  && "bg-emerald-500/12 text-emerald-400",
                  m.result === "LOSS" && "bg-red-500/12 text-red-400",
                  m.result === "DRAW" && "bg-zinc-500/12 text-zinc-400",
                )}
              >
                {m.result}
              </span>

              {/* Score + stats */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-300 font-mono">{m.score}</p>
                {isReady && (
                  <p className="text-[10px] text-zinc-600">
                    {m.kd} · ADR {m.adr}
                  </p>
                )}
                {m.status === "processing" && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Loader2 className="h-3 w-3 text-violet-400 animate-spin" />
                    <span className="text-[10px] text-violet-400">Processing demo...</span>
                  </div>
                )}
                {m.status === "waiting_demo" && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] text-amber-400">Waiting for FACEIT demo</span>
                  </div>
                )}
              </div>

              {/* Grade */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {isReady && (
                  <span
                    className="text-sm font-black"
                    style={{ color: gradeColor, textShadow: `0 0 8px ${gradeColor}55` }}
                  >
                    {m.grade}
                  </span>
                )}
                <span
                  className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                  style={{ background: statusCfg.color, color: statusCfg.textColor }}
                >
                  {statusCfg.label}
                </span>
                {isReady && (
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      m.eloChange > 0 ? "text-emerald-400" : "text-red-400"
                    )}
                  >
                    {m.eloChange > 0 ? "+" : ""}{m.eloChange} ELO
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
