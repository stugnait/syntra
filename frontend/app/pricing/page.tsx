"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, Zap } from "lucide-react"
import { PLANS, type BillingInterval } from "@/lib/billing-data"
import { AnimatedBg } from "@/components/syntra/animated-bg"
import { Navbar } from "@/components/syntra/navbar"

const BILLING_FAQ = [
  {
    q: "Can I cancel at any time?",
    a: "Yes. You can cancel your Pro or Team subscription at any time. You keep access until the end of your current billing period, after which your account returns to the Free plan — no questions asked.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your match history, heatmaps, and reports remain stored for 30 days after downgrading. During that window you can re-subscribe and regain instant access. After 30 days, advanced analytics are archived.",
  },
  {
    q: "Is there a free trial?",
    a: "The Free plan lets you explore SYNTRA with 3 demo analyses per month — no credit card required. Pro includes a 7-day trial so you can experience full AI coaching before committing.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, Amex) via our secure payment provider. Recurring billing is handled automatically — you'll receive an invoice by email each cycle.",
  },
  {
    q: "What is the monthly demo limit?",
    a: "Free plan users can analyze 3 demos per month. Pro covers 50 demos/month — enough for daily competitive play. Team plan offers unlimited demo processing across all team members.",
  },
  {
    q: "Can I switch between monthly and yearly billing?",
    a: "Yes. You can switch to yearly billing at any time from your Billing settings to lock in the 27% discount. The change applies at the start of your next billing cycle.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        open ? "border-violet-500/30 bg-[#0F0F22]" : "border-white/7 bg-[#0C0C1B] hover:border-white/12"
      }`}
    >
      <button
        className="flex w-full items-center justify-between px-6 py-5 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-display font-semibold text-white text-sm pr-4">{q}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-violet-400/70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm leading-relaxed text-white/55">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>("monthly")

  return (
    <div className="relative min-h-screen bg-[#07070F] overflow-x-hidden">
      <AnimatedBg />
      <div className="relative z-10">
        <Navbar />

        <main className="pt-32 pb-32">
          <div className="max-w-7xl mx-auto px-6">

            {/* Header */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="h-px w-8 bg-violet-500/50" />
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-violet-400">Pricing</span>
                <div className="h-px w-8 bg-violet-500/50" />
              </div>
              <h1 className="font-display text-5xl font-bold text-white text-balance lg:text-6xl">
                Choose your{" "}
                <span className="text-gradient-violet">plan</span>
              </h1>
              <p className="mt-4 max-w-md mx-auto text-base leading-relaxed text-white/45">
                Start free. Upgrade when you&apos;re ready to go deeper.
              </p>

              {/* Billing toggle */}
              <div
                className="mt-8 inline-flex items-center rounded-2xl p-1 gap-1"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {(["monthly", "yearly"] as BillingInterval[]).map((iv) => (
                  <button
                    key={iv}
                    onClick={() => setInterval(iv)}
                    className={`rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                      interval === iv
                        ? "text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={
                      interval === iv
                        ? {
                            background: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(124,58,237,0.15))",
                            boxShadow: "0 0 0 1px rgba(124,58,237,0.35) inset",
                          }
                        : undefined
                    }
                  >
                    {iv === "monthly" ? "Monthly" : "Yearly"}
                    {iv === "yearly" && (
                      <span className="ml-2 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Save 27%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid gap-6 md:grid-cols-3 items-start">
              {PLANS.map((plan) => {
                const price =
                  interval === "monthly"
                    ? plan.prices.monthly
                    : plan.slug === "free"
                    ? 0
                    : Math.round(plan.prices.yearly / 12)
                const ctaHref =
                  plan.slug === "free"
                    ? "/auth"
                    : plan.slug === "team"
                    ? "/auth"
                    : `/checkout?plan=${plan.slug}&interval=${interval}`
                const ctaLabel =
                  plan.slug === "free"
                    ? "Start for Free"
                    : plan.slug === "team"
                    ? "Contact Us"
                    : "Upgrade to Pro"

                return (
                  <div
                    key={plan.slug}
                    className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                      plan.featured
                        ? "border-violet-500/40 bg-[#0F0F22] shadow-[0_0_60px_rgba(124,58,237,0.18),0_0_0_1px_rgba(124,58,237,0.15)]"
                        : "border-white/7 bg-[#0C0C1B] hover:border-violet-500/20"
                    }`}
                  >
                    {/* Popular badge */}
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-1.5 text-[11px] font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                        <Zap size={11} fill="currentColor" />
                        {plan.badge}
                      </div>
                    )}

                    <div className="mb-5">
                      <p className="font-display text-xl font-bold text-white">{plan.name}</p>
                      <p className="mt-1 text-sm text-white/45">{plan.tagline}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 flex items-end gap-1.5">
                      <span className="font-mono text-xl text-white/40 mt-1">$</span>
                      <span className="font-display text-5xl font-bold leading-none text-white">
                        {price}
                      </span>
                      <span className="mb-1.5 text-sm text-white/40">
                        {plan.slug === "free" ? "forever" : interval === "monthly" ? "/ mo" : "/ mo, billed yearly"}
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={ctaHref}
                      className={`mb-7 w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
                        plan.featured
                          ? "bg-violet-600 text-white hover:bg-violet-500 glow-violet-sm hover:glow-violet"
                          : "border border-white/12 text-white/70 hover:border-white/22 hover:text-white"
                      }`}
                    >
                      {ctaLabel}
                    </Link>

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <Check
                            size={14}
                            className={`mt-0.5 shrink-0 ${plan.featured ? "text-violet-400" : "text-white/35"}`}
                          />
                          <span className="text-white/55">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Inner glow for featured */}
                    {plan.featured && (
                      <div
                        className="pointer-events-none absolute inset-0 rounded-2xl"
                        style={{
                          background:
                            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08), transparent 60%)",
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Fine print */}
            <p className="mt-8 text-center font-mono text-xs text-white/25">
              All plans include a 7-day free trial on Pro. No credit card required to start.
            </p>

            {/* Comparison table */}
            <div className="mt-24">
              <h2 className="font-display text-center text-3xl font-bold text-white mb-10">
                Full plan comparison
              </h2>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Table header */}
                <div
                  className="grid grid-cols-4 gap-0 text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="px-6 py-4 text-zinc-500">Feature</div>
                  {PLANS.map((p) => (
                    <div
                      key={p.slug}
                      className={`px-6 py-4 text-center ${p.featured ? "text-violet-400" : "text-zinc-300"}`}
                    >
                      {p.name}
                    </div>
                  ))}
                </div>

                {[
                  { label: "Monthly demo limit", values: ["3", "50", "Unlimited"] },
                  { label: "Tactical heatmaps", values: [false, true, true] },
                  { label: "Full match reports", values: [false, true, true] },
                  { label: "AI coaching recommendations", values: [false, true, true] },
                  { label: "Round timeline", values: [false, true, true] },
                  { label: "Mistake breakdown", values: [false, true, true] },
                  { label: "Progress tracking", values: [false, true, true] },
                  { label: "PDF export", values: [false, true, true] },
                  { label: "Auto FACEIT sync", values: [false, true, true] },
                  { label: "Team workspace", values: [false, false, true] },
                  { label: "Player comparison", values: [false, false, true] },
                  { label: "Coach notes", values: [false, false, true] },
                  { label: "Team seats", values: ["1", "1", "5"] },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-4 text-sm"
                    style={{
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div className="px-6 py-3.5 text-zinc-400">{row.label}</div>
                    {row.values.map((v, vi) => (
                      <div key={vi} className="px-6 py-3.5 flex justify-center">
                        {typeof v === "boolean" ? (
                          v ? (
                            <Check size={14} className="text-violet-400" />
                          ) : (
                            <span className="text-zinc-700">—</span>
                          )
                        ) : (
                          <span className="text-zinc-300 font-mono text-xs">{v}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Billing FAQ */}
            <div className="mt-24 max-w-3xl mx-auto">
              <h2 className="font-display text-center text-3xl font-bold text-white mb-10">
                Billing questions
              </h2>
              <div className="space-y-3">
                {BILLING_FAQ.map((item) => (
                  <FaqItem key={item.q} {...item} />
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
