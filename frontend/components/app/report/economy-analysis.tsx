"use client"

import { DollarSign } from "lucide-react"
import type { MatchReport } from "@/lib/report-data"

export function EconomyAnalysis({ report }: { report: MatchReport }) {
  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <p className="text-sm font-bold text-white">Economy Analysis</p>
      </div>

      {/* Economy metrics */}
      <div className="space-y-2.5 mb-5">
        {report.economy.map((e) => (
          <div
            key={e.label}
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <p className="text-xs font-semibold text-zinc-300">{e.label}</p>
              {e.note && <p className="text-[10px] text-zinc-600 mt-0.5">{e.note}</p>}
            </div>
            <span className="font-mono text-sm font-bold text-zinc-200 shrink-0 ml-3">{e.value}</span>
          </div>
        ))}
      </div>

      {/* AI economy insight */}
      <div
        className="rounded-xl p-3.5 flex items-start gap-3"
        style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)" }}
      >
        <DollarSign className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-400 leading-relaxed">{report.economyNote}</p>
      </div>
    </div>
  )
}
