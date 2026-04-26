"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CreditCard,
  Download,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ChevronRight,
  HardDrive,
  Users,
  FileText,
} from "lucide-react"
import {
  MOCK_SUBSCRIPTION,
  MOCK_INVOICES,
  getPlan,
  type MockInvoice,
} from "@/lib/billing-data"

// ── Cancel confirmation modal ────────────────────────────────────────────────
function CancelModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-8"
        style={{
          background: "rgba(10,10,20,0.98)",
          border: "1px solid rgba(239,68,68,0.3)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        <h2 className="font-display text-lg font-bold text-white">
          Cancel SYNTRA Pro?
        </h2>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          You will keep Pro access until{" "}
          <span className="text-white font-medium">May 26, 2026</span>. After
          that, your account returns to the Free plan.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              boxShadow: "0 0 18px rgba(124,58,237,0.35)",
            }}
          >
            Keep Pro
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-red-500/30 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            Cancel Renewal
          </button>
        </div>
      </div>
    </>
  )
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ElementType; label: string; color: string; bg: string; border: string }> = {
    active:   { icon: CheckCircle,  label: "Active",   color: "text-emerald-400", bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.25)" },
    trialing: { icon: Clock,        label: "Trial",    color: "text-cyan-400",    bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.25)" },
    past_due: { icon: AlertTriangle,label: "Past Due", color: "text-amber-400",   bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
    canceled: { icon: XCircle,      label: "Canceled", color: "text-zinc-400",    bg: "rgba(255,255,255,0.04)",border: "rgba(255,255,255,0.1)" },
    expired:  { icon: XCircle,      label: "Expired",  color: "text-red-400",     bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)" },
  }
  const cfg = map[status] ?? map.active
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {cfg.label}
    </span>
  )
}

// ── Invoice status ────────────────────────────────────────────────────────────
function InvoiceStatus({ status }: { status: MockInvoice["status"] }) {
  const map = {
    paid:     "text-emerald-400",
    failed:   "text-red-400",
    refunded: "text-cyan-400",
    pending:  "text-amber-400",
  }
  return (
    <span className={`text-xs font-semibold capitalize ${map[status]}`}>{status}</span>
  )
}

