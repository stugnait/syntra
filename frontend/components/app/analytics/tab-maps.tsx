"use client"

import { MAP_MATRIX, BEST_MAP_DETAIL, WORST_MAP_DETAIL } from "@/lib/analytics-data"
import { cn } from "@/lib/utils"
import { Trophy, AlertTriangle } from "lucide-react"

const gradeColor = (g: string) => {
  if (g.startsWith("A")) return "text-emerald-400"
  if (g.startsWith("B")) return "text-violet-400"
  if (g.startsWith("C")) return "text-amber-400"
  return "text-red-400"
}

const scoreColor = (v: number) => v >= 75 ? "#10B981" : v >= 60 ? "#9F67FF" : v >= 50 ? "#F59E0B" : "#EF4444"

function MiniBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: scoreColor(value) }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color: scoreColor(value) }}>{value}</span>
    </div>
  )
}

export function TabMaps() {
  return (
    <div className="space-y-5">
      {/* Map matrix */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h3 className="font-display text-base font-bold text-white">Map Performance Matrix</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Comprehensive breakdown per map</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04]">
              {["Map", "Matches", "Win Rate", "Aim", "Utility", "Positioning", "Grade"].map((h) => (
                <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MAP_MATRIX.map((row) => (
              <tr key={row.map} className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors">
                <td className="px-6 py-4 font-semibold text-white">{row.map}</td>
                <td className="px-6 py-4 text-zinc-400">{row.matches}</td>
                <td className="px-6 py-4">
                  <span className={cn("font-bold", row.winRate >= 55 ? "text-emerald-400" : row.winRate >= 45 ? "text-amber-400" : "text-red-400")}>
                    {row.winRate}%
                  </span>
                </td>
                <td className="px-6 py-4"><MiniBar value={row.aim} /></td>
                <td className="px-6 py-4"><MiniBar value={row.util} /></td>
                <td className="px-6 py-4"><MiniBar value={row.position} /></td>
                <td className="px-6 py-4">
                  <span className={cn("font-display font-black text-base", gradeColor(row.grade))}>{row.grade}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Best + worst map detail */}
      <div className="grid grid-cols-2 gap-5">
        {/* Best map */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-emerald-400" strokeWidth={1.8} />
            <h3 className="font-display text-sm font-bold text-white">Best Map</h3>
            <span className="ml-auto font-display text-2xl font-black text-emerald-400">{BEST_MAP_DETAIL.map}</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Win Rate",       value: `${BEST_MAP_DETAIL.winRate}%`,   color: "#10B981" },
              { label: "Grade",          value: BEST_MAP_DETAIL.grade,            color: "#10B981" },
              { label: "Strongest Side", value: BEST_MAP_DETAIL.strongestSide,   color: "#22D3EE" },
              { label: "Best Skill",     value: BEST_MAP_DETAIL.bestSkill,       color: "#9F67FF" },
              { label: "Weak Point",     value: BEST_MAP_DETAIL.weakPoint,       color: "#F59E0B" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">{row.label}</span>
                <span className="text-sm font-semibold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Worst map */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={1.8} />
            <h3 className="font-display text-sm font-bold text-white">Worst Map</h3>
            <span className="ml-auto font-display text-2xl font-black text-red-400">{WORST_MAP_DETAIL.map}</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Win Rate",       value: `${WORST_MAP_DETAIL.winRate}%`,   color: "#EF4444" },
              { label: "Grade",          value: WORST_MAP_DETAIL.grade,            color: "#EF4444" },
              { label: "Main Issue",     value: WORST_MAP_DETAIL.mainIssue,       color: "#F59E0B" },
              { label: "Weakest Skill",  value: WORST_MAP_DETAIL.weakestSkill,    color: "#F59E0B" },
              { label: "Recommendation", value: WORST_MAP_DETAIL.recommendation,  color: "#9F67FF" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">{row.label}</span>
                <span className="text-sm font-semibold text-right ml-4" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
