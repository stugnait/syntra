"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Clock, AlertCircle, BarChart2, Map, RefreshCw, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { type Match, GRADE_COLORS, STATUS_CONFIG } from "@/lib/matches-data"

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-zinc-500 w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-semibold text-zinc-300 w-6 text-right">{value}</span>
    </div>
  )
}

export function MatchCard({ match }: { match: Match }) {
  const [hovered, setHovered] = useState(false)
  const gradeColor = GRADE_COLORS[match.grade] ?? "#71717A"
  const statusCfg = STATUS_CONFIG[match.status]
  const isReady = match.status === "ready"
  const isProcessing = match.status === "processing"
  const isWaiting = match.status === "waiting_demo"
  const isFailed = match.status === "failed"
  const isStatsOnly = match.status === "stats_only"

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200"
      style={{
        background: hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
        transform: hovered ? "translateY(-1px)" : "none",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-base font-bold text-white">{match.map}</span>
            <span
              className={cn(
                "text-[11px] font-black tracking-wider rounded-lg px-2 py-0.5",
                match.result === "WIN"  && "bg-emerald-500/12 text-emerald-400",
                match.result === "LOSS" && "bg-red-500/12 text-red-400",
                match.result === "DRAW" && "bg-zinc-500/12 text-zinc-400",
              )}
            >
              {match.result}
            </span>
            <span className="text-sm font-mono text-zinc-300">{match.score}</span>
          </div>
          <p className="text-[11px] text-zinc-600">
            {match.dateLabel} · FACEIT Match · {match.rounds} rounds
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-0.5"
            style={{ background: statusCfg.bg, color: statusCfg.text }}
          >
            {statusCfg.label}
          </span>
          {isReady && (
            <span
              className="text-xl font-black leading-none"
              style={{ color: gradeColor, textShadow: `0 0 10px ${gradeColor}60` }}
            >
              {match.grade}
            </span>
          )}
          {isReady && (
            <span
              className={cn(
                "text-[11px] font-bold",
                match.eloChange > 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {match.eloChange > 0 ? "+" : ""}{match.eloChange} ELO
            </span>
          )}
        </div>
      </div>

      {/* Stats row — only for ready / stats_only */}
      {(isReady || isStatsOnly) && (
        <div className="flex items-center gap-4 mb-4 py-2 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)" }}>
          {[
            { label: "K/D",  value: match.kd },
            { label: "ADR",  value: match.adr },
            { label: "HS",   value: `${match.hs}%` },
            { label: "ELO",  value: match.eloChange > 0 ? `+${match.eloChange}` : `${match.eloChange}` },
            { label: "KAST", value: `${match.kast}%` },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{s.label}</span>
              <span
                className={cn(
                  "text-sm font-bold",
                  s.label === "ELO"
                    ? match.eloChange > 0 ? "text-emerald-400" : "text-red-400"
                    : "text-white"
                )}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Score bars — only for ready */}
      {isReady && (
        <div className="space-y-1.5 mb-3">
          <ScoreBar label="Aim Score"     value={match.aimScore}     color="linear-gradient(90deg,#9F67FF,#C4B5FD)" />
          <ScoreBar label="Utility Score" value={match.utilityScore} color="linear-gradient(90deg,#22D3EE,#67E8F9)" />
          <ScoreBar label="Impact Score"  value={match.impactScore}  color="linear-gradient(90deg,#10B981,#34D399)" />
          <ScoreBar label="Positioning"   value={match.positionScore} color="linear-gradient(90deg,#F59E0B,#FCD34D)" />
        </div>
      )}

      {/* AI insight */}
      {isReady && match.mainInsight && (
        <div
          className="text-xs text-zinc-400 px-3 py-2 rounded-xl mb-3 leading-relaxed"
          style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)" }}
        >
          <span className="text-violet-400 font-semibold">AI: </span>
          {match.mainInsight}
        </div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Loader2 className="h-3.5 w-3.5 text-violet-400 animate-spin" />
            <span className="text-xs text-violet-300">SYNTRA is parsing demo telemetry.</span>
          </div>
          <p className="text-[11px] text-zinc-500 mb-2">Current step: extracting player positions.</p>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${match.processingProgress ?? 0}%`,
                background: "linear-gradient(90deg, #7C3AED, #22D3EE)",
              }}
            />
          </div>
          <p className="text-[10px] text-zinc-600 mt-1">{match.processingProgress ?? 0}% complete · Estimated 2-4 min</p>
        </div>
      )}

      {/* Waiting demo state */}
      {isWaiting && (
        <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Match was detected. Demo resource is not available yet. SYNTRA will process it automatically once FACEIT uploads the demo.
          </p>
        </div>
      )}

      {/* Failed state */}
      {isFailed && (
        <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Could not process demo file. Possible reason: unavailable or corrupted demo resource.
          </p>
        </div>
      )}

      {/* Stats only */}
      {isStatsOnly && (
        <div className="flex items-start gap-2 mb-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.12)" }}>
          <FileText className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Only FACEIT scoreboard data is available. Deep telemetry analysis requires demo access.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-1">
        {isReady && (
          <>
            <Link
              href={`/matches/${match.id}`}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 0 10px rgba(124,58,237,0.3)" }}
            >
              <FileText className="h-3 w-3" />
              Open Report
            </Link>
            <button className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <BarChart2 className="h-3 w-3" />
              Compare
            </button>
            <Link
              href={`/heatmaps?matchId=${match.id}`}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Map className="h-3 w-3" />
              Heatmap
            </Link>
          </>
        )}
        {isProcessing && (
          <button className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-violet-300" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            View Processing Details
          </button>
        )}
        {isWaiting && (
          <button className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-amber-300" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
            <RefreshCw className="h-3 w-3" />
            Check Again
          </button>
        )}
        {isFailed && (
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-red-300" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
            <button className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              Report Issue
            </button>
          </div>
        )}
        {isStatsOnly && (
          <button className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-cyan-300" style={{ background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.15)" }}>
            View Basic Stats
          </button>
        )}
      </div>
    </div>
  )
}
