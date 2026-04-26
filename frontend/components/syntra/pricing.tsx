import Link from 'next/link'
import { Check, Zap } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    period: 'forever',
    desc: 'Get started with core analytics.',
    cta: 'Get Started',
    href: '/auth',
    featured: false,
    features: [
      '5 demo analyses per month',
      'Basic match statistics',
      'Match history (last 10)',
      'Map performance overview',
      'FACEIT integration',
      'Manual sync',
    ],
    disabled: [],
  },
  {
    name: 'Pro',
    price: '12',
    period: 'per month',
    desc: 'Unlimited analysis. Full AI power.',
    cta: 'Start Free Trial',
    href: '/auth',
    featured: true,
    badge: 'Most Popular',
    features: [
      'Unlimited demo analyses',
      'AI coaching reports',
      'Advanced kill-zone heatmaps',
      'Utility efficiency tracking',
      'Weakness detection engine',
      'Duel breakdown analytics',
      'Progress tracking (90 days)',
      'Priority FACEIT sync',
      'Export reports (PDF)',
    ],
    disabled: [],
  },
  {
    name: 'Team',
    price: '39',
    period: 'per month',
    desc: 'For squads that want to win together.',
    cta: 'Contact Us',
    href: '/auth',
    featured: false,
    features: [
      'Everything in Pro',
      'Up to 10 players',
      'Team tactical analysis',
      'Coach dashboard view',
      'Cross-player heatmap overlay',
      'Team strategy recommendations',
      'Priority support',
      'API access',
    ],
    disabled: [],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative z-10 py-24 lg:py-32">
      {/* Background accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(124,58,237,0.04), transparent)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-violet-500/50" />
            <span className="text-[11px] text-violet-400 font-mono tracking-[0.15em] uppercase">Pricing</span>
            <div className="h-px w-8 bg-violet-500/50" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white text-balance">
            Simple,{' '}
            <span className="text-gradient-violet">Transparent</span> Pricing
          </h2>
          <p className="text-white/45 text-base mt-4 max-w-md mx-auto leading-relaxed">
            Start free. Upgrade when you&apos;re ready to go deeper.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map(({ name, price, period, desc, cta, href, featured, badge, features }) => (
            <div
              key={name}
              className={`relative rounded-2xl border p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                featured
                  ? 'border-violet-500/40 bg-[#0F0F22] shadow-[0_0_60px_rgba(124,58,237,0.18),0_0_0_1px_rgba(124,58,237,0.15)]'
                  : 'border-white/7 bg-[#0C0C1B] hover:border-violet-500/20 hover:shadow-[0_16px_48px_rgba(124,58,237,0.08)]'
              }`}
            >
              {/* Featured badge */}
              {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-600 text-white text-[11px] font-semibold font-display shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                  <Zap size={11} fill="currentColor" />
                  {badge}
                </div>
              )}

              {/* Plan name + desc */}
              <div className="mb-6">
                <div className="font-display font-bold text-white text-xl mb-1">{name}</div>
                <div className="text-white/45 text-sm">{desc}</div>
              </div>

              {/* Price */}
              <div className="flex items-end gap-2 mb-6">
                <span className="text-white/40 font-mono text-xl mt-1">$</span>
                <span className="font-display font-bold text-white text-5xl leading-none">{price}</span>
                <span className="text-white/40 text-sm mb-1.5">{period}</span>
              </div>

              {/* CTA */}
              <Link
                href={href}
                className={`w-full text-center font-semibold text-sm py-3 rounded-xl mb-7 transition-all duration-200 ${
                  featured
                    ? 'bg-violet-600 hover:bg-violet-500 text-white glow-violet-sm hover:glow-violet'
                    : 'border border-white/12 text-white/70 hover:text-white hover:border-white/22'
                }`}
              >
                {cta}
              </Link>

              {/* Features */}
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={14}
                      className={`mt-0.5 shrink-0 ${featured ? 'text-violet-400' : 'text-white/40'}`}
                    />
                    <span className="text-white/60">{f}</span>
                  </li>
                ))}
              </ul>

              {/* Inner glow for featured */}
              {featured && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08), transparent 60%)' }}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>

        {/* Fine print */}
        <p className="text-center text-white/25 text-xs font-mono mt-8">
          All plans include a 7-day free trial on Pro. No credit card required.
        </p>
      </div>
    </section>
  )
}
