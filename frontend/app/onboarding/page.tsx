'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedBg } from '@/components/syntra/animated-bg'
import { SyntraLogo } from '@/components/syntra/logo'
import { ChevronRight, Rocket, ShieldCheck, Sparkles } from 'lucide-react'

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

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center gap-7 text-center animate-slide-up max-w-lg">
      <div className="w-20 h-20 rounded-2xl bg-violet-600/15 border border-violet-500/25 shadow-[0_0_30px_rgba(124,58,237,0.2)] flex items-center justify-center">
        <Rocket className="text-violet-300" size={28} />
      </div>

      <div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">Welcome to SYNTRA</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          Your account is ready. We&apos;ll quickly finish setup in two steps and take you straight to your dashboard.
        </p>
      </div>

      <button
        onClick={onNext}
        className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all duration-200 glow-violet-sm hover:glow-violet"
      >
        Continue
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

function StepFinish({ onDone }: { onDone: () => void }) {
  return (
    <div className="flex flex-col items-center gap-7 text-center animate-slide-up max-w-lg">
      <div className="grid grid-cols-2 gap-3 w-full">
        {[
          { icon: ShieldCheck, title: 'Account secured', text: 'Email + password authentication enabled.' },
          { icon: Sparkles, title: 'Onboarding complete', text: 'No extra data connections required.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-white/7 bg-[#0C0C1B] p-4 text-left">
            <Icon size={16} className="text-violet-300 mb-2" />
            <p className="text-white text-sm font-semibold">{title}</p>
            <p className="text-white/45 text-xs mt-1 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">You&apos;re all set</h2>
        <p className="text-white/45 text-sm">Open your dashboard to start using SYNTRA.</p>
      </div>

      <button
        onClick={onDone}
        className="flex items-center gap-2.5 px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-all duration-200 glow-violet"
      >
        Go to dashboard
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  return (
    <div className="relative min-h-screen bg-[#07070F] flex flex-col items-center justify-center overflow-hidden px-6 py-12">
      <AnimatedBg />

      <div
        className="pointer-events-none absolute inset-0 z-5"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(7,7,15,0.4) 0%, rgba(7,7,15,0.9) 100%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mb-10">
        <SyntraLogo iconSize={32} />
      </div>

      <div className="relative z-10 mb-10">
        <StepDots current={step} total={2} />
      </div>

      <div className="relative z-10 flex items-center justify-center w-full">
        {step === 0 && <StepWelcome onNext={() => setStep(1)} />}
        {step === 1 && <StepFinish onDone={() => router.push('/dashboard')} />}
      </div>
    </div>
  )
}
