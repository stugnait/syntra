import Link from 'next/link'
import { Play, Shield } from 'lucide-react'
import { HeroMockup } from './hero-mockup'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6">
        <div className="grid lg:grid-cols-[45%_55%] gap-12 lg:gap-8 items-center">
          {/* ── Left column ── */}
          <div className="flex flex-col gap-6">
            {/* Label chip */}
            <div className="inline-flex items-center gap-2 w-fit">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[11px] text-violet-400 font-mono tracking-[0.15em] uppercase">
                Automated CS2 Performance Intelligence
              </span>
            </div>

            {/* Main headline */}
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-balance text-white">
              Analyze Every Match.{' '}
              <span className="text-gradient-violet">Fix Every Mistake.</span>
            </h1>

            {/* Supporting text */}
            <p className="text-white/55 text-base lg:text-lg leading-relaxed max-w-xl">
              SYNTRA automatically syncs your FACEIT and Steam matches, downloads
              demos, and converts raw gameplay into tactical intelligence, visual
              heatmaps, and AI coaching reports.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 text-white font-semibold text-sm px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 transition-all duration-200 glow-violet animate-glow-pulse"
              >
                <Shield size={16} />
                Connect FACEIT
              </Link>
              <button className="inline-flex items-center gap-2.5 text-white/70 hover:text-white font-medium text-sm px-5 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/8 border border-white/10">
                  <Play size={12} fill="currentColor" />
                </span>
                Watch Demo Report
              </button>
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-3 text-[12px] text-white/35 font-mono">
              <span>No manual uploads</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>Fully automated</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>AI powered</span>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <HeroMockup />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(7,7,15,0.8))' }}
        aria-hidden="true"
      />
    </section>
  )
}
