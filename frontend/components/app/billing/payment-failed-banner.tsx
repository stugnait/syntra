"use client"

import { useState } from "react"
import { CreditCard, X } from "lucide-react"
import { useRouter } from "next/navigation"

export function PaymentFailedBanner() {
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()

  if (dismissed) return null

  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-5 py-3.5 mb-6"
      style={{
        background: "rgba(239,68,68,0.07)",
        border: "1px solid rgba(239,68,68,0.25)",
      }}
    >
      <CreditCard className="h-4.5 w-4.5 shrink-0 text-red-400" strokeWidth={1.8} />
      <p className="flex-1 text-sm text-white">
        Your payment failed.{" "}
        <span className="text-zinc-400">
          Update your payment method to keep SYNTRA Pro active.
        </span>
      </p>
      <button
        onClick={() => router.push("/billing")}
        className="shrink-0 rounded-xl border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
      >
        Update Payment Method
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-white"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
