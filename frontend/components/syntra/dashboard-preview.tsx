import { BrainCircuit, Target, Zap, AlertTriangle, Wifi, BarChart3 } from 'lucide-react'

const FLOATING_LABELS = [
  { icon: Target, label: 'Aim Score', value: '87.4', color: 'violet', pos: '-left-4 top-20' },
  { icon: Zap, label: 'Utility Score', value: '74.1', color: 'cyan', pos: '-right-4 top-28' },
  { icon: AlertTriangle, label: 'Weakness', value: 'Pistol', color: 'amber', pos: '-left-4 bottom-24' },
  { icon: Wifi, label: 'FACEIT Sync', value: 'Live', color: 'emerald', pos: '-right-4 bottom-20' },
]

const colorMap: Record<string, string> = {
  violet: 'border-violet-500/30 bg-violet-500/8 text-violet-300',
  cyan: 'border-cyan-500/30 bg-cyan-500/8 text-cyan-300',
  amber: 'border-amber-500/30 bg-amber-500/8 text-amber-300',
  emerald: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-300',
}
const iconColorMap: Record<string, string> = {
  violet: 'text-violet-400', cyan: 'text-cyan-400', amber: 'text-amber-400', emerald: 'text-emerald-400',
}

export function DashboardPreview() {
  return (
    <section className="relative z-10 py-24 lg:py-32 overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(124,58,237,0.05), transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-violet-500/50" />
            <span className="text-[11px] text-violet-400 font-mono tracking-[0.15em] uppercase">Dashboard</span>
            <div className="h-px w-8 bg-violet-500/50" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white text-balance">
            Your Tactical{' '}
            <span className="text-gradient-violet">Command Center</span>
          </h2>
          <p className="text-white/45 text-base mt-4 max-w-xl mx-auto leading-relaxed">
            Everything you need to understand your performance — all in one place, always in sync.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative mx-auto max-w-5xl">
          {/* Floating labels */}
          {FLOATING_LABELS.map(({ icon: Icon, label, value, color, pos }) => (
            <div
              key={label}
              className={`hidden lg:flex absolute z-20 items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-sm shadow-lg ${colorMap[color]} ${pos}`}
            >
              <Icon size={14} className={iconColorMap[color]} />
              <div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{label}</div>
                <div className="font-display font-bold text-white text-sm">{value}</div>
              </div>
            </div>
          ))}

          {/* Main dashboard panel */}
          <div className="rounded-2xl border border-white/8 bg-[#0C0C1B]/95 overflow-hidden shadow-[0_0_120px_rgba(124,58,237,0.12),0_40px_80px_rgba(0,0,0,0.5)]">
            {/* Chrome bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#111127] border-b border-white/6">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                </div>
                <span className="text-[11px] text-white/30 font-mono">syntra.gg/dashboard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400/70 font-mono">FACEIT SYNCED</span>
              </div>
            </div>

            {/* Sidebar + content layout */}
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden lg:flex flex-col w-48 border-r border-white/5 p-4 gap-1 shrink-0">
                {[
                  { icon: BarChart3, label: 'Overview', active: true },
                  { icon: Target, label: 'Aim Lab' },
                  { icon: BrainCircuit, label: 'AI Reports' },
                  { icon: Zap, label: 'Utility' },
                ].map(({ icon: Icon, label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium cursor-default ${
                      active
                        ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                        : 'text-white/40 hover:text-white/60'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-5 min-h-0">
                {/* Top KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'FACEIT Level', value: '9', sub: 'Level 10 in reach', color: 'violet' },
                    { label: 'Aim Score', value: '87.4', sub: '↑ 3.2 this week', color: 'cyan' },
                    { label: 'K/D Ratio', value: '1.42', sub: 'Above avg', color: 'emerald' },
                    { label: 'Win Rate', value: '68%', sub: 'Last 20 matches', color: 'amber' },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="bg-[#080814] rounded-xl p-3.5 border border-white/5">
                      <div className="text-[9px] text-white/35 font-mono uppercase tracking-wider mb-1.5">{label}</div>
                      <div className={`text-2xl font-bold font-display ${iconColorMap[color]}`}>{value}</div>
                      <div className="text-[10px] text-white/35 font-mono mt-1">{sub}</div>
                    </div>
                  ))}
                </div>

                {/* Chart rows */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {/* Performance radar placeholder */}
                  <div className="col-span-1 bg-[#080814] rounded-xl border border-white/5 p-3.5">
                    <div className="text-[9px] text-white/35 font-mono uppercase tracking-wider mb-3">Skill Radar</div>
                    <div className="flex items-center justify-center">
                      <svg viewBox="0 0 80 80" width={80} height={80} aria-label="Skill radar chart">
                        {[1, 2, 3].map((r) => (
                          <polygon
                            key={r}
                            points={`40,${40 - r * 12} ${40 + r * 10.4},${40 + r * 6} ${40 - r * 10.4},${40 + r * 6}`}
                            fill="none"
                            stroke="rgba(255,255,255,0.07)"
                            strokeWidth="0.5"
                          />
                        ))}
                        <polygon
                          points="40,14 53,35 46,55 34,55 27,35"
                          fill="rgba(124,58,237,0.2)"
                          stroke="rgba(124,58,237,0.6)"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Recent matches */}
                  <div className="col-span-2 bg-[#080814] rounded-xl border border-white/5 p-3.5">
                    <div className="text-[9px] text-white/35 font-mono uppercase tracking-wider mb-3">Recent Matches</div>
                    <div className="space-y-2">
                      {[
                        { map: 'Mirage', result: 'W', score: '13–9', grade: 'A', elo: '+23' },
                        { map: 'Inferno', result: 'L', score: '8–13', grade: 'B+', elo: '−14' },
                        { map: 'Nuke', result: 'W', score: '13–6', grade: 'A+', elo: '+27' },
                        { map: 'Overpass', result: 'W', score: '13–11', grade: 'A−', elo: '+18' },
                      ].map((m) => (
                        <div key={`${m.map}${m.elo}`} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2.5">
                            <span className={`font-bold font-display text-xs ${m.result === 'W' ? 'text-emerald-400' : 'text-red-400'}`}>{m.result}</span>
                            <span className="text-white/60">{m.map}</span>
                            <span className="text-white/25 font-mono">{m.score}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-violet-400 font-semibold font-display">{m.grade}</span>
                            <span className={`font-mono text-[10px] ${m.result === 'W' ? 'text-emerald-400/60' : 'text-red-400/60'}`}>{m.elo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI panel */}
                <div className="bg-[#080814] rounded-xl border border-violet-500/15 p-3.5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <BrainCircuit size={12} className="text-violet-400" />
                    <span className="text-[9px] text-violet-400 font-mono uppercase tracking-wider">Latest AI Findings</span>
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Weak pistol rounds', sev: 'high' },
                      { label: 'Improve A-site timing', sev: 'med' },
                      { label: 'Strong rifle duels', sev: 'good' },
                    ].map(({ label, sev }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full shrink-0 ${sev === 'high' ? 'bg-red-400' : sev === 'med' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-[10px] text-white/50 leading-tight">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle border glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)' }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
