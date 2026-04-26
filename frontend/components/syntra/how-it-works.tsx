import { Link2, CloudDownload, BrainCircuit } from 'lucide-react'

const STEPS = [
  {
    icon: Link2,
    step: '01',
    title: 'Connect Your Accounts',
    desc: 'Sync your Steam and FACEIT profile in one click. SYNTRA handles all OAuth authentication securely — no passwords stored.',
    highlight: 'One-click setup',
    color: 'violet',
  },
  {
    icon: CloudDownload,
    step: '02',
    title: 'We Process Every Match',
    desc: 'SYNTRA detects new games automatically, downloads demo recordings, and extracts full gameplay telemetry — kills, deaths, grenades, positioning.',
    highlight: 'Fully automated',
    color: 'cyan',
  },
  {
    icon: BrainCircuit,
    step: '03',
    title: 'Receive Tactical Reports',
    desc: 'Get AI-generated analytics, weak-point detection, heatmap visualizations, and personalized performance recommendations after every match.',
    highlight: 'AI-generated',
    color: 'violet',
  },
]

export function HowItWorks() {
  return (
    <section id="features" className="relative z-10 py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-violet-500/50" />
            <span className="text-[11px] text-violet-400 font-mono tracking-[0.15em] uppercase">How it works</span>
            <div className="h-px w-8 bg-violet-500/50" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white text-balance">
            Tactical Analysis in{' '}
            <span className="text-gradient-violet">3 Automated Steps</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ icon: Icon, step, title, desc, highlight, color }, i) => (
            <div
              key={step}
              className="group relative rounded-2xl border border-white/7 bg-[#0C0C1B] p-7 transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/25 hover:shadow-[0_20px_60px_rgba(124,58,237,0.12)]"
            >
              {/* Step connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-1/2 -right-3 w-6 h-px z-10"
                  style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.3), transparent)' }}
                  aria-hidden="true"
                />
              )}

              {/* Step number */}
              <div className="text-[11px] text-white/20 font-mono tracking-widest mb-4">{step}</div>

              {/* Icon */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-xl mb-5 border ${
                  color === 'cyan'
                    ? 'bg-cyan-500/10 border-cyan-500/20'
                    : 'bg-violet-500/10 border-violet-500/20'
                }`}
              >
                <Icon
                  size={22}
                  className={color === 'cyan' ? 'text-cyan-400' : 'text-violet-400'}
                />
              </div>

              {/* Highlight tag */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold mb-3 ${
                  color === 'cyan'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                }`}
              >
                <div
                  className={`w-1 h-1 rounded-full ${color === 'cyan' ? 'bg-cyan-400' : 'bg-violet-400'} animate-pulse`}
                />
                {highlight}
              </div>

              <h3 className="font-display text-xl font-semibold text-white mb-3">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>

              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(circle at 50% 0%, rgba(124,58,237,0.06), transparent 70%)' }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
