"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Bell, FileText, RefreshCw, CreditCard, AlertTriangle,
  CheckCircle2, Zap, Users, Megaphone, Trash2, Check,
  ExternalLink, Clock, X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NotifType = "report" | "match" | "payment" | "system" | "billing" | "team" | "failed"

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  time: string
  read: boolean
  action?: { label: string; href: string }
  badge?: string
}

const INITIAL: Notification[] = [
  {
    id: "n1",
    type: "report",
    title: "Tactical report ready",
    body: "Mirage · 13:9 Victory · Grade A-",
    time: "2 min ago",
    read: false,
    badge: "A-",
    action: { label: "Open Report", href: "/matches/m1" },
  },
  {
    id: "n2",
    type: "match",
    title: "New FACEIT match detected",
    body: "Anubis · Demo downloading — analysis will start automatically",
    time: "18 min ago",
    read: false,
    action: { label: "View Match", href: "/matches" },
  },
  {
    id: "n3",
    type: "failed",
    title: "Demo processing failed",
    body: "Inferno match from Apr 24 — corrupted demo file. You can retry or upload manually.",
    time: "1 hour ago",
    read: false,
    action: { label: "Retry", href: "/upload" },
  },
  {
    id: "n4",
    type: "billing",
    title: "Monthly limit warning",
    body: "You have used 80% of your free monthly limit (3 / 3 demos). Upgrade to continue.",
    time: "3 hours ago",
    read: true,
    action: { label: "Upgrade", href: "/checkout?plan=pro" },
  },
  {
    id: "n5",
    type: "payment",
    title: "Payment successful",
    body: "SYNTRA Pro renewed · $9.00 charged to Visa ····4242",
    time: "Yesterday",
    read: true,
  },
  {
    id: "n6",
    type: "report",
    title: "Tactical report ready",
    body: "Dust2 · 16:14 Victory · Grade B+",
    time: "Yesterday",
    read: true,
    badge: "B+",
    action: { label: "Open Report", href: "/matches" },
  },
  {
    id: "n7",
    type: "system",
    title: "SYNTRA v1.4 released",
    body: "New: Compare mode, team workspace beta, improved heatmap clustering",
    time: "3 days ago",
    read: true,
  },
  {
    id: "n8",
    type: "match",
    title: "New FACEIT match detected",
    body: "Mirage · Demo processed successfully",
    time: "4 days ago",
    read: true,
    action: { label: "View", href: "/matches" },
  },
]

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  report:  { icon: FileText,     color: "text-violet-400",  bg: "rgba(124,58,237,0.12)" },
  match:   { icon: RefreshCw,    color: "text-cyan-400",    bg: "rgba(34,211,238,0.10)" },
  payment: { icon: CreditCard,   color: "text-emerald-400", bg: "rgba(34,197,94,0.10)" },
  billing: { icon: Zap,          color: "text-amber-400",   bg: "rgba(245,158,11,0.10)" },
  system:  { icon: Megaphone,    color: "text-zinc-400",    bg: "rgba(255,255,255,0.07)" },
  team:    { icon: Users,        color: "text-sky-400",     bg: "rgba(14,165,233,0.10)" },
  failed:  { icon: AlertTriangle,color: "text-red-400",     bg: "rgba(239,68,68,0.10)" },
}

const FILTERS = ["All", "Unread", "Reports", "Matches", "Billing", "System"] as const
type Filter = typeof FILTERS[number]

function groupByDay(notifs: Notification[]) {
  const today: Notification[] = []
  const earlier: Notification[] = []

  for (const n of notifs) {
    if (n.time.includes("min") || n.time.includes("hour") || n.time === "Just now") {
      today.push(n)
    } else {
      earlier.push(n)
    }
  }
  return { today, earlier }
}

function NotifRow({
  n,
  onRead,
  onDelete,
}: { n: Notification; onRead: (id: string) => void; onDelete: (id: string) => void }) {
  const meta = TYPE_META[n.type]
  const Icon = meta.icon

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 rounded-2xl px-4 py-4 transition-all",
        !n.read && "border-l-2",
      )}
      style={{
        background: n.read ? "rgba(255,255,255,0.025)" : "rgba(124,58,237,0.06)",
        border: n.read ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(124,58,237,0.18)",
        borderLeftColor: !n.read ? "#7C3AED" : undefined,
      }}
    >
      {/* Icon */}
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: meta.bg }}
      >
        <Icon className={cn("h-4 w-4", meta.color)} strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <p className={cn("text-sm font-semibold leading-snug", n.read ? "text-zinc-300" : "text-white")}>
            {n.title}
            {n.badge && (
              <span
                className="ml-2 inline-flex items-center rounded-full px-1.5 py-0 text-[10px] font-black"
                style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}
              >
                {n.badge}
              </span>
            )}
          </p>
          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {!n.read && (
              <button
                onClick={() => onRead(n.id)}
                title="Mark as read"
                className="rounded-lg p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => onDelete(n.id)}
              title="Dismiss"
              className="rounded-lg p-1 text-zinc-500 hover:text-red-400 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed mb-2">{n.body}</p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] text-zinc-600">
            <Clock className="h-3 w-3" /> {n.time}
          </span>
          {n.action && (
            <Link
              href={n.action.href}
              onClick={() => onRead(n.id)}
              className="flex items-center gap-1 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              {n.action.label} <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!n.read && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-violet-500" style={{ boxShadow: "0 0 6px #7C3AED" }} />
      )}
    </div>
  )
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL)
  const [filter, setFilter] = useState<Filter>("All")

  const unreadCount = notifs.filter((n) => !n.read).length

  const markRead = (id: string) =>
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const dismiss = (id: string) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id))

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))

  const clearAll = () =>
    setNotifs((prev) => prev.filter((n) => !n.read))

  const filtered = notifs.filter((n) => {
    if (filter === "All")     return true
    if (filter === "Unread")  return !n.read
    if (filter === "Reports") return n.type === "report"
    if (filter === "Matches") return n.type === "match"
    if (filter === "Billing") return n.type === "billing" || n.type === "payment"
    if (filter === "System")  return n.type === "system"
    return true
  })

  const { today, earlier } = groupByDay(filtered)

  return (
    <div className="min-h-screen p-7 pb-16" style={{ background: "#05050A" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="font-display text-2xl font-black text-white tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span
                  className="flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
                  style={{ background: "#7C3AED", boxShadow: "0 0 10px rgba(124,58,237,0.5)" }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500">Stay updated on reports, syncs, and billing</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear read
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all"
              style={
                filter === f
                  ? { background: "rgba(124,58,237,0.25)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.4)" }
                  : { background: "rgba(255,255,255,0.05)", color: "#71717a", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Bell className="h-6 w-6 text-zinc-600" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-zinc-400 mb-1">No notifications</p>
            <p className="text-xs text-zinc-600">
              {filter === "Unread" ? "You are all caught up." : "Nothing here yet."}
            </p>
          </div>
        )}

        {/* Today */}
        {today.length > 0 && (
          <section className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Today</p>
            <div className="space-y-2">
              {today.map((n) => (
                <NotifRow key={n.id} n={n} onRead={markRead} onDelete={dismiss} />
              ))}
            </div>
          </section>
        )}

        {/* Earlier */}
        {earlier.length > 0 && (
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Earlier</p>
            <div className="space-y-2">
              {earlier.map((n) => (
                <NotifRow key={n.id} n={n} onRead={markRead} onDelete={dismiss} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
