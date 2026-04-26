'use client'

import { useEffect, useRef } from 'react'
import { BrainCircuit, AlertTriangle, TrendingUp, Lightbulb, ShieldAlert } from 'lucide-react'

function LargeHeatmap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height

    ctx.fillStyle = '#080814'
    ctx.fillRect(0, 0, W, H)

    // Map layout — Mirage-like
    ctx.lineWidth = 0.8
    const rooms = [
      { rect: [4, 4, 90, 54], fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.10)' },
      { rect: [94, 4, 60, 54], fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.10)' },
      { rect: [154, 4, 90, 24], fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.10)' },
      { rect: [154, 28, 90, 30], fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.10)' },
      { rect: [4, 58, 62, 64], fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.10)' },
      { rect: [66, 58, 92, 64], fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.10)' },
      { rect: [158, 58, 86, 64], fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.10)' },
      { rect: [4, 122, 90, 58], fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.10)' },
      { rect: [94, 122, 150, 58], fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(255,255,255,0.10)' },
    ]
    rooms.forEach(({ rect: [x, y, w, h], fill, stroke }) => {
      ctx.fillStyle = fill
      ctx.strokeStyle = stroke
      ctx.fillRect(x, y, w, h)
      ctx.strokeRect(x, y, w, h)
    })

    // Map labels
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.font = '7px monospace'
    ctx.fillText('A SITE', 8, 14)
    ctx.fillText('MID', 96, 14)
    ctx.fillText('A SHORT', 156, 14)
    ctx.fillText('B APPS', 160, 42)
    ctx.fillText('TUNNELS', 8, 70)
    ctx.fillText('B SITE', 100, 70)
    ctx.fillText('B PLAT', 162, 70)
    ctx.fillText('CT SPAWN', 8, 132)

    // Heat points
    const heat: [number, number, number, number, number[]][] = [
      [118, 24, 40, 0.88, [239, 68, 68]],
      [178, 30, 32, 0.72, [239, 68, 68]],
      [34, 76, 28, 0.55, [251, 146, 60]],
      [120, 82, 36, 0.82, [239, 68, 68]],
      [190, 76, 30, 0.64, [239, 68, 68]],
      [64, 20, 22, 0.45, [251, 146, 60]],
      [155, 145, 38, 0.78, [239, 68, 68]],
      [34, 140, 20, 0.38, [34, 197, 94]],
    ]

    heat.forEach(([x, y, r, intensity, color]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${color.join(',')}, ${intensity})`)
      g.addColorStop(0.4, `rgba(${color.join(',')}, ${(intensity as number) * 0.5})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    })

    // Legend
    const legend = [
      { color: [239, 68, 68], label: 'High death zone' },
      { color: [251, 146, 60], label: 'Medium activity' },
      { color: [34, 197, 94], label: 'Safe zone' },
    ]
    legend.forEach(({ color, label }, i) => {
      ctx.fillStyle = `rgba(${color.join(',')}, 0.8)`
      ctx.beginPath()
      ctx.arc(12, 194 + i * 14, 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.font = '7px monospace'
      ctx.fillText(label, 20, 197 + i * 14)
    })
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={248}
      height={184}
      className="w-full h-auto rounded-xl"
      aria-label="Detailed kill-zone heatmap for Mirage"
    />
  )
}

const AI_FINDINGS = [
  {
    icon: AlertTriangle,
    type: 'critical',
    title: 'Pistol Round Weakness',
    detail:
      'You lose 71% of pistol rounds as T-side. Your eco-save percentage is 14% — far below the 35% pro average.',
    color: 'red',
  },
  {
    icon: ShieldAlert,
    type: 'warning',
    title: 'A-Site Entry Timing',
    detail:
      'Your A-site pushes peak 4.2s after round start — 1.8s slower than top-ELO players. Enemies pre-position against you.',
    color: 'amber',
  },
  {
    icon: Lightbulb,
    type: 'suggestion',
    title: 'Smoke Utility Opportunity',
    detail:
      'You throw CT and Jungle smokes only 32% of A-hits. Consistent smokes would reduce your death count by an estimated 3–5 per match.',
    color: 'cyan',
  },
  {
    icon: TrendingUp,
    type: 'strength',
    title: 'Superior Mid Control',
    detail:
      'Your mid control rate is 78% — in the top 12% of your ELO bracket. This is your strongest tactical pattern.',
    color: 'emerald',
  },
]

const bgMap: Record<string, string> = {
  red: 'bg-red-500/8 border-red-500/20',
  amber: 'bg-amber-500/8 border-amber-500/20',
  cyan: 'bg-cyan-500/8 border-cyan-500/20',
  emerald: 'bg-emerald-500/8 border-emerald-500/20',
}
const textMap: Record<string, string> = {
  red: 'text-red-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  emerald: 'text-emerald-400',
}

export function AIReportPreview() {
  return (
    <section className="relative z-10 py-24 lg:py-32">
      {/* Glow blob */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(124,58,237,0.04), transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-violet-500/50" />
            <span className="text-[11px] text-violet-400 font-mono tracking-[0.15em] uppercase">AI Report</span>
            <div className="h-px w-8 bg-violet-500/50" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white text-balance max-w-2xl mx-auto">
            SYNTRA doesn&apos;t just show stats —{' '}
            <span className="text-gradient-violet">it tells you why you lose.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left — AI findings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <BrainCircuit size={16} className="text-violet-400" />
              <span className="text-sm font-semibold text-white font-display">AI Analysis — Mirage, Match #1,847</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[10px] text-violet-400 font-mono">GENERATED</span>
              </div>
            </div>

            {AI_FINDINGS.map(({ icon: Icon, title, detail, color }) => (
              <div
                key={title}
                className={`rounded-2xl border p-5 ${bgMap[color]}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 shrink-0 ${textMap[color]}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className={`font-display font-semibold text-sm mb-1.5 ${textMap[color]}`}>{title}</div>
                    <p className="text-white/55 text-sm leading-relaxed">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — heatmap */}
          <div>
            <div className="rounded-2xl border border-white/8 bg-[#0C0C1B] p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-white/35 font-mono uppercase tracking-wider">Kill-Zone Heatmap</div>
                  <div className="font-display font-semibold text-white text-sm mt-0.5">Mirage — Last 20 Matches</div>
                </div>
                <div className="flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2.5 py-1">
                  <div className="w-1 h-1 rounded-full bg-violet-400" />
                  <span className="text-[9px] text-violet-400 font-mono uppercase">Live</span>
                </div>
              </div>
              <LargeHeatmap />
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Deaths', value: '124', color: 'text-red-400' },
                  { label: 'Hot Zones', value: '5', color: 'text-amber-400' },
                  { label: 'Safe Exits', value: '38%', color: 'text-emerald-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#080814] rounded-xl p-2.5 text-center border border-white/5">
                    <div className={`text-lg font-bold font-display ${color}`}>{value}</div>
                    <div className="text-[9px] text-white/35 font-mono uppercase tracking-wider mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
