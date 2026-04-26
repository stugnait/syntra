"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react"

function FailedContent() {
  const params = useSearchParams()
  const plan = params.get("plan") ?? "pro"
  const interval = params.get("interval") ?? "monthly"

  return (
    <div className="relative min-h-screen bg-[#07070F] flex items-center justify-center px-6 py-16">
      {/* Glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(239,68,68,0.05), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Error icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            boxShadow: "0 0 40px rgba(239,68,68,0.15)",
          }}
        >
          <XCircle className="h-9 w-9 text-red-400" strokeWidth={1.5} />
        </div>

        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Payment failed
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          We couldn&apos;t complete your payment. Please try again or use a different card.
        </p>

        {/* Possible reasons */}
        <div
          className="rounded-2xl p-5 mb-8 text-left"
          style={{
            background: "rgba(239,68,68,0.04)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400/70 mb-3">
            Common reasons
          </p>
          <ul className="space-y-2 text-sm text-zinc-400">
            {[
              "Insufficient funds or card limit reached",
              "Incorrect card details entered",
              "Card blocked for online / international transactions",
              "3D Secure authentication not completed",
            ].map((r) => (
              <li key={r} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/50" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/checkout?plan=${plan}&interval=${interval}`}
            className="flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2} />
            Try Again
          </Link>
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            Back to Pricing
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BillingFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07070F]" />}>
      <FailedContent />
    </Suspense>
  )
}