// ── Usage bar ─────────────────────────────────────────────────────────────────
function UsageBar({ used, max, label, icon: Icon }: { used: number; max: number; label: string; icon: React.ElementType }) {
  const pct = Math.min(Math.round((used / max) * 100), 100)
  const isHigh = pct >= 80
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Icon className="h-3.5 w-3.5 text-zinc-500" strokeWidth={1.8} />
          {label}
        </div>
        <span className={`text-xs font-semibold font-mono ${isHigh ? "text-amber-400" : "text-zinc-300"}`}>
          {used} / {max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isHigh
              ? "linear-gradient(90deg, #F59E0B, #EF4444)"
              : "linear-gradient(90deg, #7C3AED, #22D3EE)",
            boxShadow: isHigh
              ? "0 0 8px rgba(245,158,11,0.4)"
              : "0 0 8px rgba(124,58,237,0.35)",
          }}
        />
      </div>
      {isHigh && (
        <p className="mt-1 text-[11px] text-amber-400/80">
          You have used {pct}% of your monthly limit.{" "}
          <Link href="/checkout?plan=pro&interval=monthly" className="underline underline-offset-2">
            Upgrade plan
          </Link>
        </p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const [cancelOpen, setCancelOpen]               = useState(false)
  const [refreshing, setRefreshing]               = useState(false)
  const [updatingPayment, setUpdatingPayment]     = useState(false)
  const [paymentUpdated, setPaymentUpdated]       = useState(false)
  const [downloadedInvoice, setDownloadedInvoice] = useState<string | null>(null)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const handleUpdatePayment = () => {
    setUpdatingPayment(true)
    setTimeout(() => { setUpdatingPayment(false); setPaymentUpdated(true) }, 1800)
    setTimeout(() => setPaymentUpdated(false), 4000)
  }

  const handleDownloadInvoice = (id: string) => {
    setDownloadedInvoice(id)
    setTimeout(() => setDownloadedInvoice(null), 2000)
  }
  const sub = MOCK_SUBSCRIPTION
  const plan = getPlan(sub.plan)
  const price =
    sub.interval === "monthly" ? plan.prices.monthly : Math.round(plan.prices.yearly / 12)

  return (
    <>
      <div className="min-h-screen p-7 pb-16" style={{ background: "#05050A" }}>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-white">Billing</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your SYNTRA subscription and invoices.
          </p>
        </div>

        <div className="flex flex-col gap-5 max-w-3xl">

          {/* ── Current Plan ────────────────────────────────────────────── */}
          <section
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Current Plan
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-1.5"
                    style={{
                      background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(34,211,238,0.08))",
                      border: "1px solid rgba(124,58,237,0.3)",
                    }}
                  >
                    <Zap className="h-3.5 w-3.5 text-violet-400" strokeWidth={2} />
                    <span className="font-display text-sm font-bold text-white">
                      SYNTRA {plan.name}
                    </span>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-zinc-400">
                    <span className="text-white font-semibold font-mono">${price}</span>
                    {" / "}{sub.interval === "monthly" ? "month" : "month, billed yearly"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {sub.cancelAtPeriodEnd
                      ? `Cancels on ${sub.currentPeriodEnd}`
                      : `Renews on ${sub.currentPeriodEnd}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-violet-500/40 hover:text-white"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  Change Plan
                </Link>
                <button
                  onClick={() => setCancelOpen(true)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-red-400"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </section>

          {/* ── Usage ───────────────────────────────────────────────────── */}
          <section
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-5">
              Usage this month
            </p>
            <div className="flex flex-col gap-5">
              <UsageBar
                used={sub.usage.demoReportsUsed}
                max={plan.limits.monthlyDemoLimit ?? 999}
                label="Demo reports analyzed"
                icon={FileText}
              />
              <UsageBar
                used={Math.round(sub.usage.storageGB * 10)}
                max={plan.limits.storageGB * 10}
                label={`Storage used (${sub.usage.storageGB} GB / ${plan.limits.storageGB} GB)`}
                icon={HardDrive}
              />
              <UsageBar
                used={sub.usage.teamSeats}
                max={plan.limits.teamSeats}
                label="Team seats"
                icon={Users}
              />
            </div>
          </section>

          {/* ── Payment Method ───────────────────────────────────────────── */}
          <section
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Payment Method
            </p>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <CreditCard className="h-4.5 w-4.5 text-zinc-300" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {sub.paymentMethod.brand} ending {sub.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Expires {sub.paymentMethod.expMonth}/{sub.paymentMethod.expYear}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUpdatePayment}
                disabled={updatingPayment}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium transition-colors hover:border-white/20 hover:text-white disabled:opacity-60"
                style={{ color: paymentUpdated ? "#34D399" : "#D4D4D8" }}
              >
                {updatingPayment ? "Redirecting..." : paymentUpdated ? "Method Updated" : "Update Payment Method"}
              </button>
            </div>
          </section>

          {/* ── Invoices ─────────────────────────────────────────────────── */}
          <section
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Invoice history
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="flex flex-col gap-0">
              {MOCK_INVOICES.map((inv, i) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 py-3 text-sm"
                  style={{
                    borderBottom:
                      i < MOCK_INVOICES.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                  }}
                >
                  <span className="w-28 text-zinc-400 text-xs font-mono">{inv.date}</span>
                  <span className="flex-1 text-zinc-300">{inv.plan}</span>
                  <span className="font-mono text-sm font-semibold text-white">
                    ${inv.amount}
                  </span>
                  <InvoiceStatus status={inv.status} />
                  <button
                    onClick={() => handleDownloadInvoice(inv.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-white/[0.05]"
                    style={{ color: downloadedInvoice === inv.id ? "#34D399" : "#71717a" }}
                    aria-label="Download invoice"
                  >
                    {downloadedInvoice === inv.id
                      ? <CheckCircle className="h-3.5 w-3.5" />
                      : <Download className="h-3.5 w-3.5" />}
                    {downloadedInvoice === inv.id ? "Saved" : "PDF"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ── Upgrade CTA (for Free users) — shown as illustration ─────── */}
          <section
            className="rounded-2xl p-6 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(34,211,238,0.04))",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <p className="font-display text-base font-bold text-white mb-1">
              Need more power?
            </p>
            <p className="text-sm text-zinc-400 mb-4">
              Upgrade to Team to unlock shared workspaces, coach notes, and team analytics.
            </p>
            <Link
              href="/checkout?plan=team&interval=monthly"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                boxShadow: "0 0 20px rgba(124,58,237,0.35)",
              }}
            >
              <Zap className="h-4 w-4" strokeWidth={2} />
              Explore Team Plan
            </Link>
          </section>

        </div>
      </div>

      {cancelOpen && <CancelModal onClose={() => setCancelOpen(false)} />}
    </>
  )
}
