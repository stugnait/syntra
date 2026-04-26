"use client"

import { AlertTriangle } from "lucide-react"
import type { MatchReport } from "@/lib/report-data"
import { SEVERITY_COLOR } from "@/lib/report-data"

export function MistakeBreakdown({ report }: { report: MatchReport }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
        </div>
        <p className="text-sm font-bold text-white">Mistake Breakdown</p>
        <span className="ml-auto text-[10px] text-zinc-600 uppercase tracking-widest">
          {report.mistakes.length} detected patterns
        </span>
      </div>

      <div className="space-y-3">
        {report.mistakes.map((mistake, i) => {
          const col = SEVERITY_COLOR[mistake.severity]
          return (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: col.bg, border: `1px solid ${col.border}` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: col.text }}
                  />
                  <h4 className="text-sm font-bold text-white">{mistake.title}</h4>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5"
                  style={{ background: `${col.text}15`, color: col.text }}
                >
                  {mistake.severity}
                </span>
              </div>

              {/* Explanation */}
              <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                {mistake.explanation}
              </p>

              {/* Detected rounds */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Detected in:</span>
                <div className="flex gap-1">
                  {mistake.rounds.map((r) => (
                    <span
                      key={r}
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: "rgba(255,255,255,0.06)", color: col.text }}
                    >
                      R{r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Impact */}
              <div
                className="rounded-lg p-2.5 mb-3"
                style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600">Impact:</span>
                  <span className="text-xs font-semibold" style={{ color: col.text }}>
                    {mistake.impact}
                  </span>
                </div>
                {mistake.impactMetric && (
                  <p className="text-[10px] text-zinc-600 mt-1">{mistake.impactMetric}</p>
                )}
              </div>

              {/* Recommendation */}
              <div
                className="rounded-lg p-2.5"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">
                  Recommendation
                </p>
                <p className="text-xs text-violet-300 leading-relaxed">
                  {mistake.recommendation}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {report.mistakes.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-xl"
          style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)" }}
        >
          <p className="text-sm font-semibold text-emerald-400">No major mistakes detected</p>
          <p className="text-xs text-zinc-500 mt-1">Great performance this match!</p>
        </div>
      )}
    </div>
  )
}
