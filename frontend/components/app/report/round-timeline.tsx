"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MatchReport, Round, GradeLetter } from "@/lib/report-data"
import { GRADE_COLOR, ECONOMY_LABEL } from "@/lib/report-data"

type RoundFilter = "all" | "CT" | "T" | "mistakes" | "impact"

function roundRowColor(r: Round): { bg: string; border: string; dot: string } {
  const g = r.grade
  const isMistake = r.tags.includes("untraded") || r.tags.includes("positioning_mistake") || r.tags.includes("early_death")
  const isImpact  = r.tags.includes("multi_kill") || r.tags.includes("clutch") || r.tags.includes("good_entry")

  if (g === "D" || g === "F")         return { bg: "rgba(239,68,68,0.06)",   border: "rgba(239,68,68,0.2)",   dot: "#EF4444" }
  if (g === "C-" || (isMistake && g.startsWith("C"))) return { bg: "rgba(251,191,36,0.05)", border: "rgba(251,191,36,0.18)", dot: "#F59E0B" }
  if (isImpact && (g === "A+" || g === "A")) return { bg: "rgba(34,211,238,0.05)", border: "rgba(34,211,238,0.15)", dot: "#22D3EE" }
  if (r.result === "WIN" && (g === "A+" || g === "A" || g === "A-")) return { bg: "rgba(52,211,153,0.04)", border: "rgba(52,211,153,0.12)", dot: "#34D399" }
  return { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)", dot: "#52525B" }
}

function EconomyBadge({ eco }: { eco: Round["economy"] }) {
  const label = ECONOMY_LABEL[eco]
  const style: Record<string, { bg: string; text: string }> = {
    "Full Buy":  { bg: "rgba(52,211,153,0.1)", text: "#6EE7B7" },
    "Force Buy": { bg: "rgba(251,191,36,0.1)", text: "#FCD34D" },
    "Eco":       { bg: "rgba(113,113,122,0.1)", text: "#A1A1AA" },
    "Half Buy":  { bg: "rgba(129,140,248,0.1)", text: "#A5B4FC" },
  }
  const s = style[label]
  return (
    <span className="text-[10px] font-semibold rounded-md px-1.5 py-0.5" style={{ background: s.bg, color: s.text }}>
      {label}
    </span>
  )
}

export function RoundTimeline({ report }: { report: MatchReport }) {
  const [filter,   setFilter]   = useState<RoundFilter>("all")
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = report.roundTimeline.filter((r) => {
    if (filter === "CT")       return r.side === "CT"
    if (filter === "T")        return r.side === "T"
    if (filter === "mistakes") return r.tags.some((t) => ["untraded","positioning_mistake","early_death"].includes(t))
    if (filter === "impact")   return r.tags.some((t) => ["multi_kill","clutch","good_entry"].includes(t))
    return true
  })

  const filterLabels: { key: RoundFilter; label: string }[] = [
    { key: "all",      label: "All Rounds" },
    { key: "CT",       label: "CT Side" },
    { key: "T",        label: "T Side" },
    { key: "mistakes", label: "Mistakes Only" },
    { key: "impact",   label: "Impact Rounds" },
  ]

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header + filters */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm font-bold text-white">Round Timeline</p>
        <div className="flex items-center gap-1 flex-wrap">
          {filterLabels.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all",
                filter === key ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
              style={filter === key
                ? { background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.35)" }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[40px_36px_52px_80px_1fr_52px] gap-2 px-3 mb-1.5">
        {["Rnd","Side","Result","Economy","Main Event","Grade"].map((h) => (
          <p key={h} className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">{h}</p>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {filtered.map((round) => {
          const col  = roundRowColor(round)
          const open = expanded === round.round

          return (
            <div key={round.round}>
              <button
                className="w-full text-left"
                onClick={() => setExpanded(open ? null : round.round)}
              >
                <div
                  className={cn(
                    "grid grid-cols-[40px_36px_52px_80px_1fr_52px] gap-2 items-center px-3 py-2.5 rounded-xl transition-all",
                    "hover:brightness-110"
                  )}
                  style={{ background: col.bg, border: `1px solid ${col.border}` }}
                >
                  {/* Round */}
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: col.dot }} />
                    <span className="text-[11px] font-bold font-mono text-zinc-300">R{round.round}</span>
                  </div>

                  {/* Side */}
                  <span
                    className={cn(
                      "text-[11px] font-bold rounded-md px-1.5 py-0.5 text-center",
                      round.side === "CT" ? "bg-cyan-500/10 text-cyan-400" : "bg-amber-500/10 text-amber-400"
                    )}
                  >
                    {round.side}
                  </span>

                  {/* Result */}
                  <span
                    className={cn(
                      "text-[11px] font-bold rounded-md px-1.5 py-0.5 text-center",
                      round.result === "WIN" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {round.result === "WIN" ? "Won" : "Lost"}
                  </span>

                  {/* Economy */}
                  <EconomyBadge eco={round.economy} />

                  {/* Main event */}
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[11px] text-zinc-300 truncate">{round.mainEvent}</span>
                  </div>

                  {/* Grade */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black" style={{ color: GRADE_COLOR[round.grade] }}>
                      {round.grade}
                    </span>
                    {round.timeline ? (
                      open ? <ChevronUp className="h-3 w-3 text-zinc-600" /> : <ChevronDown className="h-3 w-3 text-zinc-600" />
                    ) : null}
                  </div>
                </div>
              </button>

              {/* Expanded detail */}
              {open && (
                <div
                  className="mt-1 mb-1 rounded-xl p-4 ml-3"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Round Note</p>
                  <p className="text-xs text-zinc-400 mb-4">{round.note}</p>

                  {round.timeline && (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Event Timeline</p>
                      <div className="space-y-1.5 mb-4">
                        {round.timeline.map((t, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="text-[10px] font-mono text-violet-500 shrink-0 w-10">{t.time}</span>
                            <span className="text-[11px] text-zinc-400">{t.event}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {round.analysis && (
                    <>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1.5">Analysis</p>
                      <p className="text-xs text-zinc-400 mb-3">{round.analysis}</p>
                    </>
                  )}

                  {round.recommendation && (
                    <div
                      className="rounded-xl px-3.5 py-2.5"
                      style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1">Recommendation</p>
                      <p className="text-xs text-violet-300">{round.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-zinc-600 text-sm py-8">No rounds match this filter.</p>
      )}
    </div>
  )
}
