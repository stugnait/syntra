"use client"

import { useRouter } from "next/navigation"
import { X, Check, Zap, Lock } from "lucide-react"
import { FEATURE_LABELS } from "@/lib/billing-data"

const PRO_HIGHLIGHTS = [
  "Full deep match reports",
  "Tactical kill-zone heatmaps",
  "AI coaching recommendations",
  "Progress tracking (90 days)",
  "PDF export",
]

interface UpgradeModalProps {
  featureKey?: string
  onClose: () => void
}

export function UpgradeModal({ featureKey, onClose }: UpgradeModalProps) {
  const router = useRouter()
  const featureLabel = featureKey ? FEATURE_LABELS[featureKey] : null

  function handleUpgrade() {
    onClose()
    router.push("/checkout?plan=pro&interval=monthly")
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-8"
        style={{
          background: "rgba(10, 10, 20, 0.98)",
          border: "1px solid rgba(124,58,237,0.35)",
          boxShadow: "0 0 80px rgba(124,58,237,0.22), 0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Lock icon */}
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(34,211,238,0.12))",
            border: "1px solid rgba(124,58,237,0.35)",
          }}
        >
          <Lock className="h-6 w-6 text-violet-400" strokeWidth={1.8} />
        </div>

        {/* Heading */}
        <h2
          id="upgrade-modal-title"
          className="font-display text-center text-xl font-bold text-white"
        >
          {featureLabel
            ? `Unlock ${featureLabel}`
            : "Unlock Deep Tactical Analytics"}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400">
          This feature requires{" "}
          <span className="font-semibold text-violet-400">SYNTRA Pro</span>.
        </p>

        {/* Feature list */}
        <ul className="mt-6 space-y-2.5">
          {PRO_HIGHLIGHTS.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }}
              >
                <Check className="h-3 w-3 text-violet-400" strokeWidth={2.5} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* Price note */}
        <div
          className="mt-6 rounded-xl px-4 py-3 text-center"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}
        >
          <span className="font-display text-2xl font-bold text-white">$9</span>
          <span className="ml-1 text-sm text-zinc-400">/ month</span>
          <p className="mt-0.5 text-xs text-zinc-500">or $79/year — save 27%</p>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleUpgrade}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}
          >
            <Zap className="h-4 w-4" strokeWidth={2} />
            Upgrade to Pro
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  )
}
