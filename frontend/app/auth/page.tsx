'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatedBg } from '@/components/syntra/animated-bg'
import { SyntraLogo } from '@/components/syntra/logo'
import { ArrowLeft, Mail, Lock } from 'lucide-react'

type AuthMode = 'signin' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!email || !password) return
    router.push('/onboarding')
  }

  return (
    <div className="relative min-h-screen bg-[#07070F] flex items-center justify-center overflow-hidden px-6 py-10">
      <AnimatedBg />

      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors duration-200"
      >
        <ArrowLeft size={15} />
        Back
      </Link>

      <div
        className="pointer-events-none absolute inset-0 z-5"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(7,7,15,0.55) 0%, rgba(7,7,15,0.92) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="rounded-3xl border border-white/8 bg-[#0C0C1B]/90 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(124,58,237,0.12),0_32px_64px_rgba(0,0,0,0.6)]">
          <div className="flex justify-center mb-8">
            <SyntraLogo iconSize={42} />
          </div>

          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-white mb-2">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
            <p className="text-white/45 text-sm leading-relaxed">
              Use email and password to access SYNTRA.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 p-1 bg-[#111122] mb-6">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === 'signup' ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                mode === 'signin' ? 'bg-violet-600 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Sign in
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs text-white/50 font-mono">Email</span>
              <div className="mt-1.5 relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-[#101022] border border-white/10 focus:border-violet-500/70 outline-none text-white text-sm pl-9 pr-3 py-3"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs text-white/50 font-mono">Password</span>
              <div className="mt-1.5 relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl bg-[#101022] border border-white/10 focus:border-violet-500/70 outline-none text-white text-sm pl-9 pr-3 py-3"
                />
              </div>
            </label>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all duration-200 glow-violet-sm hover:glow-violet"
            >
              {mode === 'signup' ? 'Continue to onboarding' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-white/30 text-xs leading-relaxed font-mono mt-6">
            {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              className="text-violet-400/80 hover:text-violet-300"
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
