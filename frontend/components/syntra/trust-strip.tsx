'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { Database, BarChart3, Zap, Bot } from 'lucide-react'

const STATS = [
  { icon: Database, label: 'Demo Rounds Processed', target: 10000, suffix: '+', prefix: '' },
  { icon: BarChart3, label: 'Tactical Metrics', target: 25, suffix: '+', prefix: '' },
  { icon: Zap, label: 'FACEIT Auto Sync', target: 100, suffix: '%', prefix: '' },
  { icon: Bot, label: 'AI Match Accuracy', target: 94, suffix: '%', prefix: '' },
]

function CountUp({ target, suffix, prefix, started }: { target: number; suffix: string; prefix: string; started: boolean }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!started) return
    const duration = 1800
    const steps = 60
    const increment = target / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, target)
      setValue(Math.round(current))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target])

  return (
    <span>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}

export function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="relative z-10 py-12 border-y border-white/5">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.04) 0%, rgba(34,211,238,0.02) 50%, rgba(124,58,237,0.04) 100%)' }}
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, label, target, suffix, prefix }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 text-center p-4"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-1">
                <Icon size={18} className="text-violet-400" />
              </div>
              <div className="text-3xl font-bold font-display text-white">
                <CountUp target={target} suffix={suffix} prefix={prefix} started={inView} />
              </div>
              <div className="text-[12px] text-white/45 font-mono tracking-wide uppercase text-balance">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
