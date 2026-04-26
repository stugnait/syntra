"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { SCORE_TREND, UTILITY_TYPE_BREAKDOWN, BEST_UTILITY_MAPS, WEAK_UTILITY_MAPS } from "@/lib/analytics-data"
import { cn } from "@/lib/utils"

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

export function TabUtility() {
  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-5 gap-5">
        {/* Trend */}
        <div className="col-span-3 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Utility Score Trend</h3>
          <p className="text-xs text-zinc-500 mb-4">Utility effectiveness across matches</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SCORE_TREND} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUtil2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22D3EE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="match" tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="utility" stroke="#22D3EE" strokeWidth={2} fill="url(#gradUtil2)" dot={false} activeDot={{ r: 4, fill: "#22D3EE", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Type breakdown */}
        <div className="col-span-2 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Utility Type Breakdown</h3>
          <p className="text-xs text-zinc-500 mb-5">Effectiveness per grenade type</p>
          <div className="space-y-4">
            {UTILITY_TYPE_BREAKDOWN.map((u) => (
              <div key={u.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-zinc-300">{u.label}</span>
                  <span className="text-xs font-bold" style={{ color: u.color }}>{u.raw}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${u.value}%`, background: u.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-5">
        {/* Best utility maps */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <div className="px-6 py-4 border-b border-emerald-400/10">
            <h3 className="font-display text-sm font-bold text-white">Best Utility Maps</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04]">
                {["Map", "Utility Score", "Best Utility"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BEST_UTILITY_MAPS.map((row) => (
                <tr key={row.map} className="border-b border-white/[0.03] hover:bg-emerald-400/[0.03] transition-colors">
                  <td className="px-6 py-3 font-semibold text-white">{row.map}</td>
                  <td className="px-6 py-3 text-emerald-400 font-bold">{row.score}</td>
                  <td className="px-6 py-3 text-zinc-400 text-xs">{row.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Weak utility maps */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="px-6 py-4 border-b border-red-400/10">
            <h3 className="font-display text-sm font-bold text-white">Weak Utility Maps</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04]">
                {["Map", "Utility Score", "Main Issue"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEAK_UTILITY_MAPS.map((row) => (
                <tr key={row.map} className="border-b border-white/[0.03] hover:bg-red-400/[0.03] transition-colors">
                  <td className="px-6 py-3 font-semibold text-white">{row.map}</td>
                  <td className="px-6 py-3 text-red-400 font-bold">{row.score}</td>
                  <td className="px-6 py-3 text-zinc-400 text-xs">{row.issue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pattern insight */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <h3 className="font-display text-sm font-bold text-white mb-2">Utility Pattern Detected</h3>
        <p className="text-sm text-zinc-300 leading-relaxed mb-3">
          You often throw flashes before teammates are ready to take space. This creates low conversion despite decent flash placement.
        </p>
        <div className="flex gap-6 text-xs">
          <span className="text-zinc-500">Related matches: <span className="text-amber-400 font-semibold">Mirage, Inferno, Anubis</span></span>
          <span className="text-zinc-500">Priority: <span className="text-amber-400 font-semibold">Medium</span></span>
        </div>
      </div>
    </div>
  )
}
