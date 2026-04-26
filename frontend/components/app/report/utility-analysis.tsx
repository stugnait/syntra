"use client"

import type { MatchReport } from "@/lib/report-data"
import { cn } from "@/lib/utils"

const UTILITY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  Flash:   { bg: "rgba(34,211,238,0.07)",  border: "rgba(34,211,238,0.18)",  text: "#67E8F9", icon: "F" },
  Smoke:   { bg: "rgba(129,140,248,0.07)", border: "rgba(129,140,248,0.18)", text: "#A5B4FC", icon: "S" },
  Molotov: { bg: "rgba(251,146,60,0.07)",  border: "rgba(251,146,60,0.18)",  text: "#FCA16C", icon: "M" },
  HE:      { bg: "rgba(252,211,77,0.07)",  border: "rgba(252,211,77,0.18)",  text: "#FDE68A", icon: "H" },
}

const TIMELINE_VALUE_COLOR = {
  HIGH:   "text-emerald-400",
  MEDIUM: "text-amber-400",
  LOW:    "text-red-400",
}

export function UtilityAnalysis({ report }: { report: MatchReport }) {
  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-sm font-bold text-white mb-4">Utility Analysis</p>

      {/* Utility type cards */}
      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {report.utility.map((u) => {
          const c = UTILITY_COLORS[u.type]
          return (
            <div
              key={u.type}
              className="rounded-xl p-3"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black"
                  style={{ background: c.border, color: c.text }}
                >
                  {c.icon}
                </div>
                <p className="text-xs font-bold" style={{ color: c.text }}>{u.type}</p>
              </div>
              <p className="font-display text-xl font-black text-white leading-none mb-0.5">{u.value}</p>
              <p className="text-[10px] text-zinc-500 mb-2">{u.note}</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-600">{u.secondary}</span>
                <span className="text-zinc-400 font-mono">{u.secondaryValue}</span>
              </div>
              <p className="text-[10px] text-zinc-600 mt-1">Thrown: {u.thrown}</p>
            </div>
          )
        })}
      </div>

      {/* Utility timeline */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Round Utility Timeline</p>
      <div className="space-y-1.5">
        {report.utilityTimeline.map((entry, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-xl px-3 py-2"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-[10px] font-mono text-zinc-600 shrink-0 mt-0.5">R{entry.round}</span>
            <span className="text-[10px] text-zinc-500 shrink-0 w-14">{entry.type}</span>
            <span className="text-[11px] text-zinc-400 flex-1">{entry.note}</span>
            <span className={cn("text-[10px] font-bold shrink-0", TIMELINE_VALUE_COLOR[entry.value])}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
