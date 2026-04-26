"use client"

import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, Trophy, AlertTriangle } from "lucide-react"
import { SCORE_TREND } from "@/lib/analytics-data"

const FILTERS = [{ label: "7D" }, { label: "30D" }, { label: "90D" }, { label: "All" }]

const KPI_CARDS = [
  { label: "ELO Change",  value: "+142", sub: "last 30 days",   color: "#10B981", positive: true },
  { label: "Aim Growth",  value: "+8",   sub: "improving",       color: "#9F67FF", positive: true },
  { label: "Utility",     value: "+4",   sub: "slow growth",     color: "#22D3EE", positive: true },
  { label: "Consistency", value: "73%",  sub: "stable",          color: "#F59E0B", positive: null },
]

const SKILL_PROGRESS = [
  { skill: "Aim",         from: 76, to: 84, change: 8,  status: "Improving",          statusColor: "#10B981" },
  { skill: "Utility",     from: 67, to: 71, change: 4,  status: "Slight improvement", statusColor: "#22D3EE" },
  { skill: "Positioning", from: 66, to: 63, change: -3, status: "Declining",          statusColor: "#EF4444" },
  { skill: "Economy",     from: 72, to: 76, change: 4,  status: "Slight improvement", statusColor: "#22D3EE" },
  { skill: "Clutch",      from: 38, to: 42, change: 4,  status: "Improving",          statusColor: "#10B981" },
]

const WEAKNESS_HISTORY = [
  { title: "Early round exposure",  from: "36%",  to: "31%",  rawChange: -5,  status: "Improving",         statusColor: "#10B981" },
  { title: "Low flash conversion",  from: "0.39", to: "0.42", rawChange: 1,   status: "Slight improvement", statusColor: "#22D3EE" },
  { title: "Connector deaths",      from: "12",   to: "18",   rawChange: -6,  status: "Getting worse",      statusColor: "#EF4444" },
]

const MILESTONES = [
  { icon: Trophy,       title: "Entry Impact Improved",       desc: "+12% opening duel success",            type: "positive" },
  { icon: TrendingUp,   title: "Better Utility Discipline",   desc: "20% fewer unused grenades on death",   type: "positive" },
  { icon: AlertTriangle, title: "Mirage Warning",             desc: "Connector deaths increased by 50%",    type: "warning" },
]

const CHART_LINES = [
  { key: "aim",         color: "#9F67FF", label: "Aim" },
  { key: "utility",     color: "#22D3EE", label: "Utility" },
  { key: "positioning", color: "#EF4444", label: "Positioning" },
  { key: "overall",     color: "#10B981", label: "Overall" },
]

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

export default function ProgressPage() {
  const [filter, setFilter] = useState("30D")

  const data = filter === "All" ? SCORE_TREND : filter === "90D" ? SCORE_TREND : filter === "30D" ? SCORE_TREND.slice(4) : SCORE_TREND.slice(9)

  return (
    <div className="min-h-screen p-7 pb-12" style={{ background: "#05050A" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">PROGRESS</h1>
          <p className="text-zinc-500 text-sm mt-1">Track long-term improvement across matches</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.label)}
              className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold transition-all", filter === f.label ? "text-white" : "text-zinc-500 hover:text-zinc-300")}
              style={filter === f.label ? { background: "rgba(124,58,237,0.3)", boxShadow: "0 0 0 1px rgba(124,58,237,0.4)" } : undefined}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {KPI_CARDS.map((card) => (
          <div key={card.label} className="rounded-2xl p-5 flex flex-col gap-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-500">{card.label}</span>
            <span className="font-display text-4xl font-black" style={{ color: card.color }}>{card.value}</span>
            <span className="text-[11px] text-zinc-500">{card.sub}</span>
          </div>
        ))}
      </div>

      {/* Progress timeline + improvement summary */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        <div className="col-span-3 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-1">Progress Timeline</h3>
          <p className="text-xs text-zinc-500 mb-4">Multi-metric score progression</p>
          <div className="flex gap-4 mb-4">
            {CHART_LINES.map((l) => (
              <div key={l.key} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span className="h-1 w-4 rounded-full" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="match" tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: "#52525B", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {CHART_LINES.map((l) => (
                <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2}
                  dot={false} activeDot={{ r: 4, fill: l.color, strokeWidth: 0 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-2 rounded-2xl p-6" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest">Improvement Summary</h3>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed mb-5">
            Your aim score improved steadily across the last 30 days, especially in opening duels. However, positioning score remains unstable and drops on CT-side Mirage games.
          </p>
          <div className="space-y-3">
            {[
              { label: "Biggest improvement", value: "Opening duels +12%", color: "#10B981" },
              { label: "Still weak",          value: "Early CT deaths",    color: "#EF4444" },
            ].map((row) => (
              <div key={row.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">{row.label}</p>
                <p className="text-sm font-semibold" style={{ color: row.color }}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill progress cards + Weakness history */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Skill progress */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-4">Skill Progress</h3>
          <div className="space-y-3">
            {SKILL_PROGRESS.map((s) => (
              <div key={s.skill} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{s.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{s.from} → {s.to}</span>
                    <span className="text-xs font-bold" style={{ color: s.statusColor }}>
                      {s.change > 0 ? `+${s.change}` : s.change}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden mr-3">
                    <div className="h-full rounded-full" style={{ width: `${s.to}%`, background: s.statusColor }} />
                  </div>
                  <span className="text-[11px] shrink-0" style={{ color: s.statusColor }}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weakness history */}
        <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-base font-bold text-white mb-4">Weakness History</h3>
          <div className="space-y-3">
            {WEAKNESS_HISTORY.map((w) => (
              <div key={w.title} className="rounded-xl px-4 py-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{w.title}</span>
                  <span className="text-xs font-bold" style={{ color: w.statusColor }}>{w.status}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-mono text-zinc-500">{w.from}</span>
                  <div className="flex-1 h-0.5 bg-white/[0.06]" />
                  <span className="text-xs font-mono font-bold" style={{ color: w.statusColor }}>{w.to}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements / Milestones */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="font-display text-base font-bold text-white mb-4">Milestones</h3>
        <div className="grid grid-cols-3 gap-4">
          {MILESTONES.map((m) => (
            <div
              key={m.title}
              className="rounded-xl p-4 flex items-start gap-3"
              style={{
                background:  m.type === "positive" ? "rgba(16,185,129,0.05)"  : "rgba(245,158,11,0.05)",
                border:      m.type === "positive" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <m.icon
                className="h-4 w-4 mt-0.5 shrink-0"
                style={{ color: m.type === "positive" ? "#10B981" : "#F59E0B" }}
                strokeWidth={1.8}
              />
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">{m.title}</p>
                <p className="text-xs text-zinc-400">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
