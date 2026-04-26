"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { MatchReport, HeatZone } from "@/lib/report-data"

type Layer = "kills" | "deaths" | "both"
type Side  = "all" | "CT" | "T"

export function HeatmapBlock({ report }: { report: MatchReport }) {
  const [layer,    setLayer]    = useState<Layer>("both")
  const [side,     setSide]     = useState<Side>("all")
  const [selected, setSelected] = useState<HeatZone | null>(null)

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm font-bold text-white">Kill / Death Heatmap</p>
        <div className="flex items-center gap-1.5">
          {(["kills","deaths","both"] as Layer[]).map((l) => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-all",
                layer === l ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              style={layer === l
                ? { background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.35)" }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {l}
            </button>
          ))}
          <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
          {(["all","CT","T"] as Side[]).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                side === s ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              style={side === s
                ? { background: "rgba(34,211,238,0.18)", border: "1px solid rgba(34,211,238,0.3)" }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Map area */}
      <div className="flex gap-4 flex-wrap">
        {/* Map canvas */}
        <div
          className="relative flex-1 min-w-[280px] rounded-xl overflow-hidden"
          style={{
            aspectRatio: "1 / 1",
            background: "#0B0B14",
            border: "1px solid rgba(255,255,255,0.06)",
            minHeight: 280,
          }}
        >
          {/* Mirage map grid representation */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
            {/* Map tactical zones — simplified Mirage layout */}
            <defs>
              <filter id="glow-green">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-red">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Background zones */}
            <rect x="0" y="0" width="400" height="400" fill="#0B0B14" />
            {/* T spawn */}
            <rect x="160" y="260" width="100" height="80" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            {/* Mid */}
            <rect x="140" y="160" width="120" height="100" rx="4" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            {/* A site */}
            <rect x="250" y="60" width="130" height="120" rx="4" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            {/* B site */}
            <rect x="20" y="180" width="110" height="100" rx="4" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            {/* CT spawn */}
            <rect x="140" y="20" width="120" height="80" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

            {/* Zone labels */}
            <text x="315" y="130" fill="rgba(255,255,255,0.12)" fontSize="10" textAnchor="middle" fontFamily="monospace">A SITE</text>
            <text x="75"  y="240" fill="rgba(255,255,255,0.12)" fontSize="10" textAnchor="middle" fontFamily="monospace">B SITE</text>
            <text x="200" y="215" fill="rgba(255,255,255,0.10)" fontSize="9"  textAnchor="middle" fontFamily="monospace">MID</text>
            <text x="200" y="320" fill="rgba(255,255,255,0.08)" fontSize="9"  textAnchor="middle" fontFamily="monospace">T SPAWN</text>
            <text x="200" y="65"  fill="rgba(255,255,255,0.08)" fontSize="9"  textAnchor="middle" fontFamily="monospace">CT SPAWN</text>

            {/* Heat zones */}
            {report.heatZones.map((zone) => {
              const cx = (zone.x / 100) * 400
              const cy = (zone.y / 100) * 400
              const r  = zone.r

              const showKills  = layer === "kills"  || layer === "both"
              const showDeaths = layer === "deaths" || layer === "both"

              const isSelected = selected?.id === zone.id
              const intensity  = Math.min(zone.deaths / 5, 1)

              return (
                <g key={zone.id} className="cursor-pointer" onClick={() => setSelected(selected?.id === zone.id ? null : zone)}>
                  {/* Death cluster (red) */}
                  {showDeaths && zone.deaths > 0 && (
                    <circle
                      cx={cx} cy={cy} r={r * (0.5 + intensity * 0.5)}
                      fill={`rgba(239,68,68,${0.12 + intensity * 0.2})`}
                      stroke={isSelected ? "rgba(239,68,68,0.7)" : "rgba(239,68,68,0.25)"}
                      strokeWidth={isSelected ? 1.5 : 0.5}
                      filter={isSelected ? "url(#glow-red)" : undefined}
                    />
                  )}
                  {/* Kill cluster (emerald) */}
                  {showKills && zone.kills > 0 && (
                    <circle
                      cx={cx + (showDeaths ? 8 : 0)} cy={cy - (showDeaths ? 8 : 0)}
                      r={Math.min(zone.kills * 4, r * 0.7)}
                      fill={`rgba(52,211,153,${0.1 + (zone.kills / 10) * 0.2})`}
                      stroke={isSelected ? "rgba(52,211,153,0.6)" : "rgba(52,211,153,0.2)"}
                      strokeWidth={isSelected ? 1.5 : 0.5}
                      filter={isSelected ? "url(#glow-green)" : undefined}
                    />
                  )}
                  {/* Dot count label */}
                  {(zone.kills > 0 || zone.deaths > 0) && (
                    <>
                      {showDeaths && zone.deaths > 0 && (
                        <text x={cx} y={cy + 4} fill="rgba(248,113,113,0.9)" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                          {zone.deaths}
                        </text>
                      )}
                      {showKills && zone.kills > 0 && (
                        <text x={cx + (showDeaths ? 8 : 0)} y={cy - (showDeaths ? 4 : -4)} fill="rgba(52,211,153,0.9)" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                          {zone.kills}
                        </text>
                      )}
                    </>
                  )}
                  {/* Zone label */}
                  <text x={cx} y={cy + r + 12} fill="rgba(255,255,255,0.25)" fontSize="8" textAnchor="middle" fontFamily="monospace">
                    {zone.label}
                  </text>
                </g>
              )
            })}

            {/* Legend */}
            <g transform="translate(8, 370)">
              <circle cx="6" cy="6" r="5" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.5)" strokeWidth="0.5" />
              <text x="14" y="10" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">Deaths</text>
              <circle cx="56" cy="6" r="5" fill="rgba(52,211,153,0.25)" stroke="rgba(52,211,153,0.4)" strokeWidth="0.5" />
              <text x="64" y="10" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="monospace">Kills</text>
            </g>
          </svg>
        </div>

        {/* Zone details panel */}
        <div className="w-[200px] flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Click zone for details</p>

          {selected ? (
            <div
              className="rounded-xl p-3.5"
              style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <p className="text-sm font-bold text-white mb-2">{selected.label}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[11px] text-zinc-500">Deaths</span>
                  <span className="text-[11px] font-bold text-red-400">{selected.deaths}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-zinc-500">Kills</span>
                  <span className="text-[11px] font-bold text-emerald-400">{selected.kills}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-zinc-500">Untraded deaths</span>
                  <span className="text-[11px] font-bold text-amber-400">{selected.untradedDeaths}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-zinc-500">Avg death time</span>
                  <span className="text-[11px] font-mono text-zinc-300">{selected.avgDeathTime}</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-2.5 pt-2.5 leading-relaxed" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {selected.cause}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {report.heatZones.map((z) => (
                <button
                  key={z.id}
                  onClick={() => setSelected(z)}
                  className="w-full text-left rounded-xl px-3 py-2 text-[11px] transition-all hover:bg-white/[0.04]"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-semibold">{z.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-mono">{z.kills}K</span>
                      <span className="text-red-400 font-mono">{z.deaths}D</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
