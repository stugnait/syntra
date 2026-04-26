'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'How does SYNTRA connect to my accounts?',
    a: 'SYNTRA uses official OAuth 2.0 authentication for both Steam and FACEIT. You authorize access through their secure login pages — we never see or store your credentials. Only your match history and public profile data are accessed.',
  },
  {
    q: 'Does SYNTRA store my demo files?',
    a: 'Demo files are downloaded temporarily for processing and then deleted after analysis is complete. We store only the extracted gameplay telemetry (events, positions, timings) — not the raw demo files themselves.',
  },
  {
    q: 'How long does analysis take after a match?',
    a: "Typically under 5 minutes for most matches. SYNTRA detects your new game automatically via FACEIT webhooks, queues demo download, processes events, and generates your AI report — all without you lifting a finger.",
  },
  {
    q: 'Is SYNTRA available for ESEA or other platforms?',
    a: 'Currently SYNTRA supports FACEIT and Steam (Valve Matchmaking) natively. ESEA integration is on our roadmap. You can still manually import ESEA demos on the Pro plan.',
  },
  {
    q: 'Can I use SYNTRA without FACEIT?',
    a: 'Yes. You can connect Steam only and analyze official CS2 Premier and Competitive matches. FACEIT integration unlocks additional features like ELO tracking, real-time sync, and advanced tournament-level analysis.',
  },
  {
    q: 'What CS2 game modes are supported?',
    a: 'SYNTRA supports CS2 Competitive, Premier, and all FACEIT match formats. Death Match and casual modes are not analyzed as they lack meaningful tactical data.',
  },
  {
    q: 'Is my data private and secure?',
    a: 'Yes. All data is encrypted at rest and in transit. We follow GDPR guidelines and never sell user data to third parties. You can request full data deletion at any time from your account settings.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="relative z-10 py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-violet-500/50" />
            <span className="text-[11px] text-violet-400 font-mono tracking-[0.15em] uppercase">FAQ</span>
            <div className="h-px w-8 bg-violet-500/50" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white text-balance">
            Common <span className="text-gradient-violet">Questions</span>
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => {
            const isOpen = open === i
            return (
              <div
                key={q}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-violet-500/30 bg-[#0F0F22]'
                    : 'border-white/7 bg-[#0C0C1B] hover:border-white/12'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-semibold text-white text-sm pr-4">{q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-violet-400/70 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-white/55 text-sm leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
