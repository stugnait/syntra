import { Target, MapPin, Zap, Swords, TrendingUp, BrainCircuit } from 'lucide-react'

// Micro visual art for each feature card
function MatchViz() {
  const stats = [
    { label: 'K', value: 24, pct: 80 },
    { label: 'D', value: 14, pct: 47 },
    { label: 'A', value: 8, pct: 27 },
  ]
  return (
    <div className="space-y-2">
      {stats.map(({ label, value, pct }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-[9px] text-white/40 font-mono w-3">{label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-white/60 font-mono w-4 text-right">{value}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[9px] text-white/40 font-mono">HS%</span>
        <span className="text-xs text-cyan-400 font-bold font-display ml-auto">61%</span>
      </div>
    </div>
  )
}

function HeatmapViz() {
  const grid = Array.from({ length: 5 * 4 }, (_, i) => {
    const vals = [0, 1, 3, 5, 4, 2, 8, 6, 9, 7, 5, 3, 2, 6, 9, 8, 4, 2, 1, 3]
    return vals[i % vals.length]
  })
  return (
    <div className="grid grid-cols-5 gap-0.5">
      {grid.map((v, i) => (
        <div
          key={i}
          className="h-4 rounded-sm"
          style={{ background: v > 6 ? 'rgba(239,68,68,0.75)' : v > 3 ? 'rgba(251,146,60,0.6)' : v > 1 ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.05)' }}
        />
      ))}
    </div>
  )
}

function UtilityViz() {
  const items = [
    { label: 'Flash', pct: 78, color: '#22D3EE' },
    { label: 'Smoke', pct: 62, color: '#8B5CF6' },
    { label: 'HE', pct: 45, color: '#F59E0B' },
    { label: 'Molly', pct: 31, color: '#EF4444' },
  ]
  return (
    <div className="space-y-1.5">
      {items.map(({ label, pct, color }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-[9px] text-white/40 font-mono w-9">{label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className="text-[9px] font-mono w-6 text-right" style={{ color }}>{pct}%</span>
        </div>
      ))}
    </div>
  )
}

function DuelViz() {
  const duels = [
    { enemy: 'vs AWPer', w: 4, l: 1 },
    { enemy: 'vs Rifler', w: 8, l: 3 },
    { enemy: 'vs Lurker', w: 2, l: 4 },
  ]
  return (
    <div className="space-y-2">
      {duels.map(({ enemy, w, l }) => {
        const total = w + l
        const wPct = (w / total) * 100
        return (
          <div key={enemy}>
            <div className="flex justify-between text-[9px] mb-0.5">
              <span className="text-white/40 font-mono">{enemy}</span>
              <span className="text-emerald-400 font-mono">{Math.round(wPct)}%</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden gap-px">
              <div className="bg-emerald-400/70 rounded-l-full" style={{ width: `${wPct}%` }} />
              <div className="bg-red-400/60 rounded-r-full" style={{ width: `${100 - wPct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProgressViz() {
  const points = [1880, 1920, 1900, 1960, 2010, 1990, 2050, 2100, 2080, 2150, 2130, 2200]
  const max = Math.max(...points)
  const min = Math.min(...points)
  const h = 40
  const w = 110
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w
    const y = h - ((v - min) / (max - min)) * h
    return `${x},${y}`
  })
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 44 }} aria-label="ELO progress chart">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between text-[9px] font-mono mt-1">
        <span className="text-white/30">30d ago</span>
        <span className="text-emerald-400">+320 ELO</span>
        <span className="text-white/30">Today</span>
      </div>
    </div>
  )
}

function AICoachViz() {
  const items = [
    { type: 'weak', text: 'Pistol round survivability', severity: 'high' },
    { type: 'tip', text: 'Push timings on Mirage A', severity: 'med' },
    { type: 'strong', text: 'Mid control superiority', severity: 'good' },
  ]
  const colors = { high: 'text-red-400', med: 'text-amber-400', good: 'text-emerald-400' }
  const dots = { high: 'bg-red-400', med: 'bg-amber-400', good: 'bg-emerald-400' }
  return (
    <div className="space-y-2">
      {items.map(({ text, severity }) => (
        <div key={text} className="flex items-start gap-2">
          <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${dots[severity as keyof typeof dots]}`} />
          <span className={`text-[10px] leading-tight ${colors[severity as keyof typeof colors]}`}>{text}</span>
        </div>
      ))}
    </div>
  )
}

const FEATURES = [
  {
    icon: Target,
    title: 'Match Intelligence',
    desc: 'Deep per-match breakdown of every KDA, HS%, KAST, and impact rating.',
    viz: <MatchViz />,
    accentColor: 'violet',
  },
  {
    icon: MapPin,
    title: 'Heatmap Visualization',
    desc: 'See exactly where you die and kill across every map with kill-zone overlays.',
    viz: <HeatmapViz />,
    accentColor: 'cyan',
  },
  {
    icon: Zap,
    title: 'Utility Efficiency',
    desc: 'Track flash hit rates, smoke accuracy, and grenade damage per round.',
    viz: <UtilityViz />,
    accentColor: 'amber',
  },
  {
    icon: Swords,
    title: 'Duel Breakdown',
    desc: 'Win rate against specific archetypes — AWPers, lurkers, entry fraggers.',
    viz: <DuelViz />,
    accentColor: 'red',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    desc: 'Long-term ELO, rating curves, and skill trajectory over 30, 60, 90 days.',
    viz: <ProgressViz />,
    accentColor: 'emerald',
  },
  {
    icon: BrainCircuit,
    title: 'AI Coaching',
    desc: 'Personalized recommendations generated by AI after every single match.',
    viz: <AICoachViz />,
    accentColor: 'violet',
  },
]

const accentMap: Record<string, string> = {
  violet: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
  cyan: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
  amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  red: 'border-red-500/20 bg-red-500/10 text-red-400',
  emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
}

export function FeatureGrid() {
  return (
    <section id="analytics" className="relative z-10 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-violet-500/50" />
            <span className="text-[11px] text-violet-400 font-mono tracking-[0.15em] uppercase">Feature Modules</span>
            <div className="h-px w-8 bg-violet-500/50" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white text-balance">
            Everything You Need to{' '}
            <span className="text-gradient-violet">Dominate</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, viz, accentColor }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/7 bg-[#0C0C1B] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-500/20 hover:shadow-[0_16px_48px_rgba(124,58,237,0.10)]"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl border shrink-0 ${accentMap[accentColor]}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-base mb-1">{title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>

              {/* Mini visualization */}
              <div className="rounded-xl bg-[#080814] border border-white/5 p-3">{viz}</div>

              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.05), transparent 60%)' }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
