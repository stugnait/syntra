"use client"

import { useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts"
import { cn } from "@/lib/utils"
import { SCORE_TREND, AIM_DUEL_BREAKDOWN, DISTANCE_ANALYSIS, WEAPON_ANALYSIS } from "@/lib/analytics-data"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-xs space-y-1"
      style={{ background: "rgba(8,8,20,0.96)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
      <p className="text-zinc-400 font-medium mb-1">{label}</p>
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

export function TabAim() {
  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-5 gap-5">
        {/* Aim score trend */}
        <div className="col-span-3 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Aim Score Trend</h3>
          <p className="text-xs text-zinc-500 mb-4">Aim score across recent matches</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={SCORE_TREND} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAim2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#9F67FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9F67FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="match" tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="aim" stroke="#9F67FF" strokeWidth={2} fill="url(#gradAim2)" dot={false} activeDot={{ r: 4, fill: "#9F67FF", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Duel win breakdown */}
        <div className="col-span-2 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Duel Win Breakdown</h3>
          <p className="text-xs text-zinc-500 mb-5">Win rate by duel type</p>
          <div className="space-y-3">
            {AIM_DUEL_BREAKDOWN.map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">{row.label}</span>
                  <span className="font-bold text-white">{row.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${row.value}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-5">
        {/* Distance analysis */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Distance Analysis</h3>
          <p className="text-xs text-zinc-500 mb-5">Duel win rate by engagement distance</p>
          <div className="space-y-4">
            {DISTANCE_ANALYSIS.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-zinc-300 font-medium">{row.label}</span>
                  <span className="font-bold" style={{ color: row.color }}>{row.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.value}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl px-4 py-3 text-xs text-amber-400" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.15)" }}>
            Insight: Long-range duels are your weakest engagement type.
          </div>
        </div>

        {/* Weapon analysis */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h3 className="font-display text-base font-bold text-white">Weapon Analysis</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04]">
                {["Weapon", "Kills", "Deaths", "ADR", "Grade"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WEAPON_ANALYSIS.map((row) => (
                <tr key={row.weapon} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{row.weapon}</td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">{row.kills}</td>
                  <td className="px-4 py-3 text-red-400 font-medium">{row.deaths}</td>
                  <td className="px-4 py-3 text-zinc-300">{row.adr}</td>
                  <td className={cn("px-4 py-3 font-display font-black", gradeColor(row.grade))}>{row.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aim recommendations */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <h3 className="font-display text-base font-bold text-white mb-3">Aim Focus</h3>
        <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
          Your long-range duel win rate is 38%, which is lower than your overall duel rate. Isolated engagements at distance without utility support are causing unnecessary losses.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            "Avoid dry long-range peeks",
            "Use flash before mid/contact fights",
            "Prefer tighter angles on CT side",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="font-display font-black text-violet-400/60 text-sm mt-0.5">{i + 1}</span>
              <span className="text-sm text-zinc-200">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
