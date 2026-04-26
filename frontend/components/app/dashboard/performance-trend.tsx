"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"

const data12 = [
  { match: "M1",  aim: 72, utility: 65, impact: 70 },
  { match: "M2",  aim: 68, utility: 60, impact: 65 },
  { match: "M3",  aim: 75, utility: 62, impact: 72 },
  { match: "M4",  aim: 71, utility: 68, impact: 69 },
  { match: "M5",  aim: 78, utility: 64, impact: 75 },
  { match: "M6",  aim: 74, utility: 70, impact: 73 },
  { match: "M7",  aim: 80, utility: 66, impact: 78 },
  { match: "M8",  aim: 77, utility: 72, impact: 76 },
  { match: "M9",  aim: 82, utility: 68, impact: 80 },
  { match: "M10", aim: 79, utility: 74, impact: 82 },
  { match: "M11", aim: 83, utility: 71, impact: 85 },
  { match: "M12", aim: 84, utility: 71, impact: 89 },
]

const data30 = [
  ...Array.from({ length: 18 }, (_, i) => ({
    match: `M${i + 1}`,
    aim: 62 + Math.floor(Math.sin(i) * 8 + Math.random() * 6),
    utility: 55 + Math.floor(Math.cos(i) * 6 + Math.random() * 5),
    impact: 60 + Math.floor(Math.sin(i * 0.7) * 9 + Math.random() * 7),
  })),
  ...data12,
]

const FILTERS = [
  { label: "7D",         key: "7d" },
  { label: "30D",        key: "30d" },
  { label: "All",        key: "all" },
] as const

type Filter = typeof FILTERS[number]["key"]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs space-y-1 min-w-[140px]"
      style={{
        background: "rgba(8,8,20,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <p className="text-zinc-400 font-medium mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-1.5 w-3 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-300 capitalize">{p.dataKey}:</span>
          <span className="font-bold text-white ml-auto">{p.value}</span>
        </div>
      ))}
      <p className="text-violet-400 text-[10px] mt-2 cursor-pointer hover:text-violet-300">
        Open report →
      </p>
    </div>
  )
}

export function PerformanceTrend() {
  const [filter, setFilter] = useState<Filter>("7d")

  const data = filter === "30d" || filter === "all" ? data30 : data12

  const summary =
    filter === "7d"
      ? "Your tactical score increased by 11% across the last 12 matches."
      : "Your aim score has risen steadily over the past 30 days."

  return (
    <div
      className="rounded-2xl p-6 flex flex-col h-full"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-base font-bold text-white">Performance Trend</h3>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-xs">{summary}</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150",
                filter === f.key
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
              style={
                filter === f.key
                  ? { background: "rgba(124,58,237,0.3)", boxShadow: "0 0 0 1px rgba(124,58,237,0.4)" }
                  : undefined
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {[
          { label: "Aim",     color: "#9F67FF" },
          { label: "Utility", color: "#22D3EE" },
          { label: "Impact",  color: "#10B981" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="h-1 w-4 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#9F67FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#9F67FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradUtil" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22D3EE" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradImpact" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="match" tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[40, 100]} tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="aim"     stroke="#9F67FF" strokeWidth={2} fill="url(#gradAim)"    dot={false} activeDot={{ r: 4, fill: "#9F67FF", strokeWidth: 0 }} />
            <Area type="monotone" dataKey="utility" stroke="#22D3EE" strokeWidth={2} fill="url(#gradUtil)"   dot={false} activeDot={{ r: 4, fill: "#22D3EE", strokeWidth: 0 }} />
            <Area type="monotone" dataKey="impact"  stroke="#10B981" strokeWidth={2} fill="url(#gradImpact)" dot={false} activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
