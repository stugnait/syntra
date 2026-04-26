"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Zap, BarChart2 } from "lucide-react"
import { PLANS, type PlanSlug } from "@/lib/billing-data"

const UNLOCKED = [
  "Advanced tactical heatmaps",
  "AI coaching recommendations",
  "Full deep match reports",
  "Progress tracking (90 days)",
  "PDF export",
]

function SuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const planSlug = (params.get("plan") ?? "pro") as PlanSlug
  const returnTo = params.get("returnTo") ?? "/dashboard"
  const plan = PLANS.find((p) => p.slug === planSlug) ?? PLANS[1]

  return (
    <div className="relative min-h-screen bg-[#07070F] flex items-center justify-center px-6 py-16">
      {/* Glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(34,197,94,0.06), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Success icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.3)",
            boxShadow: "0 0 40px rgba(34,197,94,0.2)",
          }}
        >
          <CheckCircle className="h-9 w-9 text-emerald-400" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Payment successful
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-2">
          <span className="font-semibold text-white">SYNTRA {plan.name}</span> is now active.
        </p>
        <p className="text-xs text-zinc-500 mb-8">
          Your advanced analytics are unlocked and ready.
        </p>

        {/* What&apos;s unlocked */}
        <div
          className="rounded-2xl p-6 mb-8 text-left"
          style={{
            background: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/70 mb-3">
            Now unlocked
          </p>
          <ul className="space-y-2.5">
            {UNLOCKED.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}
                >
                  <CheckCircle className="h-3 w-3 text-emerald-400" strokeWidth={2.5} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}
          >
            <Zap className="h-4 w-4" strokeWidth={2} />
            Go to Dashboard
          </Link>
          <button
            onClick={() => router.push(returnTo)}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <BarChart2 className="h-4 w-4" strokeWidth={1.8} />
            Open Last Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07070F]" />}>
      <SuccessContent />
    </Suspense>
  )
}
