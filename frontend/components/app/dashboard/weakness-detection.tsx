"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ChevronRight, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"

const weaknesses = [
  {
    id: 1,
    title: "Early round exposure",
    description: "31% of your deaths happen before 1:15, mostly when taking first contact without flash support.",
    priority: "High" as const,
    relatedMatches: 5,
    maps: ["Mirage", "Inferno"],
    details: [
      "Mirage 13:9, rounds 4, 9, 16",
      "Nuke 8:13, rounds 3, 6",
      "Inferno 11:13, round 18",
    ],
    actions: [
      "Delay first contact by 4-6 seconds.",
      "Ask teammate for flash before wide peek.",
      "Hold crossfire instead of solo swing.",
    ],
  },
  {
    id: 2,
    title: "Low flash conversion",
    description: "Only 0.42 successful duels occur after your flash usage. Flashes land too early or without follow-up.",
    priority: "Medium" as const,
    relatedMatches: 4,
    maps: ["Ancient", "Mirage"],
    details: ["Ancient 13:7, rounds 6, 12", "Mirage 11:13, rounds 8, 15, 20"],
    actions: [
      "Time flashes 0.3s before peeking.",
      "Communicate flash intentions to teammates.",
      "Use popup flash for connector fights.",
    ],
  },
  {
    id: 3,
    title: "Connector pressure loss",
    description: "You lose 58% of mid connector duels on Mirage, especially during CT-side early round fights.",
    priority: "High" as const,
    relatedMatches: 7,
    maps: ["Mirage"],
    details: [
      "Mirage 13:9, rounds 2, 7, 11, 17",
      "Mirage 11:13, rounds 1, 5, 9, 14",
    ],
    actions: [
      "Pre-aim connector window from CT-spawn.",
      "Use AWP or auto-rifle for mid control.",
      "Rotate mid priority to 2nd man instead of solo.",
    ],
  },
]

const PRIORITY_STYLES = {
  High:   { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   text: "text-red-400",   badge: "bg-red-500/15 text-red-400 border-red-500/25" },
  Medium: { bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.20)",  text: "text-amber-400", badge: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  Low:    { bg: "rgba(34,211,238,0.06)",  border: "rgba(34,211,238,0.18)",  text: "text-cyan-400",  badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25" },
}

export function WeaknessDetection() {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState<number | null>(null)
  const drawerItem = weaknesses.find((w) => w.id === drawerOpen)

  return (
    <>
      <div
        className="rounded-2xl p-6 flex flex-col h-full"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="h-7 w-7 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-white leading-none">
              AI Weakness Detection
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Priority issues from recent demos</p>
          </div>
        </div>

        {/* Weakness cards */}
        <div className="flex flex-col gap-3 flex-1">
          {weaknesses.map((w) => {
            const s = PRIORITY_STYLES[w.priority]
            const isHigh = w.priority === "High"
            return (
              <div
                key={w.id}
                className={cn(
                  "rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.01] group",
                  isHigh && "animate-[weakness-pulse_4s_ease-in-out_infinite]"
                )}
                style={{
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                }}
                onClick={() => setDrawerOpen(w.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1">
                    <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", s.text)} strokeWidth={1.8} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{w.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{w.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-zinc-500">Related matches: {w.relatedMatches}</span>
                        <span className="text-zinc-700">·</span>
                        <span className="text-[10px] text-zinc-500">{w.maps.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5 border", s.badge)}>
                      {w.priority}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side drawer */}
      {drawerOpen !== null && drawerItem && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(null)}
          />
          <aside
            className="fixed right-0 top-0 z-50 h-full w-[380px] flex flex-col"
            style={{
              background: "rgba(8,8,18,0.98)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(24px)",
            }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <p className="font-display font-bold text-white">{drawerItem.title}</p>
              <button
                onClick={() => setDrawerOpen(null)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Detected in</p>
                <ul className="space-y-1.5">
                  {drawerItem.details.map((d, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">›</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Recommended actions</p>
                <ol className="space-y-2">
                  {drawerItem.actions.map((a, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2.5">
                      <span
                        className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA" }}
                      >
                        {i + 1}
                      </span>
                      {a}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
                onClick={() => { setDrawerOpen(null); router.push("/recommendations") }}
              >
                View Recommendations
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
