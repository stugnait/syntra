"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  CheckCircle2, Clock, Loader2, AlertTriangle,
  FileText, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type StepStatus = "done" | "active" | "pending" | "failed"

interface Step {
  label: string
  status: StepStatus
  detail?: string
}

const INITIAL_STEPS: Step[] = [
  { label: "Downloading demo",      status: "pending" },
  { label: "Decompressing file",    status: "pending" },
  { label: "Parsing events",        status: "pending" },
  { label: "Extracting positions",  status: "pending" },
  { label: "Calculating metrics",   status: "pending" },
  { label: "Generating report",     status: "pending" },
]

// Simulates each step advancing over time
const STEP_DELAYS = [1200, 1800, 2600, 3800, 5200, 7200] // ms at which step becomes "active"
const STEP_DONE_EXTRA = 1100  // ms after active before marking done
const DEMO_API_BASE = process.env.NEXT_PUBLIC_DEMO_API_BASE_URL ?? ""

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function StepRow({ step, index }: { step: Step; index: number }) {
  return (
    <div className={cn("flex items-center gap-4 py-2.5 transition-opacity", step.status === "pending" && "opacity-40")}>
      {/* Status icon */}
      <div className="w-6 flex justify-center shrink-0">
        {step.status === "done" && (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" strokeWidth={2} />
        )}
        {step.status === "active" && (
          <Loader2 className="h-5 w-5 text-violet-400 animate-spin" strokeWidth={2} />
        )}
        {step.status === "pending" && (
          <div className="h-5 w-5 rounded-full border-2 border-zinc-700" />
        )}
        {step.status === "failed" && (
          <AlertTriangle className="h-5 w-5 text-red-400" strokeWidth={2} />
        )}
      </div>

      {/* Step label */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium transition-colors",
            step.status === "done"    && "text-zinc-300",
            step.status === "active"  && "text-white font-semibold",
            step.status === "pending" && "text-zinc-600",
            step.status === "failed"  && "text-red-400",
          )}
        >
          Step {index + 1}/{INITIAL_STEPS.length} — {step.label}
        </p>
      </div>

      {/* Badge */}
      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5",
          step.status === "done"    && "bg-emerald-500/10 text-emerald-400",
          step.status === "active"  && "bg-violet-500/15 text-violet-300",
          step.status === "pending" && "bg-white/5 text-zinc-600",
          step.status === "failed"  && "bg-red-500/10 text-red-400",
        )}
      >
        {step.status}
      </span>
    </div>
  )
}

function RadarAnimation({ progress }: { progress: number }) {
  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto mb-8">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: "1px solid rgba(124,58,237,0.15)" }}
      />
      {/* Mid ring */}
      <div
        className="absolute inset-6 rounded-full"
        style={{ border: "1px solid rgba(124,58,237,0.2)" }}
      />
      {/* Inner ring */}
      <div
        className="absolute inset-12 rounded-full"
        style={{ border: "1px solid rgba(124,58,237,0.3)" }}
      />
      {/* Spinning sector */}
      <div
        className="absolute inset-0 rounded-full animate-radar"
        style={{
          background: "conic-gradient(from 0deg, transparent 70%, rgba(124,58,237,0.35) 100%)",
        }}
      />
      {/* Reverse outer ring spin */}
      <div
        className="absolute inset-3 rounded-full animate-radar-reverse"
        style={{
          border: "1px dashed rgba(34,211,238,0.18)",
        }}
      />
      {/* Center */}
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          background: "rgba(124,58,237,0.15)",
          border: "2px solid rgba(124,58,237,0.4)",
          boxShadow: "0 0 24px rgba(124,58,237,0.3)",
        }}
      >
        <span className="font-display text-lg font-black text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}

