"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import {
  CheckCircle2, Clock, Loader2, AlertTriangle,
  FileText, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getDemoJob, getDemoReport, type DemoJobPayload, type DemoReportPayload } from "@/lib/demo-api"

type StepStatus = "done" | "active" | "pending" | "failed"

interface Step {
  label: string
  status: StepStatus
}

const INITIAL_STEPS: Step[] = [
  { label: "Uploading demo", status: "done" },
  { label: "Parsing events", status: "active" },
  { label: "Extracting positions", status: "pending" },
  { label: "Calculating metrics", status: "pending" },
  { label: "Generating report", status: "pending" },
]

function StepRow({ step, index }: { step: Step; index: number }) {
  return (
    <div className={cn("flex items-center gap-4 py-2.5 transition-opacity", step.status === "pending" && "opacity-40")}>
      <div className="w-6 flex justify-center shrink-0">
        {step.status === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-400" strokeWidth={2} />}
        {step.status === "active" && <Loader2 className="h-5 w-5 text-violet-400 animate-spin" strokeWidth={2} />}
        {step.status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-zinc-700" />}
        {step.status === "failed" && <AlertTriangle className="h-5 w-5 text-red-400" strokeWidth={2} />}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium transition-colors",
            step.status === "done" && "text-zinc-300",
            step.status === "active" && "text-white font-semibold",
            step.status === "pending" && "text-zinc-600",
            step.status === "failed" && "text-red-400",
          )}
        >
          Step {index + 1}/{INITIAL_STEPS.length} — {step.label}
        </p>
      </div>

      <span
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5",
          step.status === "done" && "bg-emerald-500/10 text-emerald-400",
          step.status === "active" && "bg-violet-500/15 text-violet-300",
          step.status === "pending" && "bg-white/5 text-zinc-600",
          step.status === "failed" && "bg-red-500/10 text-red-400",
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
      <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(124,58,237,0.15)" }} />
      <div className="absolute inset-6 rounded-full" style={{ border: "1px solid rgba(124,58,237,0.2)" }} />
      <div className="absolute inset-12 rounded-full" style={{ border: "1px solid rgba(124,58,237,0.3)" }} />
      <div
        className="absolute inset-0 rounded-full animate-radar"
        style={{ background: "conic-gradient(from 0deg, transparent 70%, rgba(124,58,237,0.35) 100%)" }}
      />
      <div className="absolute inset-3 rounded-full animate-radar-reverse" style={{ border: "1px dashed rgba(34,211,238,0.18)" }} />
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

function stepsFromJob(job: DemoJobPayload | null): Step[] {
  if (!job) return INITIAL_STEPS
  if (job.status === "failed") return INITIAL_STEPS.map((s, idx) => ({ ...s, status: idx === 1 ? "failed" : idx === 0 ? "done" : "pending" }))
  if (job.status === "completed") return INITIAL_STEPS.map((s) => ({ ...s, status: "done" }))

  return INITIAL_STEPS.map((s, idx) => ({
    ...s,
    status: idx <= 1 ? "done" : idx === 2 ? "active" : "pending",
  }))
}

export default function ProcessingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params)

  const [job, setJob] = useState<DemoJobPayload | null>(null)
  const [report, setReport] = useState<DemoReportPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const poll = async () => {
      try {
        const jobPayload = await getDemoJob(jobId)
        if (!active) return
        setJob(jobPayload)

        if (jobPayload.status === "completed") {
          const reportPayload = await getDemoReport(jobId)
          if (!active) return
          setReport(reportPayload)
          return
        }

        if (jobPayload.status === "failed") {
          setError(jobPayload.error_message || "Demo analysis failed")
          return
        }

        setTimeout(poll, 2000)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Could not fetch job status")
      }
    }

    poll()

    return () => {
      active = false
    }
  }, [jobId])

  const done = job?.status === "completed" && !!report
  const progress = done ? 100 : job?.status === "processing" ? 65 : 20
  const steps = stepsFromJob(job)

  const radarFrames = job?.result?.analysis?.radar?.total_sampled_frames ?? 0
  const map = report?.report.map ?? job?.result?.analysis?.metrics?.map ?? "Unknown"
  const rounds = report?.report.rounds ?? job?.result?.analysis?.metrics?.rounds ?? 0
  const score = report?.report.score
  const stats = report?.report.player_stats

  return (
    <div className="min-h-screen p-7 pb-16 flex flex-col items-center" style={{ background: "#05050A" }}>
      <div className="w-full max-w-lg mt-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-black text-white tracking-tight mb-1">
            {done ? "Tactical Report Ready" : "Processing Tactical Report"}
          </h1>
          <p className="text-sm text-zinc-500">
            {done ? "Your match analysis is complete." : `Job ID: ${jobId}`}
          </p>
        </div>

        <RadarAnimation progress={progress} />

        {error ? (
          <div className="rounded-2xl px-6 py-4 mb-5 border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
            {error}
          </div>
        ) : !done ? (
          <div
            className="rounded-2xl px-6 py-4 mb-5 divide-y"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
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
                <p className="text-xs text-zinc-500">Parsed with backend AWPY pipeline</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Map", value: map || "-", color: "#22D3EE" },
                { label: "Score", value: score ? `${score.ct ?? "?"}:${score.t ?? "?"}` : "-", color: "#34D399" },
                { label: "K/D", value: stats?.kd !== undefined ? String(stats.kd) : "-", color: "#F59E0B" },
                { label: "ADR", value: stats?.adr !== undefined ? String(stats.adr) : "-", color: "#A78BFA" },
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

        {!done && !error && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Sampled radar frames", value: radarFrames.toLocaleString() },
              { label: "Rounds parsed", value: rounds ? String(rounds) : "processing..." },
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

        {done ? (
          <Link
            href={`/matches/m1?jobId=${jobId}`}
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
            <span>Backend parser is running. This page auto-refreshes status every 2 seconds.</span>
          </div>
        )}
      </div>
    </div>
  )
}
