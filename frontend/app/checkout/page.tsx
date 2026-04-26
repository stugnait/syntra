"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Check, ArrowLeft, Zap, Shield, Lock } from "lucide-react"
import { PLANS, type PlanSlug, type BillingInterval } from "@/lib/billing-data"

function CheckoutContent() {
  const params = useSearchParams()
  const router = useRouter()

  const planSlug = (params.get("plan") ?? "pro") as PlanSlug
  const interval = (params.get("interval") ?? "monthly") as BillingInterval
  const returnTo = params.get("returnTo") ?? "/dashboard"

  const plan = PLANS.find((p) => p.slug === planSlug) ?? PLANS[1]
  const price =
    interval === "monthly"
      ? plan.prices.monthly
      : plan.prices.yearly

  const intervalLabel = interval === "monthly" ? "month" : "year"
  const intervalFull = interval === "monthly" ? "Monthly" : "Yearly"

  function handlePay() {
    // In production: call /api/billing/checkout → redirect to payment provider
    router.push(`/billing/success?plan=${planSlug}&returnTo=${encodeURIComponent(returnTo)}`)
  }

  return (
    <div className="relative min-h-screen bg-[#07070F] flex items-center justify-center px-6 py-16">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.07), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Back link */}
        <Link
          href="/pricing"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to pricing
        </Link>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(10,10,20,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Plan summary */}
          <div
            className="mb-6 rounded-xl p-5"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(34,211,238,0.04))",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-violet-400" strokeWidth={2} />
                  <span className="font-display text-lg font-bold text-white">
                    SYNTRA {plan.name}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Billing: {intervalFull}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-white">
                  ${price}
                </p>
                <p className="text-xs text-zinc-500">/ {intervalLabel}</p>
              </div>
            </div>
          </div>

          {/* Features included */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Included
            </p>
            <ul className="space-y-2.5">
              {plan.features.slice(0, 6).map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(124,58,237,0.25)",
                    }}
                  >
                    <Check className="h-3 w-3 text-violet-400" strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Billing toggle */}
          <div
            className="mb-6 flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-sm text-zinc-400">Billing interval</span>
            <div className="flex gap-2">
              {(["monthly", "yearly"] as BillingInterval[]).map((iv) => (
                <Link
                  key={iv}
                  href={`/checkout?plan=${planSlug}&interval=${iv}&returnTo=${encodeURIComponent(returnTo)}`}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    interval === iv
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  style={
                    interval === iv
                      ? {
                          background: "rgba(124,58,237,0.25)",
                          border: "1px solid rgba(124,58,237,0.3)",
                        }
                      : undefined
                  }
                >
                  {iv === "monthly" ? "Monthly" : "Yearly"}
                  {iv === "yearly" && (
                    <span className="ml-1 text-emerald-400">–27%</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Order total */}
          <div
            className="mb-6 flex items-center justify-between rounded-xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-sm font-semibold text-zinc-300">Total today</span>
            <span className="font-display text-2xl font-bold text-white">
              ${price}
              <span className="ml-1 text-sm font-normal text-zinc-500">/ {intervalLabel}</span>
            </span>
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}
          >
            <Lock className="h-4 w-4" strokeWidth={2} />
            Pay with card
          </button>

          <Link
            href="/pricing"
            className="block w-full rounded-xl py-2.5 text-center text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Back to pricing
          </Link>

          {/* Trust note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-600">
            <Shield className="h-3.5 w-3.5" />
            Secure payment · Cancel anytime · No hidden fees
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07070F]" />}>
      <CheckoutContent />
    </Suspense>
  )
}
