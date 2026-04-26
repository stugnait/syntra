"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { KPI_CARDS } from "@/lib/analytics-data"

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number>(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(ease * target))
      if (t < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [target, duration])
  return value
}

const badgeStyles = {
  positive: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  warning:  "text-amber-400  bg-amber-400/10  border-amber-400/20",
  danger:   "text-red-400    bg-red-400/10    border-red-400/20",
}

const borderStyles = {
  positive: "1px solid rgba(255,255,255,0.07)",
  warning:  "1px solid rgba(251,191,36,0.25)",
  danger:   "1px solid rgba(239,68,68,0.25)",
}

function Card({ card, delay, onTabChange }: {
  card: typeof KPI_CARDS[number]
  delay: number
  onTabChange: (tab: string) => void
}) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const displayValue = useCountUp(visible ? card.value : 0)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <button
      onClick={() => onTabChange(card.tab)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-5 flex flex-col gap-3 text-left transition-all duration-300 w-full"
      style={{
        background: hovered ? "rgba(124,58,237,0.08)" : "rgba(255,255,255,0.03)",
        border: borderStyles[card.badgeType],
        boxShadow: hovered ? "0 0 20px rgba(124,58,237,0.1), 0 8px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <span className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
        {card.label}
      </span>
      <div className="flex items-end gap-1">
        <span className="font-display text-4xl font-black text-white tabular-nums leading-none">
          {displayValue}
        </span>
        <span className="font-display text-lg font-bold text-white/40 mb-0.5">{card.suffix}</span>
      </div>
      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border w-fit", badgeStyles[card.badgeType])}>
        {card.badge}
      </span>
      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: visible ? `${card.value}%` : "0%",
            background:
              card.badgeType === "danger"
                ? "linear-gradient(90deg,#EF4444,#F87171)"
                : card.badgeType === "warning"
                ? "linear-gradient(90deg,#F59E0B,#FCD34D)"
                : "linear-gradient(90deg,#7C3AED,#22D3EE)",
            transitionDelay: `${delay + 300}ms`,
          }}
        />
      </div>
    </button>
  )
}

export function AnalyticsKpiCards({ onTabChange }: { onTabChange: (tab: string) => void }) {
  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {KPI_CARDS.map((card, i) => (
        <Card key={card.label} card={card} delay={i * 80} onTabChange={onTabChange} />
      ))}
    </div>
  )
}
