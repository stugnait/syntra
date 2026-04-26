"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { SCORE_TREND, CLUTCH_BREAKDOWN, LATE_ROUND_MISTAKES } from "@/lib/analytics-data"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-xs"
      style={{ background: "rgba(8,8,20,0.96)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-1.5 w-3 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-300">{p.dataKey}:</span>
          <span className="font-bold text-white ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const clutchTrend = SCORE_TREND.map((d, i) => ({
  ...d,
  clutch: Math.min(100, Math.max(0, 36 + i * 0.5 + Math.round((Math.random() - 0.5) * 10))),
}))

export function TabClutch() {
  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-5 gap-5">
        {/* Trend */}
        <div className="col-span-3 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Clutch Conversion Trend</h3>
          <p className="text-xs text-zinc-500 mb-4">1vX win rate across matches</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={clutchTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradClutch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#9F67FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9F67FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="match" tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="clutch" stroke="#9F67FF" strokeWidth={2} fill="url(#gradClutch)" dot={false} activeDot={{ r: 4, fill: "#9F67FF", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Clutch type breakdown */}
        <div className="col-span-2 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h3 className="font-display text-base font-bold text-white">Clutch Type Breakdown</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04]">
                {["Situation", "Attempts", "Win Rate"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLUTCH_BREAKDOWN.map((row) => (
                <tr key={row.situation} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                  <td className="px-6 py-3 font-semibold text-white">{row.situation}</td>
                  <td className="px-6 py-3 text-zinc-400">{row.attempts}</td>
                  <td className="px-6 py-3">
                    <span className="font-bold" style={{ color: row.color }}>{row.winRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-5">
        {/* Late round mistakes */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <h3 className="font-display text-base font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" strokeWidth={1.8} />
            Late Round Mistakes
          </h3>
          <div className="space-y-3">
            {LATE_ROUND_MISTAKES.map((m) => (
              <div key={m.rank} className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)" }}>
                <span className="font-display text-xl font-black text-red-400/50">{m.rank}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{m.title}</p>
                  <p className="text-[11px] text-red-400">Detected: {m.rounds} rounds</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best clutch stats */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-4">Clutch Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "1v1 Win Rate",       value: "57%", color: "#10B981" },
              { label: "Post-plant WR",      value: "44%", color: "#9F67FF" },
              { label: "Retake Success",     value: "33%", color: "#F59E0B" },
              { label: "Reload Mistakes",    value: "4",   color: "#EF4444" },
              { label: "Fake/Defuse Errors", value: "2",   color: "#EF4444" },
              { label: "Total 1vX Attempts", value: "40",  color: "#22D3EE" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="font-display text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
