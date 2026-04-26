'use client'

import Link from 'next/link'
import { AnimatedBg } from '@/components/syntra/animated-bg'
import { SyntraLogo } from '@/components/syntra/logo'
import { ArrowLeft, Shield } from 'lucide-react'

function SteamIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z" />
    </svg>
  )
}

function FaceitIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M2 2h9v9H2V2zm11 0h9v9h-9V2zm0 11h9v9h-9v-9zm-11 0h9v9H2v-9z" />
    </svg>
  )
}

export default function AuthPage() {
  return (
    <div className="relative min-h-screen bg-[#07070F] flex items-center justify-center overflow-hidden">
      <AnimatedBg />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white text-sm font-medium transition-colors duration-200"
      >
        <ArrowLeft size={15} />
        Back
      </Link>

      {/* Dark blurred tactical overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-5"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(7,7,15,0.55) 0%, rgba(7,7,15,0.92) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="rounded-3xl border border-white/8 bg-[#0C0C1B]/90 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(124,58,237,0.12),0_32px_64px_rgba(0,0,0,0.6)]">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <SyntraLogo iconSize={42} />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-white mb-2">
              Enter SYNTRA Command Center
            </h1>
            <p className="text-white/45 text-sm leading-relaxed">
              Connect your gaming accounts to begin your tactical analysis.
            </p>
          </div>

          {/* Auth buttons */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Steam */}
            <Link
              href="/onboarding"
              className="group flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[#1B2838] hover:bg-[#1f3248] border border-[#2a475e]/60 hover:border-[#4a90c4]/50 text-white font-semibold text-sm transition-all duration-200 shadow-[0_0_0_1px_rgba(66,133,244,0.06)]"
            >
              <SteamIcon />
              <span>Continue with Steam</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <Shield size={13} className="text-[#4a90c4]" />
              </div>
            </Link>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-white/20 text-[11px] font-mono uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            {/* FACEIT */}
            <Link
              href="/onboarding"
              className="group flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-500 border border-violet-500/30 text-white font-semibold text-sm transition-all duration-200 glow-violet-sm hover:glow-violet"
            >
              <FaceitIcon />
              <span>Connect FACEIT Account</span>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <Shield size={13} className="text-violet-200" />
              </div>
            </Link>
          </div>

          {/* Fine print */}
          <p className="text-center text-white/30 text-xs leading-relaxed font-mono">
            Your match history will be synchronized automatically after connection.
          </p>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-5 mt-6 pt-6 border-t border-white/5">
            {['OAuth 2.0 Secure', 'No passwords stored', 'GDPR compliant'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-white/25 text-[10px] font-mono">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom link */}
        <p className="text-center text-white/20 text-xs font-mono mt-5">
          By connecting, you agree to our{' '}
          <a href="#" className="text-violet-400/60 hover:text-violet-400 transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-violet-400/60 hover:text-violet-400 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
