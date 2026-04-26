"use client"

import { useState } from "react"
import {
  Users, CreditCard, Activity, AlertTriangle, RefreshCw,
  CheckCircle2, XCircle, Clock, Zap, BarChart2, Server,
  ChevronRight, ArrowUpRight, Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Mock data ────────────────────────────────────────────────────────────────

const KPI_CARDS = [
  { label: "Total Users",    value: "1,248",  delta: "+34 today", icon: Users,    color: "#7C3AED", bg: "rgba(124,58,237,0.12)" },
  { label: "Active Subs",    value: "312",    delta: "+8 today",  icon: CreditCard,color: "#22D3EE",bg: "rgba(34,211,238,0.10)" },
  { label: "Jobs in Queue",  value: "47",     delta: "processing",icon: Activity,  color: "#F59E0B",bg: "rgba(245,158,11,0.10)" },
  { label: "Failed Jobs",    value: "8",      delta: "last 24h",  icon: AlertTriangle,color:"#EF4444",bg: "rgba(239,68,68,0.10)" },
]

type JobStatus = "processing" | "queued" | "done" | "failed"
interface Job {
  id: string
  matchId: string
  player: string
  map: string
  status: JobStatus
  started: string
  duration?: string
  error?: string
}

const JOBS: Job[] = [
  { id: "job_001", matchId: "m_aab1", player: "stugna.exe",  map: "Mirage",  status: "processing", started: "30s ago" },
  { id: "job_002", matchId: "m_aab2", player: "s1mple",      map: "Inferno", status: "queued",     started: "1m ago" },
  { id: "job_003", matchId: "m_aab3", player: "NiKo",        map: "Dust2",   status: "done",       started: "5m ago",  duration: "18s" },
  { id: "job_004", matchId: "m_aab4", player: "dev1ce",      map: "Nuke",    status: "failed",     started: "12m ago", error: "Demo file corrupted" },
  { id: "job_005", matchId: "m_aab5", player: "sh1ro",       map: "Anubis",  status: "done",       started: "15m ago", duration: "22s" },
  { id: "job_006", matchId: "m_aab6", player: "electronic",  map: "Ancient", status: "failed",     started: "40m ago", error: "FACEIT API timeout" },
]

interface Payment {
  id: string
  player: string
  plan: string
  amount: number
  status: "paid" | "failed" | "refunded"
  date: string
}

const PAYMENTS: Payment[] = [
  { id: "pay_001", player: "stugna.exe",  plan: "Pro Monthly",  amount: 9,  status: "paid",     date: "Apr 26, 2026" },
  { id: "pay_002", player: "s1mple",      plan: "Team Yearly",  amount: 249,status: "paid",     date: "Apr 26, 2026" },
  { id: "pay_003", player: "flamie",      plan: "Pro Monthly",  amount: 9,  status: "failed",   date: "Apr 25, 2026" },
  { id: "pay_004", player: "NiKo",        plan: "Pro Monthly",  amount: 9,  status: "paid",     date: "Apr 25, 2026" },
  { id: "pay_005", player: "dev1ce",      plan: "Pro Yearly",   amount: 79, status: "refunded", date: "Apr 24, 2026" },
]

const USAGE = [
  { label: "CPU", value: 34, color: "#7C3AED" },
  { label: "RAM", value: 61, color: "#22D3EE" },
  { label: "Storage", value: 28, color: "#10B981" },
  { label: "Demo Queue", value: 47, max: 200, color: "#F59E0B" },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: JobStatus | "paid" | "failed" | "refunded" }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    processing: { label: "Processing", color: "#a78bfa", bg: "rgba(124,58,237,0.15)" },
    queued:     { label: "Queued",     color: "#94a3b8", bg: "rgba(255,255,255,0.07)" },
    done:       { label: "Done",       color: "#34d399", bg: "rgba(34,197,94,0.10)" },
    failed:     { label: "Failed",     color: "#f87171", bg: "rgba(239,68,68,0.10)" },
    paid:       { label: "Paid",       color: "#34d399", bg: "rgba(34,197,94,0.10)" },
    refunded:   { label: "Refunded",   color: "#94a3b8", bg: "rgba(255,255,255,0.07)" },
  }
  const s = map[status] ?? map.queued
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  )
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  )
}

// ── Admin page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "payments" | "users">("queue")
  const [retried, setRetried] = useState<string[]>([])

  const handleRetry = (id: string) => {
    setRetried((prev) => [...prev, id])
  }

  return (
    <div className="min-h-screen p-7 pb-16" style={{ background: "#05050A" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <Server className="h-3.5 w-3.5 text-red-400" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Admin</span>
            </div>
            <h1 className="font-display text-2xl font-black text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">System overview · Last updated: just now</p>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {KPI_CARDS.map(({ label, value, delta, icon: Icon, color, bg }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: bg }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color }} strokeWidth={1.8} />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600" />
              </div>
              <p className="font-display text-2xl font-black text-white mb-0.5">{value}</p>
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="text-[11px] mt-1" style={{ color }}>{delta}</p>
            </Card>
          ))}
        </div>

        {/* System Usage */}
        <Card className="p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-zinc-400" strokeWidth={1.8} />
            <h2 className="font-display text-sm font-bold text-white">System Resources</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {USAGE.map(({ label, value, max, color }) => {
              const pct = max ? Math.round((value / max) * 100) : value
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-400">{label}</span>
                    <span className="font-semibold text-white">{max ? `${value}/${max}` : `${value}%`}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color, boxShadow: `0 0 6px ${color}66` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(["queue", "payments", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all"
              style={
                activeTab === t
                  ? { background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.35)" }
                  : { background: "rgba(255,255,255,0.05)", color: "#71717a", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {t === "queue" ? "Processing Queue" : t === "payments" ? "Recent Payments" : "Users"}
            </button>
          ))}
        </div>

        {/* Processing Queue */}
        {activeTab === "queue" && (
          <Card>
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-white">Processing Queue</h2>
              <span className="text-xs text-zinc-500">{JOBS.length} jobs</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {JOBS.map((job) => (
                <div key={job.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-28 shrink-0">
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{job.player}</p>
                    <p className="text-xs text-zinc-500">{job.map} · {job.matchId}</p>
                    {job.error && (
                      <p className="text-[11px] text-red-400 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {job.error}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" /> {job.started}
                    </p>
                    {job.duration && <p className="text-[11px] text-emerald-400">{job.duration}</p>}
                  </div>
                  {job.status === "failed" && (
                    <button
                      onClick={() => handleRetry(job.id)}
                      disabled={retried.includes(job.id)}
                      className={cn(
                        "shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                        retried.includes(job.id)
                          ? "text-emerald-400 cursor-default"
                          : "text-violet-400 hover:text-white",
                      )}
                      style={
                        retried.includes(job.id)
                          ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }
                          : { background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }
                      }
                    >
                      {retried.includes(job.id) ? <><CheckCircle2 className="h-3 w-3 inline mr-1" />Retried</> : "Retry"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Payments */}
        {activeTab === "payments" && (
          <Card>
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-white">Recent Payments</h2>
              <span className="text-xs text-zinc-500">{PAYMENTS.length} transactions</span>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {PAYMENTS.map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{p.player}</p>
                    <p className="text-xs text-zinc-500">{p.plan}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">${p.amount}</p>
                    <p className="text-xs text-zinc-600">{p.date}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-700 shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Users tab placeholder */}
        {activeTab === "users" && (
          <Card className="p-8 text-center">
            <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-zinc-400">User management</p>
            <p className="text-xs text-zinc-600 mt-1">Full user table with search, plan filter, and impersonation — coming soon.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
