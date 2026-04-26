"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const MAPS = ["Mirage", "Inferno", "Ancient", "Nuke", "Anubis"]
const LAYERS = ["Deaths", "Kills", "Utility"]

// Heat zones for Mirage
const heatZones = [
  { id: "connector", x: 52, y: 38, r: 18, intensity: 0.85, type: "death",   label: "Connector",    deaths: 8,  untraded: 3, avgTime: "1:22" },
  { id: "a-site",    x: 30, y: 22, r: 14, intensity: 0.55, type: "kill",    label: "A Site",       deaths: 4,  untraded: 1, avgTime: "1:45" },
  { id: "mid",       x: 55, y: 55, r: 12, intensity: 0.65, type: "death",   label: "Mid Window",   deaths: 5,  untraded: 2, avgTime: "1:18" },
  { id: "b-site",    x: 75, y: 68, r: 10, intensity: 0.40, type: "utility", label: "B Site",       deaths: 2,  untraded: 0, avgTime: "2:01" },
  { id: "t-spawn",   x: 80, y: 30, r: 11, intensity: 0.30, type: "kill",    label: "T Spawn",      deaths: 1,  untraded: 0, avgTime: "2:30" },
  { id: "short",     x: 22, y: 48, r: 9,  intensity: 0.45, type: "death",   label: "Short",        deaths: 3,  untraded: 1, avgTime: "1:38" },
]

const TYPE_COLORS = {
  death:   { fill: "rgba(239,68,68,", stroke: "#EF4444" },
  kill:    { fill: "rgba(124,58,237,", stroke: "#7C3AED" },
  utility: { fill: "rgba(34,211,238,", stroke: "#22D3EE" },
}

export function TacticalMapPulse() {
  const [selectedMap, setSelectedMap] = useState("Mirage")
  const [selectedLayer, setSelectedLayer] = useState("Deaths")
  const [mapOpen, setMapOpen] = useState(false)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; zone: typeof heatZones[0] } | null>(null)

  const hovered = hoveredZone ? heatZones.find((z) => z.id === hoveredZone) : null

  return (
    <div
      className="rounded-2xl p-5 flex flex-col h-full"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base font-bold text-white">Tactical Map Pulse</h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Main danger: Connector / Mid</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Layer toggle */}
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {LAYERS.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLayer(l)}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                style={
                  selectedLayer === l
                    ? { background: "rgba(124,58,237,0.35)", color: "#C4B5FD" }
                    : { color: "#52525B" }
                }
              >
                {l}
              </button>
            ))}
          </div>
          {/* Map select */}
          <div className="relative">
            <button
              onClick={() => setMapOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-white"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {selectedMap} <ChevronDown className="h-3 w-3" />
            </button>
            {mapOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl overflow-hidden py-1"
                style={{ background: "#0E0E1A", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {MAPS.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMap(m); setMapOpen(false) }}
                    className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map visualization */}
      <div className="flex-1 relative rounded-xl overflow-hidden min-h-[200px]"
        style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Map outline sketch — simplified Mirage-style */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          {/* Rough map walls */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" rx="1"/>
          {/* A-site box */}
          <rect x="8" y="8" width="35" height="30" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" rx="0.5"/>
          {/* B-site box */}
          <rect x="60" y="55" width="30" height="28" fill="rgba(255,255,255,0.015)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" rx="0.5"/>
          {/* Connector */}
          <rect x="42" y="28" width="18" height="22" fill="rgba(239,68,68,0.04)" stroke="rgba(239,68,68,0.15)" strokeWidth="0.5" rx="0.5"/>
          {/* Mid */}
          <rect x="42" y="50" width="16" height="16" fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" rx="0.5"/>
          {/* Labels */}
          <text x="18" y="24" fontSize="3" fill="rgba(255,255,255,0.2)" textAnchor="middle">A SITE</text>
          <text x="75" y="70" fontSize="3" fill="rgba(255,255,255,0.2)" textAnchor="middle">B SITE</text>
          <text x="51" y="40" fontSize="2.5" fill="rgba(239,68,68,0.5)" textAnchor="middle">CON</text>
          <text x="50" y="60" fontSize="2.5" fill="rgba(255,255,255,0.2)" textAnchor="middle">MID</text>
        </svg>

        {/* Heat zones */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          {heatZones.map((zone) => {
            const c = TYPE_COLORS[zone.type as keyof typeof TYPE_COLORS]
            const isHov = hoveredZone === zone.id
            return (
              <g key={zone.id}>
                {/* Outer glow */}
                <circle
                  cx={zone.x} cy={zone.y} r={zone.r * 1.8}
                  fill={`${c.fill}${zone.intensity * 0.12})`}
                />
                {/* Main blob */}
                <circle
                  cx={zone.x} cy={zone.y} r={zone.r}
                  fill={`${c.fill}${zone.intensity * 0.35})`}
                  stroke={c.stroke}
                  strokeWidth={isHov ? 0.8 : 0.4}
                  strokeOpacity={isHov ? 0.9 : 0.5}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                />
                {/* Center dot */}
                <circle cx={zone.x} cy={zone.y} r={1.5} fill={c.stroke} opacity={0.7} />
              </g>
            )
          })}
        </svg>

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="absolute pointer-events-none z-10 rounded-xl px-3 py-2 text-xs"
            style={{
              left: `${hovered.x}%`,
              top: `${hovered.y}%`,
              transform: "translate(-50%, -110%)",
              background: "rgba(8,8,18,0.96)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
              minWidth: "120px",
            }}
          >
            <p className="font-semibold text-white mb-1">{hovered.label}</p>
            <p className="text-zinc-400">{hovered.deaths} deaths</p>
            <p className="text-zinc-400">{hovered.untraded} untraded</p>
            <p className="text-zinc-500">Avg death: {hovered.avgTime}</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        {[
          { label: "Death clusters", color: "#EF4444" },
          { label: "Duel zones",     color: "#7C3AED" },
          { label: "Utility impact", color: "#22D3EE" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <span className="h-2 w-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 4px ${l.color}` }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
