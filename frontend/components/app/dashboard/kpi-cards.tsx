"use client"

import { useEffect, useState, useRef } from "react"
import { Target, Crosshair, Flame, Swords } from "lucide-react"
import { cn } from "@/lib/utils"

interface KPICard {
  label: string
  value: number
  suffix: string
  delta: string
  deltaPositive: boolean
  icon: React.ElementType
  description: string
  progress: number
  warning?: boolean
  success?: boolean
  tooltip: string
}

const kpis: KPICard[] = [
  {
    label: "Win Rate",
    value: 58,
    suffix: "%",
    delta: "+6.2% in last 30d",
    deltaPositive: true,
    icon: Target,
    description: "Percentage of won matches",
    progress: 58,
    tooltip: "Percentage of won matches among analyzed FACEIT games.",
  },
  {
    label: "Aim Score",
    value: 84,
    suffix: "",
    delta: "+4 since baseline",
    deltaPositive: true,
    icon: Crosshair,
    description: "Duel, HS, damage impact",
    progress: 84,
    success: true,
    tooltip: "Combined score based on opening duels, headshot rate, damage impact, and duel conversion.",
  },
  {
    label: "Utility Score",
    value: 71,
    suffix: "",
    delta: "2 weak maps detected",
    deltaPositive: false,
    icon: Flame,
    description: "Flash, smokes, molotovs",
    progress: 71,
    warning: true,
    tooltip: "Calculated from flash assists, smoke value, molotov damage/denial, and utility timing.",
  },
  {
    label: "Clutch Index",
    value: 42,
    suffix: "%",
    delta: "+9% last week",
    deltaPositive: true,
    icon: Swords,
    description: "1vX success rate",
    progress: 42,
    tooltip: "Success rate in 1vX situations and late-round impact.",
  },
]

function useCountUp(target: number, duration = 1400) {
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

function KPICard({ card, delay }: { card: KPICard; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const displayValue = useCountUp(visible ? card.value : 0)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  const borderStyle = card.warning
    ? "1px solid rgba(251,191,36,0.35)"
    : card.success
    ? "1px solid rgba(34,197,94,0.25)"
    : "1px solid rgba(255,255,255,0.07)"

  const glowStyle = card.success && hovered
    ? "0 0 20px rgba(34,197,94,0.12), 0 8px 32px rgba(0,0,0,0.4)"
    : hovered
    ? "0 0 20px rgba(124,58,237,0.12), 0 8px 32px rgba(0,0,0,0.4)"
    : "0 4px 24px rgba(0,0,0,0.3)"

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 cursor-default"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: borderStyle,
        boxShadow: glowStyle,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={card.tooltip}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
          {card.label}
        </span>
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <card.icon className="h-3.5 w-3.5 text-violet-400" strokeWidth={1.8} />
        </div>
      </div>

      {/* Value */}
      <div>
        <span className="font-display text-4xl font-black text-white tabular-nums leading-none">
          {displayValue}
        </span>
        <span className="font-display text-2xl font-black text-white/60 ml-0.5">{card.suffix}</span>
      </div>

      {/* Delta */}
      <span
        className={cn(
          "text-[11px] font-semibold",
          card.deltaPositive ? "text-emerald-400" : "text-amber-400"
        )}
      >
        {card.deltaPositive ? "↑" : "↓"} {card.delta}
      </span>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: visible ? `${card.progress}%` : "0%",
            background: card.warning
              ? "linear-gradient(90deg, #F59E0B, #FCD34D)"
              : card.success
              ? "linear-gradient(90deg, #10B981, #34D399)"
              : "linear-gradient(90deg, #7C3AED, #22D3EE)",
            transitionDelay: `${delay + 300}ms`,
          }}
        />
      </div>
    </div>
  )
}

export function KpiCards() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {kpis.map((card, i) => (
        <KPICard key={card.label} card={card} delay={i * 100} />
      ))}
    </div>
  )
}
