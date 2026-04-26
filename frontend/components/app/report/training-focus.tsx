"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Target, Plus, ArrowRight, CheckCircle2 } from "lucide-react"
import type { MatchReport } from "@/lib/report-data"
import { PRIORITY_COLOR } from "@/lib/report-data"

export function TrainingFocus({ report }: { report: MatchReport }) {
  const router = useRouter()
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())
  const [allAdded, setAllAdded] = useState(false)

  const handleAddItem = (i: number) => {
    setAddedItems((prev) => new Set(prev).add(i))
  }

  const handleAddAll = () => {
    setAllAdded(true)
    setAddedItems(new Set(report.training.map((_, i) => i)))
  }
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            <Target className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Recommended Training Focus</p>
            <p className="text-[10px] text-zinc-600">Based on this match</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {report.training.map((item, i) => {
          const col = PRIORITY_COLOR[item.priority]
          return (
            <div
              key={i}
              className="rounded-xl p-4"
              style={{ background: col.bg, border: `1px solid ${col.border}` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: col.dot }}
                  />
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5"
                  style={{ background: `${col.text}15`, color: col.text }}
                >
                  {item.priority}
                </span>
              </div>

              {/* Why */}
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Why</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.why}</p>
              </div>

              {/* How to improve */}
              <div
                className="rounded-lg p-3 mb-3"
                style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">How to Improve</p>
                <p className="text-xs text-zinc-300 leading-relaxed">{item.how}</p>
              </div>

              {/* Related rounds */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600">Related rounds:</span>
                  <div className="flex gap-1">
                    {item.relatedRounds.map((r) => (
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
                <button
                  onClick={() => handleAddItem(i)}
                  className="flex items-center gap-1 text-[10px] font-semibold transition-colors"
                  style={{ color: addedItems.has(i) ? "#34D399" : "#A78BFA" }}
                >
                  {addedItems.has(i) ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  {addedItems.has(i) ? "Added" : "Add to plan"}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleAddAll}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all hover:opacity-90 flex-1 justify-center"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 0 12px rgba(124,58,237,0.25)" }}
        >
          {allAdded ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <Plus className="h-3.5 w-3.5" />}
          {allAdded ? "All Added to Plan" : "Add All to Training Plan"}
        </button>
        <button
          onClick={() => router.push("/recommendations")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Open Recommendations
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
