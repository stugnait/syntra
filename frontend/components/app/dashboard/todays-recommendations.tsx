"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Dumbbell, Eye, Zap } from "lucide-react"

const recs = [
  {
    icon: Dumbbell,
    title: "Practice Mirage connector pre-aim",
    why: "You lost 7 of 11 duels in this area across the last 5 Mirage matches.",
    stat: "-18% duel differential",
    color: "#EF4444",
  },
  {
    icon: Eye,
    title: "Delay early CT-side fights by 4-6 seconds",
    why: "31% of your deaths happen before 1:15 in the round.",
    stat: "High-priority weakness",
    color: "#F59E0B",
  },
  {
    icon: Zap,
    title: "Improve flash timing before A-site executes",
    why: "Only 0.42 successful duels occur after flash usage on execute rounds.",
    stat: "Utility Score: 71",
    color: "#22D3EE",
  },
]

export function TodaysRecommendations() {
  const router = useRouter()
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-base font-bold text-white">
            {"Today's Training Focus"}
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">Based on your last 10 matches</p>
        </div>
        <Link
          href="/recommendations"
          className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-violet-300 transition-all hover:text-white"
          style={{
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          Open Recommendations <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {recs.map((rec, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={() => router.push("/recommendations")}
            onKeyDown={(e) => e.key === "Enter" && router.push("/recommendations")}
            className="rounded-xl p-4 flex flex-col gap-2 group hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center mb-1"
              style={{
                background: `${rec.color}12`,
                border: `1px solid ${rec.color}30`,
              }}
            >
              <rec.icon className="h-4 w-4" style={{ color: rec.color }} strokeWidth={1.8} />
            </div>
            <p className="text-sm font-semibold text-white leading-snug">{rec.title}</p>
            <p className="text-xs text-zinc-500 leading-relaxed">{rec.why}</p>
            <span
              className="text-[10px] font-bold mt-auto"
              style={{ color: rec.color }}
            >
              {rec.stat}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
