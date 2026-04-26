"use client"

import { Sparkles, AlertTriangle, Star, Target, TrendingUp, TrendingDown } from "lucide-react"
import type { MatchReport } from "@/lib/report-data"

export function AISummary({ report }: { report: MatchReport }) {
  const s = report.summary

  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.15)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
        >
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <p className="text-sm font-bold text-white">AI Tactical Summary</p>
      </div>

      <p className="text-sm text-zinc-300 leading-relaxed mb-5">{s.text}</p>

      <div className="space-y-2">
        <div
          className="flex items-start gap-3 rounded-xl p-3"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)" }}
        >
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-0.5">Main Issue</p>
            <p className="text-xs font-semibold text-red-300">{s.mainIssue}</p>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-xl p-3"
          style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)" }}
        >
          <Star className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5">Best Strength</p>
            <p className="text-xs font-semibold text-emerald-300">{s.bestStrength}</p>
          </div>
        </div>

        <div
          className="flex items-start gap-3 rounded-xl p-3"
          style={{ background: "rgba(129,140,248,0.07)", border: "1px solid rgba(129,140,248,0.15)" }}
        >
          <Target className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-0.5">Priority Focus</p>
            <p className="text-xs font-semibold text-violet-300">{s.priorityFocus}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KeyStats({ report }: { report: MatchReport }) {
  const s = report.stats
  const eloPos = s.eloChange >= 0

  const primary = [
    { label: "Kills",    value: s.kills },
    { label: "Deaths",   value: s.deaths },
    { label: "Assists",  value: s.assists },
    { label: "K/D",      value: s.kd },
    { label: "ADR",      value: s.adr },
    { label: "HS%",      value: `${s.hsPercent}%` },
    { label: "KAST",     value: `${s.kast}%` },
    { label: "Damage",   value: s.damage },
  ]
  const secondary = [
    { label: "Opening Kills",    value: s.openingKills },
    { label: "Opening Deaths",   value: s.openingDeaths },
    { label: "Flash Assists",    value: s.flashAssists },
    { label: "Utility Damage",   value: s.utilityDamage },
    { label: "Clutches",         value: s.clutches },
  ]

  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-sm font-bold text-white mb-4">Key Match Stats</p>

      {/* Primary metrics 2-col grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {primary.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">{item.label}</span>
            <span className="text-sm font-bold text-white font-mono">{item.value}</span>
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="space-y-2 mb-4">
        {secondary.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-xs text-zinc-600">{item.label}</span>
            <span className="text-xs font-semibold text-zinc-300 font-mono">{item.value}</span>
          </div>
        ))}
      </div>

      {/* ELO change */}
      <div
        className="flex items-center justify-between rounded-xl px-3.5 py-2.5 mt-2"
        style={{
          background: eloPos ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${eloPos ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
        }}
      >
        <div className="flex items-center gap-2">
          {eloPos ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
          <span className="text-xs font-semibold text-zinc-300">ELO Change</span>
        </div>
        <span className={`font-display text-lg font-black ${eloPos ? "text-emerald-400" : "text-red-400"}`}>
          {eloPos ? "+" : ""}{s.eloChange}
        </span>
      </div>
    </div>
  )
}
