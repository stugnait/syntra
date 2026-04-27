'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedBg } from '@/components/syntra/animated-bg'
import { SyntraLogo } from '@/components/syntra/logo'
import { BrainCircuit, ChevronRight, Target, Zap, AlertTriangle, MapPin } from 'lucide-react'

// ─── Step 1: Welcome Scan ──────────────────────────────────────────
function StepWelcome({ onNext, playerName }: { onNext: () => void; playerName: string }) {
  const [scanPct, setScanPct] = useState(0)

  useEffect(() => {
    const durationMs = 2200
    const start = performance.now()
    let frameId = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min((elapsed / durationMs) * 100, 100)
      setScanPct(progress)

      if (progress < 100) {
        frameId = window.requestAnimationFrame(tick)
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  const done = scanPct >= 100

  return (
    <div className="flex flex-col items-center gap-8 text-center animate-slide-up">
      {/* Scan ring */}
      <div className="relative flex items-center justify-center">
        {/* Outer rings */}
        <div className="absolute w-64 h-64 rounded-full border border-violet-500/10 animate-radar" />
        <div className="absolute w-52 h-52 rounded-full border border-violet-500/15 animate-radar-reverse" />
        {/* Scan progress ring */}
        <svg className="absolute w-64 h-64 -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="1" />
          <circle
            cx="100" cy="100" r="96"
            fill="none"
            stroke="url(#scanGrad)"
            strokeWidth="1.5"
            strokeDasharray={`${2 * Math.PI * 96}`}
            strokeDashoffset={`${2 * Math.PI * 96 * (1 - scanPct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
        </svg>
        {/* Avatar */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-purple-900 border-2 border-violet-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)]">
          <span className="font-display text-4xl font-bold text-white">NS</span>
          {done && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#07070F] flex items-center justify-center">
              <svg viewBox="0 0 12 12" width="12" height="12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
        {/* Scanner line */}
        {!done && (
          <div
            className="absolute left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"
            style={{ top: `${scanPct}%`, transition: 'top 0.05s linear' }}
            aria-hidden="true"
          />
        )}
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Welcome, <span className="text-gradient-violet">{playerName}</span>
        </h1>
        <p className="text-white/45 text-sm font-mono">
          {done ? 'Profile scan complete. Ready to proceed.' : `Initializing your competitive profile… ${Math.round(scanPct)}%`}
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!done}
        className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
          done
            ? 'bg-violet-600 hover:bg-violet-500 text-white glow-violet-sm hover:glow-violet'
            : 'bg-white/5 text-white/25 cursor-not-allowed border border-white/8'
        }`}
      >
        Continue
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─── Step 2: Connect FACEIT ────────────────────────────────────────
function FaceitIcon() {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor" aria-hidden="true">
      <path d="M2 2h9v9H2V2zm11 0h9v9h-9V2zm0 11h9v9h-9v-9zm-11 0h9v9H2v-9z" />
    </svg>
  )
}

function StepConnectFaceit({ onSkip }: { onSkip: () => void }) {
  const handleConnect = () => {
    window.location.href = '/api/auth/faceit/start?popup=0'
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center animate-slide-up max-w-sm">
      {/* FACEIT badge */}
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-violet-600/15 border border-violet-500/25 shadow-[0_0_40px_rgba(124,58,237,0.2)]">
        <FaceitIcon />
      </div>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-mono uppercase tracking-widest mb-4">
          <div className="w-1 h-1 rounded-full bg-violet-400" />
          Recommended
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">
          Connect Your FACEIT Account
        </h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Connect your FACEIT account to enable automatic match imports, demo retrieval,
          and advanced tactical analysis. Unlock the full power of SYNTRA.
        </p>
      </div>

      {/* Feature list */}
      <div className="w-full rounded-2xl border border-white/7 bg-[#0C0C1B] p-5 text-left space-y-3">
        {[
          { icon: Zap, text: 'Real-time match detection & auto-sync', color: 'text-violet-400' },
          { icon: Target, text: 'ELO tracking and FACEIT ranking trends', color: 'text-cyan-400' },
          { icon: BrainCircuit, text: 'AI coaching after every competitive match', color: 'text-emerald-400' },
        ].map(({ icon: Icon, text, color }) => (
          <div key={text} className="flex items-center gap-3">
            <div className={`shrink-0 ${color}`}>
              <Icon size={14} />
            </div>
            <span className="text-white/60 text-sm">{text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col w-full gap-3">
        <button
          onClick={handleConnect}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all duration-200 glow-violet-sm hover:glow-violet"
        >
          <FaceitIcon />
          Connect FACEIT
        </button>
        <button
          onClick={onSkip}
          className="text-white/30 hover:text-white/60 text-sm transition-colors duration-200"
        >
          {"I'll do this later — limited features"}
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Synchronization ───────────────────────────────────────
const SYNC_MESSAGES = [
  'Syncing account identity...',
  'Fetching recent FACEIT matches...',
  'Scanning available demos...',
  'Downloading gameplay resources...',
  'Building player baseline...',
  'Calculating tactical indicators...',
  'Generating first recommendations...',
]

function SyncCounter({ label, value }: { label: string; value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 2400
    const steps = 60
    const target = value
    let step = 0
    const inc = target / steps
    const interval = setInterval(() => {
      step++
      setDisplay((v) => Math.min(Math.round(v + inc), target))
      if (step >= steps) clearInterval(interval)
    }, duration / steps)
    return () => clearInterval(interval)
  }, [value])

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display font-bold text-white text-xl">{display.toLocaleString()}</span>
      <span className="text-white/35 text-[10px] font-mono uppercase tracking-wide">{label}</span>
    </div>
  )
}

function StepSync({ onDone }: { onDone: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const totalDuration = 5000
    const msgInterval = totalDuration / SYNC_MESSAGES.length
    const msgTimer = setInterval(() => {
      setMsgIdx((i) => {
        const next = i + 1
        if (next >= SYNC_MESSAGES.length) {
          clearInterval(msgTimer)
          return i
        }
        return next
      })
    }, msgInterval)

    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressTimer)
          setTimeout(() => setFinished(true), 400)
          return 100
        }
        return p + (100 / (totalDuration / 50))
      })
    }, 50)

    return () => {
      clearInterval(msgTimer)
      clearInterval(progressTimer)
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-10 text-center animate-slide-up w-full max-w-lg">
      {/* Circular processor */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-52 h-52 rounded-full border border-violet-500/8 animate-radar" />
        <div className="absolute w-40 h-40 rounded-full border border-cyan-500/10 animate-radar-reverse" />
        <svg className="absolute w-52 h-52 -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
          <circle cx="80" cy="80" r="76" fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="1.5" />
          <circle
            cx="80" cy="80" r="76"
            fill="none"
            stroke="url(#syncGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 76}`}
            strokeDashoffset={`${2 * Math.PI * 76 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
          <defs>
            <linearGradient id="syncGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
        </svg>

        <div className="relative w-28 h-28 rounded-full bg-[#0C0C1B] border border-violet-500/20 flex flex-col items-center justify-center gap-1">
          <BrainCircuit size={24} className="text-violet-400" />
          <span className="font-display font-bold text-white text-lg">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Current message */}
      <div className="h-6">
        <p className="text-violet-300 text-sm font-mono animate-fade-in" key={msgIdx}>
          {SYNC_MESSAGES[msgIdx]}
        </p>
      </div>

      {/* Live counters */}
      <div className="flex items-center gap-8 px-8 py-5 rounded-2xl border border-white/7 bg-[#0C0C1B]">
        <SyncCounter label="Matches found" value={24} />
        <div className="w-px h-8 bg-white/8" />
        <SyncCounter label="Demos linked" value={18} />
        <div className="w-px h-8 bg-white/8" />
        <SyncCounter label="Events extracted" value={1284233} />
      </div>

      {finished && (
        <button
          onClick={onDone}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all duration-200 glow-violet-sm hover:glow-violet animate-slide-up"
        >
          View Tactical Profile
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

// ─── Step 4: Baseline Summary ──────────────────────────────────────
const RADAR_POINTS = [
  { label: 'Aim', value: 0.87 },
  { label: 'Utility', value: 0.74 },
  { label: 'Positioning', value: 0.62 },
  { label: 'Clutch', value: 0.55 },
  { label: 'Entry', value: 0.71 },
]

function RadarChart() {
  const cx = 80
  const cy = 80
  const r = 60
  const n = RADAR_POINTS.length

  const getPoint = (i: number, ratio: number) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2
    return {
      x: cx + r * ratio * Math.cos(angle),
      y: cy + r * ratio * Math.sin(angle),
    }
  }

  const outerPoints = RADAR_POINTS.map((_, i) => getPoint(i, 1))
  const dataPoints = RADAR_POINTS.map((p, i) => getPoint(i, p.value))

  const toPolyStr = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44" aria-label="Skill radar chart">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={toPolyStr(RADAR_POINTS.map((_, i) => getPoint(i, ratio)))}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="0.5"
        />
      ))}
      {/* Spokes */}
      {outerPoints.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      ))}
      {/* Data polygon */}
      <polygon
        points={toPolyStr(dataPoints)}
        fill="rgba(124,58,237,0.22)"
        stroke="rgba(124,58,237,0.7)"
        strokeWidth="1.5"
      />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#9F67FF" />
      ))}
      {/* Labels */}
      {outerPoints.map((p, i) => {
        const lp = getPoint(i, 1.22)
        return (
          <text
            key={i}
            x={lp.x}
            y={lp.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="8"
            fontFamily="monospace"
          >
            {RADAR_POINTS[i].label}
          </text>
        )
      })}
    </svg>
  )
}

function StepBaseline({ onEnter }: { onEnter: () => void }) {
  const summaryCards = [
    { icon: Target, label: 'FACEIT Level', value: '9', sub: 'Level 10 in reach', color: 'violet' },
    { icon: Zap, label: 'Avg Aim Score', value: '87.4', sub: 'Top 18% of your ELO', color: 'cyan' },
    { icon: AlertTriangle, label: 'Primary Weakness', value: 'Pistols', sub: '71% loss rate', color: 'red' },
    { icon: MapPin, label: 'Best Map', value: 'Mirage', sub: '74% win rate', color: 'emerald' },
  ]

  const colorMap: Record<string, string> = {
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  }
  const valColorMap: Record<string, string> = {
    violet: 'text-violet-300',
    cyan: 'text-cyan-300',
    red: 'text-red-300',
    emerald: 'text-emerald-300',
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center animate-slide-up w-full max-w-xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-widest mb-4">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          Scan Complete
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Baseline Tactical Scan Complete
        </h2>
        <p className="text-white/40 text-sm">
          Your competitive profile has been built. Here&apos;s what we found.
        </p>
      </div>

      {/* 4 summary cards */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {summaryCards.map(({ icon: Icon, label, value, sub, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/7 bg-[#0C0C1B] p-4 text-left"
          >
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border mb-3 ${colorMap[color]}`}>
              <Icon size={14} />
            </div>
            <div className="text-[10px] text-white/35 font-mono uppercase tracking-wider mb-1">{label}</div>
            <div className={`font-display font-bold text-2xl mb-0.5 ${valColorMap[color]}`}>{value}</div>
            <div className="text-[11px] text-white/35 font-mono">{sub}</div>
          </div>
        ))}
      </div>

      {/* Radar */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/7 bg-[#0C0C1B] p-6 w-full">
        <div className="text-[10px] text-white/35 font-mono uppercase tracking-wider">Skill Distribution</div>
        <RadarChart />
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {RADAR_POINTS.map((p) => (
            <div key={p.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-[10px] text-white/40 font-mono">{p.label}: {Math.round(p.value * 100)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enter Dashboard CTA */}
      <button
        onClick={onEnter}
        className="flex items-center gap-2.5 px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-all duration-200 glow-violet animate-glow-pulse"
      >
        Enter Dashboard
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

// ─── Step indicator ────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 h-1.5 bg-violet-500'
              : i < current
              ? 'w-1.5 h-1.5 bg-violet-500/40'
              : 'w-1.5 h-1.5 bg-white/12'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Main Onboarding ───────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [playerName, setPlayerName] = useState('Player')
  const router = useRouter()

  const goNext = () => setStep((s) => s + 1)

  const handleEnterDashboard = () => {
    router.push('/dashboard')
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const source = params.get('source')
    const status = params.get('status')
    if (source === 'faceit' && status === 'connected') {
      setStep(2)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const loadSession = async () => {
      const response = await fetch('/api/auth/session', { cache: 'no-store' })
      if (!response.ok) return
      const data = await response.json() as { user?: { nickname?: string | null } }
      if (!mounted) return
      if (data.user?.nickname) {
        setPlayerName(data.user.nickname)
      }
    }
    loadSession()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-[#07070F] flex flex-col items-center justify-center overflow-hidden px-6 py-12">
      <AnimatedBg />

      {/* Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-5"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(7,7,15,0.4) 0%, rgba(7,7,15,0.9) 100%)' }}
        aria-hidden="true"
      />

      {/* Logo top */}
      <div className="relative z-10 mb-10">
        <SyntraLogo iconSize={32} />
      </div>

      {/* Step dots */}
      <div className="relative z-10 mb-10">
        <StepDots current={step} total={4} />
      </div>

      {/* Step content */}
      <div className="relative z-10 flex items-center justify-center w-full">
        {step === 0 && <StepWelcome onNext={goNext} playerName={playerName} />}
        {step === 1 && <StepConnectFaceit onSkip={goNext} />}
        {step === 2 && <StepSync onDone={goNext} />}
        {step === 3 && <StepBaseline onEnter={handleEnterDashboard} />}
      </div>
    </div>
  )
}
