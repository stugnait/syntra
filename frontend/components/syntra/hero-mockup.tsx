'use client'

import { useEffect, useRef } from 'react'
import { Wifi, BrainCircuit, TrendingUp } from 'lucide-react'

function MiniHeatmap() {
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

    // Map room shapes
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'
    ctx.lineWidth = 0.8
    ctx.fillStyle = 'rgba(255,255,255,0.035)'
    const rooms = [
      [2, 2, 46, 26], [48, 2, 28, 26], [76, 2, 42, 13],
      [76, 15, 42, 13], [2, 28, 30, 32], [32, 28, 44, 32],
      [76, 28, 42, 32], [2, 60, 44, 30], [46, 60, 72, 30],
    ]
    rooms.forEach(([x, y, w, h]) => {
      ctx.fillRect(x, y, w, h)
      ctx.strokeRect(x, y, w, h)
    })

    // Heat blobs
    const blobs: [number, number, number, number, number[]][] = [
      [55, 10, 22, 0.82, [239, 68, 68]],
      [90, 22, 17, 0.68, [239, 68, 68]],
      [18, 40, 16, 0.58, [251, 146, 60]],
      [64, 46, 13, 0.48, [251, 146, 60]],
      [98, 50, 16, 0.62, [239, 68, 68]],
      [80, 74, 20, 0.78, [239, 68, 68]],
      [20, 70, 12, 0.38, [34, 197, 94]],
    ]
    blobs.forEach(([x, y, r, intensity, color]) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${color.join(',')},${intensity})`)
      g.addColorStop(0.45, `rgba(${color.join(',')},${(intensity as number) * 0.55})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={92}
      className="w-full rounded-lg"
      aria-label="Kill-zone heatmap"
    />
  )
}

const RECENT_MATCHES = [
  { map: 'Mirage', result: 'W', score: '13–9', grade: 'A', elo: '+23' },
  { map: 'Inferno', result: 'L', score: '8–13', grade: 'B+', elo: '−14' },
  { map: 'Nuke', result: 'W', score: '13–6', grade: 'A+', elo: '+27' },
]

export function HeroMockup() {
  return (
    <div className="relative flex items-center justify-center w-full">
      {/* Rotating ring layers */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="w-[580px] h-[580px] rounded-full border border-violet-500/8 animate-radar" />
        <div className="absolute w-[460px] h-[460px] rounded-full border border-violet-500/12 animate-radar-reverse" />
        <div className="absolute w-[340px] h-[340px] rounded-full border border-cyan-400/8" />
        {/* Radial glow */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
        />
      </div>

      {/* Dashboard card */}
      <div className="relative z-10 w-full max-w-[560px] rounded-2xl overflow-hidden border border-white/8 bg-[#0C0C1B]/92 backdrop-blur-sm shadow-[0_0_80px_rgba(124,58,237,0.18),0_32px_64px_rgba(0,0,0,0.6)] animate-float">
        {/* Window chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#111127] border-b border-white/6">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
            </div>
            <span className="text-[11px] text-white/35 font-mono">syntra.gg/dashboard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400/80 font-mono tracking-wider">LIVE</span>
          </div>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Player row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-800 flex items-center justify-center text-white font-bold text-xs font-display">
                NS
              </div>
              <div>
                <div className="text-white font-semibold text-sm font-display">NightStalker</div>
                <div className="text-[11px] text-violet-400 font-mono">Lvl 9 · 2,847 ELO</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/35 font-mono uppercase tracking-wide">Last sync</div>
              <div className="text-[11px] text-white/60 font-mono">2 min ago</div>
            </div>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Aim Score', value: '87.4', delta: '+3.2', color: 'violet' },
              { label: 'Utility Eff.', value: '74.1', delta: '+1.8', color: 'cyan' },
              { label: 'Win Rate', value: '68%', delta: '+5%', color: 'emerald' },
            ].map(({ label, value, delta, color }) => (
              <div
                key={label}
                className="bg-[#0A0A18] rounded-xl p-2.5 border border-white/6"
              >
                <div className="text-[9px] text-white/40 font-mono uppercase tracking-wider mb-1">{label}</div>
                <div className={`text-lg font-bold font-display ${color === 'violet' ? 'text-violet-300' : color === 'cyan' ? 'text-cyan-300' : 'text-emerald-300'}`}>
                  {value}
                </div>
                <div className={`text-[10px] font-mono ${color === 'violet' ? 'text-violet-400/70' : color === 'cyan' ? 'text-cyan-400/70' : 'text-emerald-400/70'}`}>
                  {delta}
                </div>
              </div>
            ))}
          </div>

          {/* Heatmap + AI row */}
          <div className="grid grid-cols-5 gap-2.5">
            <div className="col-span-3 bg-[#0A0A18] rounded-xl p-2.5 border border-white/6">
              <div className="text-[9px] text-white/35 font-mono uppercase tracking-wider mb-1.5">Mirage · Kill Zones</div>
              <MiniHeatmap />
            </div>
            <div className="col-span-2 bg-[#0A0A18] rounded-xl p-2.5 border border-white/6">
              <div className="flex items-center gap-1 mb-2">
                <BrainCircuit size={10} className="text-violet-400" />
                <span className="text-[9px] text-white/35 font-mono uppercase tracking-wider">AI Insights</span>
              </div>
              <ul className="space-y-1.5">
                {['Pistol rounds', 'Entry timing', 'A-site utility', 'Clutch rate'].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-violet-400/70 shrink-0" />
                    <span className="text-[10px] text-white/55 leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent matches */}
          <div className="bg-[#0A0A18] rounded-xl p-2.5 border border-white/6">
            <div className="flex items-center gap-1 mb-2">
              <TrendingUp size={10} className="text-white/35" />
              <span className="text-[9px] text-white/35 font-mono uppercase tracking-wider">Recent Matches</span>
            </div>
            <div className="space-y-1.5">
              {RECENT_MATCHES.map((m) => (
                <div key={m.map} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold font-display ${m.result === 'W' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.result}
                    </span>
                    <span className="text-white/65">{m.map}</span>
                    <span className="text-white/30 font-mono">{m.score}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-violet-400 font-display font-semibold">{m.grade}</span>
                    <span className={`font-mono ${m.result === 'W' ? 'text-emerald-400/65' : 'text-red-400/65'}`}>
                      {m.elo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div
        className="absolute -right-4 lg:-right-10 top-16 z-20 bg-[#0C0C1B] border rounded-xl px-3 py-2 shadow-[0_0_24px_rgba(124,58,237,0.25)]"
        style={{ borderColor: 'rgba(124,58,237,0.35)' }}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <BrainCircuit size={10} className="text-violet-400" />
          <span className="text-[9px] text-violet-400 font-mono uppercase tracking-wider">AI Active</span>
        </div>
        <div className="text-white font-semibold text-sm font-display">Analyzing…</div>
      </div>

      <div
        className="absolute -left-4 lg:-left-10 bottom-20 z-20 bg-[#0C0C1B] border rounded-xl px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.2)]"
        style={{ borderColor: 'rgba(34,211,238,0.3)' }}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <Wifi size={10} className="text-cyan-400" />
          <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider">FACEIT Sync</span>
        </div>
        <div className="text-white font-semibold text-sm font-display">Real-time</div>
      </div>
    </div>
  )
}
