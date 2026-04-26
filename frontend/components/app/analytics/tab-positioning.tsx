"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { SCORE_TREND, DEATH_TIMING, RISK_ZONES } from "@/lib/analytics-data"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-xs"
      style={{ background: "rgba(8,8,20,0.96)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="text-zinc-400 font-medium mb-1">{label}</p>
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

export function TabPositioning() {
  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-5 gap-5">
        {/* Trend */}
        <div className="col-span-3 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Positioning Score Trend</h3>
          <p className="text-xs text-zinc-500 mb-4">Positional awareness across matches</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SCORE_TREND} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="match" tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 90]} tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="positioning" stroke="#EF4444" strokeWidth={2} fill="url(#gradPos)" dot={false} activeDot={{ r: 4, fill: "#EF4444", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Death timing */}
        <div className="col-span-2 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Death Timing Breakdown</h3>
          <p className="text-xs text-zinc-500 mb-5">When you die within the round</p>
          <div className="space-y-4">
            {DEATH_TIMING.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-zinc-300">{row.label}</span>
                  <span className="font-bold text-white">{row.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.value}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl px-4 py-3 text-xs text-red-400" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            Main issue: early CT-side deaths before round stabilises.
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-5">
        {/* Risk zones */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="px-6 py-4 border-b border-red-400/10">
            <h3 className="font-display text-sm font-bold text-white">High-Risk Zones</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Zones where you die most frequently</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04]">
                {["Map", "Zone", "Deaths", "Main Cause"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RISK_ZONES.map((row) => (
                <tr key={`${row.map}-${row.zone}`} className="border-b border-white/[0.03] hover:bg-red-400/[0.03] transition-colors">
                  <td className="px-6 py-3 text-zinc-400">{row.map}</td>
                  <td className="px-6 py-3 font-semibold text-white">{row.zone}</td>
                  <td className="px-6 py-3 text-red-400 font-bold">{row.deaths}</td>
                  <td className="px-6 py-3 text-zinc-500 text-xs italic">{row.cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rotation analysis */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-4">Rotation Analysis</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: "Avg rotate delay", value: "4.8s",    color: "#F59E0B" },
              { label: "Late rotations",   value: "11",       color: "#EF4444" },
              { label: "Affected map",     value: "Nuke",     color: "#9F67FF" },
              { label: "Impact",           value: "High",     color: "#EF4444" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="font-display text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl px-4 py-3 text-sm text-amber-400 leading-relaxed" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
            Insight: You often rotate after bomb plant instead of reacting to first contact.
          </div>
        </div>
      </div>
    </div>
  )
}
