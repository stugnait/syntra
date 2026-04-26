"use client"

import { useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { SCORE_TREND, STRONGEST_AREAS, WEAKEST_AREAS, MAP_PERFORMANCE } from "@/lib/analytics-data"
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

const FILTERS = [{ label: "7D", key: "7d" }, { label: "30D", key: "30d" }, { label: "90D", key: "90d" }] as const
type Filter = typeof FILTERS[number]["key"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-xs space-y-1 min-w-[160px]"
      style={{ background: "rgba(8,8,20,0.96)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
      <p className="text-zinc-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-1.5 w-3 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-300 capitalize">{p.dataKey}:</span>
          <span className="font-bold text-white ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const gradeColor = (g: string) => {
  if (g.startsWith("A")) return "text-emerald-400"
  if (g.startsWith("B")) return "text-violet-400"
  if (g.startsWith("C")) return "text-amber-400"
  return "text-red-400"
}

export function TabOverview({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [filter, setFilter] = useState<Filter>("7d")
  const router = useRouter()

  const data = filter === "90d" ? SCORE_TREND : filter === "30d" ? SCORE_TREND.slice(4) : SCORE_TREND.slice(9)

  const current = SCORE_TREND[SCORE_TREND.length - 1].overall
  const best    = Math.max(...SCORE_TREND.map((d) => d.overall))
  const lowest  = Math.min(...SCORE_TREND.map((d) => d.overall))

  return (
    <div className="space-y-5">
      {/* Row 1: trend + AI summary */}
      <div className="grid grid-cols-5 gap-5">
        {/* Score trend */}
        <div className="col-span-3 rounded-2xl p-6 flex flex-col"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-white">Overall Tactical Score</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Your global performance rating across all matches</p>
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={cn("px-3 py-1 rounded-lg text-xs font-semibold transition-all", filter === f.key ? "text-white" : "text-zinc-500 hover:text-zinc-300")}
                  style={filter === f.key ? { background: "rgba(124,58,237,0.3)", boxShadow: "0 0 0 1px rgba(124,58,237,0.4)" } : undefined}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6 mb-4">
            {[{ l: "Current", v: current, c: "#9F67FF" }, { l: "Best", v: best, c: "#10B981" }, { l: "Lowest", v: lowest, c: "#EF4444" }].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{s.l}</p>
                <p className="font-display text-2xl font-black" style={{ color: s.c }}>{s.v}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#9F67FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9F67FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="match" tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="overall" stroke="#9F67FF" strokeWidth={2} fill="url(#gradOverall)" dot={false} activeDot={{ r: 4, fill: "#9F67FF", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI summary */}
        <div className="col-span-2 rounded-2xl p-6 flex flex-col gap-4"
          style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest">AI Performance Summary</h3>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            SYNTRA detected stable improvement in aim and opening duel success, but positioning remains the main limiting factor.
            Most negative impact comes from CT-side early deaths on Mirage and Inferno.
          </p>
          <div className="space-y-3 mt-auto">
            {[
              { label: "Main strength",  value: "Aim consistency",         icon: TrendingUp,   color: "text-emerald-400" },
              { label: "Main weakness",  value: "CT-side survival",         icon: TrendingDown, color: "text-red-400" },
              { label: "Priority focus", value: "Avoid isolated early peeks", icon: ArrowRight,  color: "text-violet-400" },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <row.icon className={cn("h-4 w-4 mt-0.5 shrink-0", row.color)} strokeWidth={1.8} />
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{row.label}</p>
                  <p className="text-sm font-semibold text-white">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: strongest + weakest */}
      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <h3 className="font-display text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" strokeWidth={1.8} />
            Strongest Areas
          </h3>
          <div className="space-y-3">
            {STRONGEST_AREAS.map((area) => (
              <div key={area.rank} className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.1)" }}>
                <span className="font-display text-xl font-black text-emerald-400/50">{area.rank}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{area.title}</p>
                  <p className="text-[11px] text-emerald-400">{area.stat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <h3 className="font-display text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-400" strokeWidth={1.8} />
            Weakest Areas
          </h3>
          <div className="space-y-3">
            {WEAKEST_AREAS.map((area) => (
              <div key={area.rank} className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}>
                <span className="font-display text-xl font-black text-red-400/50">{area.rank}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{area.title}</p>
                  <p className="text-[11px] text-red-400">{area.stat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: map table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h3 className="font-display text-sm font-bold text-white">Map Performance</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Click a row to filter analytics by map</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04]">
              {["Map", "Matches", "Win Rate", "Grade", "Best Skill", "Weakness"].map((h) => (
                <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MAP_PERFORMANCE.map((row, i) => (
              <tr key={row.map}
                className="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors"
                onClick={() => router.push(`/analytics?map=${row.map.toLowerCase()}`)}>
                <td className="px-6 py-4 font-semibold text-white">{row.map}</td>
                <td className="px-6 py-4 text-zinc-400">{row.matches}</td>
                <td className="px-6 py-4">
                  <span className={cn("font-bold", row.winRate >= 55 ? "text-emerald-400" : row.winRate >= 45 ? "text-amber-400" : "text-red-400")}>
                    {row.winRate}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("font-display font-black text-base", gradeColor(row.grade))}>{row.grade}</span>
                </td>
                <td className="px-6 py-4 text-zinc-300">{row.best}</td>
                <td className="px-6 py-4 text-red-400/80">{row.weakness}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
