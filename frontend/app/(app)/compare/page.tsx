"use client"

import { useState } from "react"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

type CompareMode = "period" | "match" | "map" | "player"

const MODES: { key: CompareMode; label: string }[] = [
  { key: "period", label: "Period vs Period" },
  { key: "match",  label: "Match vs Match" },
  { key: "map",    label: "Map vs Map" },
  { key: "player", label: "Player vs Average" },
]

// Period data
const PERIOD_METRICS = [
  { metric: "Aim",          left: 84, right: 76, label: "Last 30d vs Previous 30d" },
  { metric: "Utility",      left: 71, right: 67, label: "" },
  { metric: "Positioning",  left: 63, right: 66, label: "" },
  { metric: "Economy",      left: 76, right: 72, label: "" },
  { metric: "Clutch",       left: 42, right: 38, label: "" },
  { metric: "Win Rate",     left: 58, right: 52, label: "" },
  { metric: "ELO",          left: 142, right: 0, label: "" },
]

const MATCH_METRICS = [
  { metric: "Aim",         left: 84, right: 69 },
  { metric: "Utility",     left: 71, right: 54 },
  { metric: "Positioning", left: 63, right: 48 },
  { metric: "Economy",     left: 76, right: 61 },
  { metric: "Clutch",      left: 45, right: 32 },
]

const MAP_METRICS = [
  { metric: "Win Rate",     left: 61, right: 46 },
  { metric: "Aim",          left: 84, right: 76 },
  { metric: "Utility",      left: 69, right: 78 },
  { metric: "Positioning",  left: 62, right: 55 },
  { metric: "Economy",      left: 74, right: 68 },
]

const PLAYER_METRICS = [
  { metric: "Aim",         left: 84, right: 80 },
  { metric: "Utility",     left: 71, right: 80 },
  { metric: "Positioning", left: 63, right: 69 },
  { metric: "Clutch",      left: 42, right: 40 },
  { metric: "Economy",     left: 76, right: 75 },
]

const MODE_DATA: Record<CompareMode, {
  leftLabel: string; rightLabel: string; metrics: { metric: string; left: number; right: number }[];
  insight: string;
}> = {
  period: {
    leftLabel:  "Last 30 days",
    rightLabel: "Previous 30 days",
    metrics:    PERIOD_METRICS,
    insight:    "Your recent performance improved compared to the previous period. The biggest positive change is opening duel success. The biggest negative change is connector survival on Mirage.",
  },
  match: {
    leftLabel:  "Mirage 13:9 Win",
    rightLabel: "Mirage 8:13 Loss",
    metrics:    MATCH_METRICS,
    insight:    "The biggest difference was CT-side survival and utility timing. In the lost match, you had 5 early deaths and lower flash conversion, which gave opponents free map control.",
  },
  map: {
    leftLabel:  "Mirage",
    rightLabel: "Inferno",
    metrics:    MAP_METRICS,
    insight:    "Your Inferno performance is limited by banana survival and low trade rate. Mirage is your stronger map overall, especially aim and opening duels.",
  },
  player: {
    leftLabel:  "You",
    rightLabel: "FACEIT Lvl 8 avg",
    metrics:    PLAYER_METRICS,
    insight:    "You are above average in aim and slightly above in clutch. Main areas below average: utility efficiency and positional decision-making.",
  },
}

function DiffBadge({ left, right, suffix = "" }: { left: number; right: number; suffix?: string }) {
  const diff = left - right
  if (diff === 0) return <span className="text-zinc-500 flex items-center gap-0.5"><Minus className="h-3 w-3" />0{suffix}</span>
  const Icon = diff > 0 ? TrendingUp : TrendingDown
  return (
    <span className={cn("flex items-center gap-0.5 font-bold", diff > 0 ? "text-emerald-400" : "text-red-400")}>
      <Icon className="h-3 w-3" strokeWidth={2} />
      {diff > 0 ? "+" : ""}{diff}{suffix}
    </span>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "rgba(8,8,20,0.96)", border: "1px solid rgba(255,255,255,0.1)" }}>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-1.5 w-3 rounded-full" style={{ background: p.color ?? p.fill }} />
          <span className="text-zinc-300">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function ComparePage() {
  const [mode, setMode] = useState<CompareMode>("period")

  const { leftLabel, rightLabel, metrics, insight } = MODE_DATA[mode]

  const radarData = metrics.slice(0, 5).map((m) => ({
    subject: m.metric,
    left:    Math.min(m.left,  100),
    right:   Math.min(m.right, 100),
  }))

  return (
    <div className="min-h-screen p-7 pb-12" style={{ background: "#05050A" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-white tracking-tight">COMPARE</h1>
        <p className="text-zinc-500 text-sm mt-1">Compare performance across matches, maps, players, or time periods</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-7">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150",
              mode === m.key ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
            style={
              mode === m.key
                ? { background: "rgba(124,58,237,0.3)", boxShadow: "0 0 0 1px rgba(124,58,237,0.4)", border: "1px solid transparent" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Selection labels */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {[{ label: "Left", value: leftLabel, color: "#9F67FF" }, { label: "Right", value: rightLabel, color: "#22D3EE" }].map((s) => (
          <div key={s.label} className="rounded-2xl px-5 py-4 flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}30` }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{s.label}</span>
            <span className="font-display text-base font-bold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Main: radar + table */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        {/* Radar chart */}
        <div className="col-span-2 rounded-2xl p-6 flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-display text-sm font-bold text-white mb-4">Performance Radar</h3>
          <div className="flex gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="h-1 w-4 rounded-full bg-violet-400" />
              {leftLabel}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="h-1 w-4 rounded-full" style={{ background: "#22D3EE" }} />
              {rightLabel}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717A", fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#52525B", fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Radar name={leftLabel}  dataKey="left"  stroke="#9F67FF" fill="#9F67FF" fillOpacity={0.15} strokeWidth={2} />
              <Radar name={rightLabel} dataKey="right" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.10} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison table */}
        <div className="col-span-3 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="grid grid-cols-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 px-6 py-4 border-b border-white/[0.06]">
            <span>Metric</span>
            <span style={{ color: "#9F67FF" }}>{leftLabel}</span>
            <span style={{ color: "#22D3EE" }}>{rightLabel}</span>
            <span>Difference</span>
          </div>
          {metrics.map((row) => {
            const diff = row.left - row.right
            return (
              <div key={row.metric} className="grid grid-cols-4 items-center px-6 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                <span className="text-sm font-semibold text-white">{row.metric}</span>
                <span className="font-bold text-violet-300 text-sm">{row.left}{row.metric === "Win Rate" ? "%" : ""}</span>
                <span className="font-bold text-cyan-300 text-sm">{row.right}{row.metric === "Win Rate" ? "%" : ""}</span>
                <span className="text-xs">
                  <DiffBadge left={row.left} right={row.right} suffix={row.metric === "Win Rate" ? "%" : ""} />
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI insight */}
      <div className="rounded-2xl p-6"
        style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <h3 className="font-display text-sm font-bold text-white uppercase tracking-widest">Comparison Summary</h3>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">{insight}</p>
      </div>
    </div>
  )
}
