"use client"

import type { MatchReport } from "@/lib/report-data"

export function DuelBreakdown({ report }: { report: MatchReport }) {
  return (
    <div
      className="rounded-2xl p-5 h-full"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-sm font-bold text-white mb-4">Duel Breakdown</p>

      {/* Main duel metrics */}
      <div className="space-y-2.5 mb-5">
        {report.duels.map((d) => (
          <div
            key={d.label}
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <p className="text-xs font-semibold text-zinc-300">{d.label}</p>
              {d.note && <p className="text-[10px] text-zinc-600 mt-0.5">{d.note}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              {d.lost !== undefined ? (
                <>
                  <span className="font-mono text-sm font-bold text-emerald-400">{d.won}</span>
                  <span className="text-zinc-700 text-xs">/</span>
                  <span className="font-mono text-sm font-bold text-red-400">{d.lost}</span>
                </>
              ) : (
                <span className="font-mono text-sm font-bold text-zinc-200">{d.won}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Duel matrix */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Enemy Duel Matrix</p>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Enemy", "Won", "Lost", "Diff"].map((h) => (
                <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-zinc-600 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.duelMatrix.map((row, i) => {
              const diff = row.won - row.lost
              return (
                <tr
                  key={row.enemy}
                  className="transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: i < report.duelMatrix.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <td className="px-3 py-2 text-[11px] font-mono text-zinc-300">{row.enemy}</td>
                  <td className="px-3 py-2 text-[11px] font-bold text-emerald-400">{row.won}</td>
                  <td className="px-3 py-2 text-[11px] font-bold text-red-400">{row.lost}</td>
                  <td className="px-3 py-2">
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: diff > 0 ? "#34D399" : diff < 0 ? "#F87171" : "#71717A" }}
                    >
                      {diff > 0 ? "+" : ""}{diff}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