export default function ProcessingPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const shouldPollBackend = Boolean(jobId && isUuid(jobId))

  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [eventsExtracted, setEventsExtracted] = useState(0)
  const [roundsProcessed, setRoundsProcessed] = useState(0)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errorText, setErrorText] = useState<string | null>(null)

  const totalRounds = 24
  const totalEvents = 482913

  // Advance steps
  useEffect(() => {
    if (shouldPollBackend) return

    const timers: ReturnType<typeof setTimeout>[] = []

    STEP_DELAYS.forEach((delay, i) => {
      timers.push(setTimeout(() => {
        setSteps((prev) => prev.map((s, si) => si === i ? { ...s, status: "active" } : s))
        setProgress(Math.round(((i) / INITIAL_STEPS.length) * 100))

        timers.push(setTimeout(() => {
          setSteps((prev) => prev.map((s, si) => si === i ? { ...s, status: "done" } : s))
          if (i === INITIAL_STEPS.length - 1) {
            setDone(true)
            setProgress(100)
            setEventsExtracted(totalEvents)
            setRoundsProcessed(totalRounds)
          }
        }, STEP_DONE_EXTRA))
      }, delay))
    })

    return () => timers.forEach(clearTimeout)
  }, [shouldPollBackend])

  // Poll real backend status when job id is a UUID
  useEffect(() => {
    if (!shouldPollBackend || !jobId) return

    let active = true
    setErrorText(null)

    const syncStepState = (state: "processing" | "completed" | "failed") => {
      if (state === "processing") {
        setSteps((prev) => prev.map((s, i) => {
          if (i === 0) return { ...s, status: "done" }
          if (i === 1) return { ...s, status: "active" }
          return { ...s, status: "pending" }
        }))
        setProgress((p) => Math.max(p, 12))
        return
      }

      if (state === "completed") {
        setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })))
        setDone(true)
        setProgress(100)
        setEventsExtracted(totalEvents)
        setRoundsProcessed(totalRounds)
        return
      }

      setSteps((prev) => prev.map((s, i) => {
        if (i === 0) return { ...s, status: "done" }
        if (i === 1) return { ...s, status: "failed" }
        return { ...s, status: "pending" }
      }))
      setErrorText("Analysis failed. Open upload and retry with another demo file.")
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(`${DEMO_API_BASE}/api/demos/jobs/${jobId}/`, { cache: "no-store" })
        if (!active) return
        if (!response.ok) {
          setErrorText("Job status is unavailable right now. Please refresh in a few seconds.")
          return
        }
        const payload = await response.json() as { status?: string; error_message?: string | null }
        if (!active) return

        if (payload.status === "completed") {
          syncStepState("completed")
          return
        }
        if (payload.status === "failed") {
          syncStepState("failed")
          setErrorText(payload.error_message ?? "Analysis failed during demo parsing.")
          return
        }
        syncStepState("processing")
      } catch {
        if (!active) return
        setErrorText("Cannot reach demo API. Check backend URL / tunnel and retry.")
      }
    }

    fetchStatus()
    const pollId = setInterval(fetchStatus, 2000)
    return () => {
      active = false
      clearInterval(pollId)
    }
  }, [jobId, shouldPollBackend, totalEvents, totalRounds])

  // Animate counters
  useEffect(() => {
    if (done) return
    const interval = setInterval(() => {
      setEventsExtracted((prev) => Math.min(prev + Math.floor(Math.random() * 8000 + 2000), totalEvents))
      setRoundsProcessed((prev) => Math.min(prev + (Math.random() > 0.85 ? 1 : 0), totalRounds))
    }, 250)
    return () => clearInterval(interval)
  }, [done])

  return (
    <div className="min-h-screen p-7 pb-16 flex flex-col items-center" style={{ background: "#05050A" }}>
      <div className="w-full max-w-lg mt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-black text-white tracking-tight mb-1">
            {done ? "Tactical Report Ready" : "Processing Tactical Report"}
          </h1>
          <p className="text-sm text-zinc-500">
            {done ? "Your match analysis is complete." : `Demo ${jobId ?? ""} is being analyzed — sit tight`}
          </p>
        </div>

        {/* Radar */}
        <RadarAnimation progress={progress} />

        {/* Steps card */}
        {!done ? (
          <div
            className="rounded-2xl px-6 py-4 mb-5 divide-y"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              divideColor: "rgba(255,255,255,0.05)",
            }}
          >
            {steps.map((step, i) => (
              <StepRow key={i} step={step} index={i} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl px-6 py-5 mb-5"
            style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.2)",
              boxShadow: "0 0 24px rgba(34,197,94,0.08)",
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" strokeWidth={2} />
              <div>
                <p className="text-sm font-bold text-white">All steps complete</p>
                <p className="text-xs text-zinc-500">Report generated in 8.3 seconds</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Grade", value: "A-", color: "#a78bfa" },
                { label: "Map",   value: "Mirage", color: "#22D3EE" },
                { label: "Result",value: "13 : 9 Win", color: "#34D399" },
                { label: "K/D",   value: "1.47", color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="rounded-xl px-3.5 py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <p className="text-[10px] text-zinc-500 mb-0.5">{label}</p>
                  <p className="text-sm font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {errorText && (
          <div
            className="rounded-2xl px-4 py-3 mb-5 text-xs text-amber-300"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            {errorText}
          </div>
        )}

        {/* Live counters */}
        {!done && (
          <div
            className="grid grid-cols-2 gap-3 mb-5"
            style={{}}
          >
            {[
              { label: "Events extracted", value: eventsExtracted.toLocaleString() },
              { label: "Rounds processed", value: `${roundsProcessed} / ${totalRounds}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-[10px] text-zinc-500 mb-0.5">{label}</p>
                <p className="font-display text-lg font-black text-white tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {done ? (
          <Link
            href="/matches/m1"
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              boxShadow: "0 0 24px rgba(124,58,237,0.4)",
            }}
          >
            <FileText className="h-4 w-4" strokeWidth={2} />
            Open Report <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs text-zinc-500"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <span>Processing typically takes 15–90 seconds depending on demo size and server load. You can leave this page — we will notify you when it is ready.</span>
          </div>
        )}
      </div>
    </div>
  )
}
