"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MatchReport, GradeLetter } from "@/lib/report-data"
import { GRADE_COLOR } from "@/lib/report-data"

function gradeColorMuted(g: GradeLetter): { bg: string; border: string; ring: string } {
  const c = GRADE_COLOR[g]
  if (g === "A+" || g === "A" || g === "A-") return { bg: "rgba(52,211,153,0.07)", border: "rgba(52,211,153,0.18)", ring: "rgba(52,211,153,0.4)" }
  if (g === "B+" || g === "B" || g === "B-") return { bg: "rgba(129,140,248,0.07)", border: "rgba(129,140,248,0.18)", ring: "rgba(129,140,248,0.4)" }
  if (g === "C+" || g === "C" || g === "C-") return { bg: "rgba(252,211,77,0.06)", border: "rgba(252,211,77,0.18)", ring: "rgba(252,211,77,0.4)" }
  return { bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.18)", ring: "rgba(248,113,113,0.4)" }
}

const GRADE_KEYS = ["aim", "utility", "positioning", "economy", "clutch"] as const
const GRADE_LABELS: Record<typeof GRADE_KEYS[number], string> = {
  aim: "Aim", utility: "Utility", positioning: "Positioning", economy: "Economy", clutch: "Clutch",
}

export function GradeCards({ report }: { report: MatchReport }) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  return (
    <div className="grid grid-cols-5 gap-3 mb-5">
      {GRADE_KEYS.map((key) => {
        const g   = report.grades[key]
        const col = gradeColorMuted(g.grade)
        return (
          <div
            key={key}
            className="relative rounded-2xl p-4 flex flex-col gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: col.bg, border: `1px solid ${col.border}` }}
          >
            {/* Tooltip trigger */}
            <button
              className="absolute top-3 right-3 text-zinc-700 hover:text-zinc-400 transition-colors"
              onMouseEnter={() => setTooltip(key)}
              onMouseLeave={() => setTooltip(null)}
            >
              <Info className="h-3.5 w-3.5" />
            </button>

            {/* Tooltip */}
            {tooltip === key && (
              <div
                className="absolute z-30 bottom-full left-0 mb-2 w-56 rounded-xl p-3 text-[11px] text-zinc-300 leading-relaxed"
                style={{ background: "#0E0E1A", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 16px 40px rgba(0,0,0,0.8)" }}
              >
                {g.tooltip}
              </div>
            )}

            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{GRADE_LABELS[key]}</p>

            <div className="flex items-end gap-2">
              <span className="font-display text-4xl font-black leading-none" style={{ color: GRADE_COLOR[g.grade] }}>
                {g.grade}
              </span>
              <span className="text-xs text-zinc-600 mb-0.5 font-mono">{g.score}/100</span>
            </div>

            {/* Score bar */}
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${g.score}%`, background: GRADE_COLOR[g.grade], boxShadow: `0 0 8px ${GRADE_COLOR[g.grade]}60` }}
              />
            </div>

            <p className="text-[11px] text-zinc-500 leading-snug">{g.note}</p>
          </div>
        )
      })}
    </div>
  )
}
