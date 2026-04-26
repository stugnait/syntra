"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Download, GitCompare, Trophy, Skull, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MatchReport } from "@/lib/report-data"
import { GRADE_COLOR } from "@/lib/report-data"

export function ReportHeader({ report }: { report: MatchReport }) {
  const router = useRouter()
  const [exported, setExported] = useState(false)

  const handleExport = () => {
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }
  const isWin   = report.result === "WIN" || report.result === "OT_WIN"
  const isOT    = report.result === "OT_WIN" || report.result === "OT_LOSS"
  const resultLabel = isOT
    ? (isWin ? "Overtime Victory" : "Overtime Defeat")
    : (isWin ? "Victory" : "Defeat")

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-5"
      style={{
        background: "rgba(10,10,18,0.9)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: isWin
          ? "0 0 40px rgba(124,58,237,0.12), inset 0 1px 0 rgba(124,58,237,0.15)"
          : "0 0 40px rgba(239,68,68,0.08), inset 0 1px 0 rgba(239,68,68,0.1)",
      }}
    >
      {/* Top violet glow bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: isWin ? "linear-gradient(90deg, transparent, #7C3AED, #22D3EE, transparent)" : "linear-gradient(90deg, transparent, #EF4444, transparent)" }}
      />

      {/* Subtle map grid background */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex items-start justify-between gap-6 p-7 pb-6">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-[0.22em] text-violet-400 uppercase mb-2">
            Deep Match Report
          </p>
          <h1 className="font-display text-3xl font-black text-white tracking-tight mb-2">
            {report.map}
            <span className={cn("ml-3 text-2xl font-bold", isWin ? "text-emerald-400" : "text-red-400")}>
              {report.score}
            </span>
            <span className={cn("ml-3 text-xl font-semibold", isWin ? "text-emerald-400/70" : "text-red-400/70")}>
              {resultLabel}
            </span>
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mb-5">
            <span className="text-zinc-400 font-medium">{report.source} Match</span>
            <span className="text-zinc-700">·</span>
            <span>{report.date}</span>
            <span className="text-zinc-700">·</span>
            <span>{report.rounds} rounds</span>
            <span className="text-zinc-700">·</span>
            <span>{report.duration}</span>
            <span className="text-zinc-700">·</span>
            <span className="text-emerald-500 font-medium">Demo parsed</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-600 font-mono text-[10px]">ID: {report.matchIdShort}</span>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold",
                isWin ? "bg-emerald-500/12 text-emerald-400" : "bg-red-500/12 text-red-400"
              )}
            >
              {isWin ? <Trophy className="h-3 w-3" /> : <Skull className="h-3 w-3" />}
              {isWin ? "WIN" : "LOSS"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold bg-violet-500/10 text-violet-400">
              FACEIT
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-400">
              Report Ready
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)", boxShadow: "0 0 12px rgba(124,58,237,0.3)" }}
            >
              {exported ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Download className="h-3.5 w-3.5" />}
              {exported ? "Exported!" : "Export PDF"}
            </button>
            <button
              onClick={() => router.push(`/compare?matchId=${report.matchId}`)}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <GitCompare className="h-3.5 w-3.5" />
              Compare
            </button>
            <button
              onClick={() => router.push("/upload")}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <FileText className="h-3.5 w-3.5" />
              View Demo
            </button>
          </div>
        </div>

        {/* Right — overall grade */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className="flex flex-col items-center justify-center w-[120px] h-[120px] rounded-2xl"
            style={{
              background: "rgba(0,0,0,0.4)",
              border: `1px solid ${GRADE_COLOR[report.overallGrade]}40`,
              boxShadow: `0 0 28px ${GRADE_COLOR[report.overallGrade]}20`,
            }}
          >
            <span
              className="font-display text-5xl font-black leading-none"
              style={{ color: GRADE_COLOR[report.overallGrade] }}
            >
              {report.overallGrade}
            </span>
            <span className="text-[10px] text-zinc-500 mt-1.5 tracking-wide">{report.overallScore}/100</span>
          </div>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-2 text-center">Overall Grade</p>
        </div>
      </div>
    </div>
  )
}
