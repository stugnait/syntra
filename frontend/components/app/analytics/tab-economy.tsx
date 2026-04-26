"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts"
import { SCORE_TREND, BUY_TYPE_PERFORMANCE } from "@/lib/analytics-data"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-xs"
      style={{ background: "rgba(8,8,20,0.96)", border: "1px solid rgba(255,255,255,0.1)" }}>
      <p className="text-zinc-400 mb-1">{label}</p>
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

const ecoData = SCORE_TREND.map((d) => ({ ...d, economy: Math.round(d.overall * 0.97 + (Math.random() - 0.5) * 8) }))

export function TabEconomy() {
  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-5 gap-5">
        {/* Trend */}
        <div className="col-span-3 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Economy Score Trend</h3>
          <p className="text-xs text-zinc-500 mb-4">Buy discipline and monetary efficiency</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ecoData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEco" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="match" tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="economy" stroke="#10B981" strokeWidth={2} fill="url(#gradEco)" dot={false} activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Buy type performance */}
        <div className="col-span-2 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Buy Type Performance</h3>
          <p className="text-xs text-zinc-500 mb-5">Win rate and impact per buy type</p>
          <div className="space-y-3">
            {BUY_TYPE_PERFORMANCE.map((row) => (
              <div key={row.type} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white">{row.type}</span>
                  <div className="flex gap-3 text-xs text-zinc-400">
                    <span>{row.rounds} rounds</span>
                    <span className="font-bold" style={{ color: row.color }}>{row.winRate}% WR</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.winRate}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-5">
        {/* Force buy impact */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-4">Force Buy Impact</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Force buy rounds", value: "19",  color: "#F59E0B" },
              { label: "Win rate",         value: "32%", color: "#EF4444" },
              { label: "Avg impact",       value: "54",  color: "#F59E0B" },
              { label: "Next-round loss",  value: "6x",  color: "#EF4444" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="font-display text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Economy insight */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <h3 className="font-display text-base font-bold text-white mb-3">Economy Insight</h3>
          <p className="text-sm text-zinc-300 leading-relaxed mb-4">
            Your full-buy rounds are stable, but force buys create low value. In 6 recent matches, force buys reduced next-round utility availability and created consecutive loss streaks.
          </p>
          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-1">Recommendation</p>
            <p className="text-sm text-zinc-300">Avoid second-round force unless team has coordinated utility plan.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
