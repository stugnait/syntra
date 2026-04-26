"use client"

import { useState, useRef } from "react"
import { ChevronDown, Layers, Map, Users, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  type LayerKey,
  MIRAGE_POINTS,
  LAYER_COLORS,
  HEATMAP_ZONES,
  RELATED_EXAMPLES,
} from "@/lib/heatmap-data"

const MAPS          = ["Mirage", "Inferno", "Ancient", "Nuke"]
const LAYERS: { key: LayerKey; label: string }[] = [
  { key: "deaths",        label: "Deaths" },
  { key: "kills",         label: "Kills" },
  { key: "movement",      label: "Movement" },
  { key: "opening_duels", label: "Opening Duels" },
  { key: "utility",       label: "Utility" },
  { key: "damage",        label: "Damage" },
  { key: "clutch",        label: "Clutch" },
]
const SIDES         = ["All", "CT", "T"]
const ROUND_PHASES  = ["All", "Early (1:55–1:15)", "Mid (1:15–0:40)", "Late (0:40–0:00)"]
const MATCH_SCOPES  = ["Last match", "Last 10 matches", "Last 30 days", "Custom"]

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.8} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</span>
    </div>
  )
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "w-full text-left rounded-xl px-3 py-2 text-xs font-medium transition-all",
            value === o ? "text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
          )}
          style={value === o ? { background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)" } : { border: "1px solid transparent" }}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export default function HeatmapsPage() {
  const [selectedMap,   setSelectedMap]   = useState("Mirage")
  const [selectedLayer, setSelectedLayer] = useState<LayerKey>("deaths")
  const [selectedSide,  setSelectedSide]  = useState("All")
  const [roundPhase,    setRoundPhase]    = useState("All")
  const [matchScope,    setMatchScope]    = useState("Last 10 matches")
  const [hoveredZone,   setHoveredZone]   = useState<string | null>(null)
  const [selectedZone,  setSelectedZone]  = useState<string | null>(null)
  const [tooltip,       setTooltip]       = useState<{ x: number; y: number; zone: string } | null>(null)

  const mapRef = useRef<HTMLDivElement>(null)

  const points = MIRAGE_POINTS[selectedLayer].filter((p) => {
    if (selectedSide === "CT")   return p.side === "CT"   || p.side === "both"
    if (selectedSide === "T")    return p.side === "T"    || p.side === "both"
    return true
  })

  const { point: pointColor, glow: glowColor } = LAYER_COLORS[selectedLayer]

  const zoneInfo = selectedZone ? HEATMAP_ZONES[selectedZone] : null

  return (
    <div className="min-h-screen p-7 pb-12" style={{ background: "#05050A" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">TACTICAL HEATMAPS</h1>
          <p className="text-zinc-500 text-sm mt-1">See where your impact and mistakes happen on every map.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          {points.length} data points loaded
        </div>
      </div>

      {/* Main layout: controls left, map right */}
      <div className="flex gap-5">
        {/* Left controls panel */}
        <div className="w-72 shrink-0 space-y-5">
          {/* Map selector */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <SectionTitle icon={Map} label="Map" />
            <RadioGroup options={MAPS} value={selectedMap} onChange={setSelectedMap} />
          </div>

          {/* Layer selector */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <SectionTitle icon={Layers} label="Layer" />
            <div className="space-y-1">
              {LAYERS.map((l) => {
                const active = selectedLayer === l.key
                const { point } = LAYER_COLORS[l.key]
                return (
                  <button
                    key={l.key}
                    onClick={() => setSelectedLayer(l.key)}
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                      active ? "text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                    )}
                    style={active ? { background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)" } : { border: "1px solid transparent" }}
                  >
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: point, boxShadow: active ? `0 0 6px ${point}` : "none" }} />
                    {l.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Side */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <SectionTitle icon={Users} label="Side" />
            <RadioGroup options={SIDES} value={selectedSide} onChange={setSelectedSide} />
          </div>

          {/* Round phase */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <SectionTitle icon={Clock} label="Round Phase" />
            <RadioGroup options={ROUND_PHASES} value={roundPhase} onChange={setRoundPhase} />
          </div>

          {/* Match scope */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <SectionTitle icon={Layers} label="Match Scope" />
            <RadioGroup options={MATCH_SCOPES} value={matchScope} onChange={setMatchScope} />
          </div>

          {/* Legend */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Legend</p>
            <div className="space-y-2">
              {[
                { label: "High density", size: "h-4 w-4", opacity: 1 },
                { label: "Med density",  size: "h-3 w-3", opacity: 0.6 },
                { label: "Low density",  size: "h-2 w-2", opacity: 0.35 },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className={cn("rounded-full shrink-0", l.size)} style={{ background: pointColor, opacity: l.opacity, boxShadow: `0 0 8px ${glowColor}` }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: map + zone details + examples */}
        <div className="flex-1 space-y-5">
          {/* Interactive map */}
          <div
            ref={mapRef}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              aspectRatio: "16/9",
            }}
          >
            {/* Map background (stylised grid) */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(8,8,20,0.95) 0%, rgba(12,8,28,0.95) 100%)" }}>
              {/* Map name label */}
              <div className="absolute top-4 left-4 z-10">
                <span className="font-display text-xs font-black tracking-widest uppercase text-zinc-600 px-3 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {selectedMap}
                </span>
              </div>
              <div className="absolute top-4 right-4 z-10">
                <span className="text-[10px] font-semibold text-zinc-600 px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.4)" }}>
                  {LAYER_COLORS[selectedLayer].label} layer · {selectedSide} side
                </span>
              </div>

              {/* Stylised map grid */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Zone outlines (simplified map topology) */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 100 56" preserveAspectRatio="none">
                {/* A site */}
                <rect x="62" y="14" width="22" height="18" rx="1" fill="none" stroke="white" strokeWidth="0.3" />
                <text x="73" y="24" fontSize="2" fill="white" textAnchor="middle" dominantBaseline="middle">A SITE</text>
                {/* B site */}
                <rect x="10" y="70" width="20" height="16" rx="1" fill="none" stroke="white" strokeWidth="0.3" />
                {/* Connector */}
                <rect x="36" y="30" width="12" height="8" rx="1" fill="none" stroke="white" strokeWidth="0.3" />
                <text x="42" y="34.5" fontSize="1.8" fill="white" textAnchor="middle" dominantBaseline="middle">CONN</text>
                {/* Mid */}
                <rect x="42" y="14" width="16" height="10" rx="1" fill="none" stroke="white" strokeWidth="0.3" />
                <text x="50" y="19.5" fontSize="1.8" fill="white" textAnchor="middle" dominantBaseline="middle">MID</text>
                {/* B apartments */}
                <rect x="10" y="52" width="14" height="16" rx="1" fill="none" stroke="white" strokeWidth="0.3" />
                <text x="17" y="60" fontSize="1.8" fill="white" textAnchor="middle" dominantBaseline="middle">B APTS</text>
              </svg>

              {/* Heatmap points */}
              {points.map((p, i) => {
                const size = 8 + p.intensity * 20
                const isHovered = hoveredZone === p.zone
                return (
                  <div
                    key={i}
                    className="absolute cursor-pointer transition-all duration-200"
                    style={{
                      left:   `${p.x}%`,
                      top:    `${p.y}%`,
                      width:  `${size}px`,
                      height: `${size}px`,
                      transform: "translate(-50%, -50%)",
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${pointColor} 0%, ${glowColor} 40%, transparent 70%)`,
                      opacity: isHovered ? 1 : 0.6 + p.intensity * 0.4,
                      boxShadow: isHovered ? `0 0 ${size * 1.5}px ${glowColor}` : `0 0 ${size * 0.6}px ${glowColor}`,
                    }}
                    onMouseEnter={() => {
                      setHoveredZone(p.zone)
                      setTooltip({ x: p.x, y: p.y, zone: p.zone })
                    }}
                    onMouseLeave={() => {
                      setHoveredZone(null)
                      setTooltip(null)
                    }}
                    onClick={() => setSelectedZone(p.zone === selectedZone ? null : p.zone)}
                  />
                )
              })}

              {/* Hover tooltip */}
              {tooltip && HEATMAP_ZONES[tooltip.zone] && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{ left: `${Math.min(tooltip.x + 2, 70)}%`, top: `${Math.max(tooltip.y - 18, 2)}%` }}
                >
                  <div className="rounded-xl px-3 py-2 text-xs whitespace-nowrap" style={{ background: "rgba(8,8,20,0.96)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
                    <p className="font-bold text-white mb-1">{tooltip.zone}</p>
                    {HEATMAP_ZONES[tooltip.zone] && (
                      <div className="space-y-0.5 text-[10px] text-zinc-400">
                        <p>Deaths: <span className="text-red-400 font-semibold">{HEATMAP_ZONES[tooltip.zone].deaths}</span></p>
                        <p>Untraded: <span className="text-amber-400 font-semibold">{HEATMAP_ZONES[tooltip.zone].untradedDeaths}</span></p>
                        <p>Avg time: <span className="text-white font-semibold">{HEATMAP_ZONES[tooltip.zone].avgDeathTime}</span></p>
                        <p className="text-violet-400 mt-1">Click to inspect →</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Zone details + related examples */}
          {selectedZone && zoneInfo ? (
            <div className="grid grid-cols-2 gap-5">
              {/* Zone detail panel */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm font-bold text-white">Selected Zone: {zoneInfo.name}</h3>
                  <button onClick={() => setSelectedZone(null)} className="rounded-lg p-1 hover:bg-white/[0.08] transition-colors">
                    <X className="h-3.5 w-3.5 text-zinc-500" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Deaths",         value: zoneInfo.deaths,         color: "#EF4444" },
                    { label: "Kills",          value: zoneInfo.kills,          color: "#10B981" },
                    { label: "Duel diff",      value: zoneInfo.duelDiff > 0 ? `+${zoneInfo.duelDiff}` : `${zoneInfo.duelDiff}`, color: zoneInfo.duelDiff >= 0 ? "#10B981" : "#EF4444" },
                    { label: "Untraded deaths",value: zoneInfo.untradedDeaths, color: "#F59E0B" },
                    { label: "Avg death time", value: zoneInfo.avgDeathTime,   color: "#9F67FF" },
                    { label: "Severity",       value: zoneInfo.severity,       color: zoneInfo.severity === "High" ? "#EF4444" : zoneInfo.severity === "Medium" ? "#F59E0B" : "#10B981" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">{s.label}</p>
                      <p className="font-display font-black text-lg" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Main Issue</p>
                  <p className="text-sm text-red-300">{zoneInfo.mainIssue}</p>
                </div>
              </div>

              {/* Related examples */}
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="font-display text-sm font-bold text-white mb-4">Related Examples</h3>
                <div className="space-y-3">
                  {RELATED_EXAMPLES.map((ex, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-white">{ex.match}</p>
                        <span className="text-[10px] text-zinc-500">Round {ex.round}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-3">{ex.description}</p>
                      <button className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                        Open Round →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderStyle: "dashed" }}>
              <p className="text-zinc-600 text-sm">Click a point on the map to inspect the zone details and related examples.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
