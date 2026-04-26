"use client"

import { useState } from "react"
import { AlertTriangle, X, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

interface DemoLimitBannerProps {
  used: number
  limit: number
  plan?: string
}

export function DemoLimitBanner({ used, limit, plan = "Free" }: DemoLimitBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()
  const pct = Math.round((used / limit) * 100)
  const isFull = used >= limit
  const isWarning = pct >= 80

  if (dismissed || (!isFull && !isWarning)) return null

  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-5 py-3.5 mb-6"
      style={{
        background: isFull
          ? "rgba(239,68,68,0.07)"
          : "rgba(251,191,36,0.06)",
        border: `1px solid ${isFull ? "rgba(239,68,68,0.25)" : "rgba(251,191,36,0.2)"}`,
      }}
    >
      <AlertTriangle
        className={`h-4.5 w-4.5 shrink-0 ${isFull ? "text-red-400" : "text-amber-400"}`}
        strokeWidth={1.8}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">
          {isFull
            ? "Monthly demo analysis limit reached."
            : `You've used ${pct}% of your monthly demo analysis limit.`}
        </p>
        <p className="text-xs text-zinc-400 mt-0.5">
          Current plan: {plan} &middot; Reports used: {used} / {limit}
        </p>
      </div>
      <button
        onClick={() => router.push("/checkout?plan=pro&interval=monthly")}
        className="flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
          boxShadow: "0 0 14px rgba(124,58,237,0.35)",
        }}
      >
        <Zap className="h-3 w-3" strokeWidth={2} />
        Upgrade to Pro
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
