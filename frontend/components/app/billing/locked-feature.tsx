"use client"

import { useState } from "react"
import { Lock, Zap } from "lucide-react"
import { UpgradeModal } from "./upgrade-modal"

interface LockedFeatureProps {
  featureKey: string
  title?: string
  description?: string
  /** If true, renders a full card overlay rather than an inline block */
  overlay?: boolean
  children?: React.ReactNode
  className?: string
}

export function LockedFeature({
  featureKey,
  title,
  description,
  overlay = false,
  children,
  className,
}: LockedFeatureProps) {
  const [open, setOpen] = useState(false)

  if (overlay && children) {
    return (
      <>
        <div className={`relative overflow-hidden rounded-2xl ${className ?? ""}`}>
          {/* Blurred content */}
          <div className="pointer-events-none select-none blur-[3px] opacity-40">
            {children}
          </div>

          {/* Overlay */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl gap-3 cursor-pointer group"
            style={{
              background: "rgba(5,5,14,0.75)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
            onClick={() => setOpen(true)}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              <Lock className="h-5 w-5 text-violet-400" strokeWidth={1.8} />
            </div>
            <div className="text-center px-6">
              <p className="font-display text-sm font-bold text-white">
                {title ?? "Pro Feature"}
              </p>
              {description && (
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{description}</p>
              )}
            </div>
            <button
              className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                boxShadow: "0 0 18px rgba(124,58,237,0.4)",
              }}
            >
              <Zap className="h-3.5 w-3.5" strokeWidth={2} />
              Upgrade to Pro
            </button>
          </div>
        </div>

        {open && <UpgradeModal featureKey={featureKey} onClose={() => setOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <div
        className={`flex flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center cursor-pointer group ${className ?? ""}`}
        style={{
          background: "rgba(124,58,237,0.04)",
          border: "1px dashed rgba(124,58,237,0.25)",
        }}
        onClick={() => setOpen(true)}
      >
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
          style={{
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          <Lock className="h-5 w-5 text-violet-400" strokeWidth={1.8} />
        </div>
        <div>
          <p className="font-display text-sm font-bold text-white">
            {title ?? "Pro Feature"}
          </p>
          {description && (
            <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-[280px]">
              {description}
            </p>
          )}
        </div>
        <button
          className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
            boxShadow: "0 0 18px rgba(124,58,237,0.35)",
          }}
        >
          <Zap className="h-3.5 w-3.5" strokeWidth={2} />
          Upgrade to Pro
        </button>
      </div>

      {open && <UpgradeModal featureKey={featureKey} onClose={() => setOpen(false)} />}
    </>
  )
}
