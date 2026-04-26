"use client"

import { useState } from "react"
import {
  Bug, Lightbulb, MessageSquare, ChevronDown, ChevronUp,
  CheckCircle2, ExternalLink, Zap, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "Why did my demo fail to process?",
    a: "Demos can fail due to a corrupted file, an expired FACEIT download link (they expire after 24h), or an unsupported demo version. Try re-uploading the demo manually or clicking Retry in your matches list.",
  },
  {
    q: "How long does processing take?",
    a: "Most demos finish in 15–60 seconds depending on the number of rounds and server load. If your demo has been queued for more than 5 minutes, it may have hit an error — check the Matches page.",
  },
  {
    q: "Why is FACEIT auto-sync not finding my matches?",
    a: "Make sure your FACEIT account is connected in Profile settings, and that auto-sync is enabled in Settings → Sync. FACEIT webhook events can occasionally be delayed by up to 10 minutes.",
  },
  {
    q: "Can I export my match data?",
    a: "Yes — go to Settings → Data and request a full data export in JSON, CSV, or PDF format. The export link is emailed to you within a few minutes.",
  },
  {
    q: "Does SYNTRA support CS2 Premier matches?",
    a: "Yes. Both CS2 Matchmaking (Premier / Competitive) and FACEIT matches are supported. Upload the .dem file manually or use FACEIT auto-sync.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Billing → Manage Subscription and click Cancel Plan. You keep Pro access until the end of the billing period.",
  },
]

type Category = "bug" | "feature" | "billing" | "other"

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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border-b border-white/[0.06] last:border-0 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <p className="text-sm font-medium text-white">{q}</p>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 text-zinc-500" />
          : <ChevronDown className="h-4 w-4 shrink-0 text-zinc-500" />
        }
      </div>
      {open && (
        <p className="px-5 pb-4 text-sm text-zinc-400 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function SupportPage() {
  const [category, setCategory] = useState<Category>("bug")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setSubmitted(true)
  }

  const QUICK_ACTIONS = [
    {
      icon: Bug,
      label: "Report a Bug",
      desc: "Something is broken or behaving unexpectedly",
      color: "#EF4444",
      bg: "rgba(239,68,68,0.10)",
      id: "bug" as Category,
    },
    {
      icon: Lightbulb,
      label: "Request a Feature",
      desc: "Suggest an improvement or new capability",
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.10)",
      id: "feature" as Category,
    },
    {
      icon: AlertCircle,
      label: "Billing Issue",
      desc: "Payment failed, wrong charge, or refund request",
      color: "#22D3EE",
      bg: "rgba(34,211,238,0.10)",
      id: "billing" as Category,
    },
    {
      icon: MessageSquare,
      label: "General Question",
      desc: "Anything else you need help with",
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.10)",
      id: "other" as Category,
    },
  ]

  return (
    <div className="min-h-screen p-7 pb-16" style={{ background: "#05050A" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Support</h1>
          <p className="text-sm text-zinc-500 mt-1">Need help with SYNTRA? We respond within 24 hours.</p>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, color, bg, id }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className="flex items-start gap-3 rounded-2xl p-4 text-left transition-all hover:opacity-90"
              style={
                category === id
                  ? { background: bg, border: `1px solid ${color}40`, boxShadow: `0 0 16px ${color}15` }
                  : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: category === id ? bg : "rgba(255,255,255,0.06)" }}
              >
                <Icon className="h-4 w-4" style={{ color: category === id ? color : "#71717a" }} strokeWidth={1.8} />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", category === id ? "text-white" : "text-zinc-300")}>{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Contact form */}
        <Card className="p-6 mb-6">
          <h2 className="font-display text-sm font-bold text-white mb-4">Contact Support</h2>
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center gap-3">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                <CheckCircle2 className="h-7 w-7 text-emerald-400" strokeWidth={1.8} />
              </div>
              <p className="text-sm font-bold text-white">Message sent!</p>
              <p className="text-xs text-zinc-500 max-w-xs">
                We have received your report and will respond within 24 hours to the email linked to your account.
              </p>
              <button
                onClick={() => { setSubmitted(false); setSubject(""); setMessage("") }}
                className="mt-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category pill display */}
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {QUICK_ACTIONS.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCategory(id)}
                      className="rounded-full px-3 py-1 text-xs font-semibold transition-all"
                      style={
                        category === id
                          ? { background: "rgba(124,58,237,0.2)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,0.4)" }
                          : { background: "rgba(255,255,255,0.05)", color: "#71717a", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">Subject</label>
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Short description of your issue"
                  className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what happened, what you expected, and any steps to reproduce..."
                  rows={5}
                  className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.3)",
                }}
              >
                <Zap className="h-4 w-4" strokeWidth={2} /> Send Message
              </button>
            </form>
          )}
        </Card>

        {/* External resources */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Documentation", desc: "Guides & how-to articles", href: "#" },
            { label: "Status Page",   desc: "System & service status",  href: "#" },
            { label: "Discord",       desc: "Community & fast support", href: "#" },
          ].map(({ label, desc, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center justify-between gap-2 rounded-2xl px-4 py-3.5 transition-all hover:bg-white/[0.04]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            </a>
          ))}
        </div>

        {/* FAQ */}
        <Card>
          <div className="px-5 py-3 border-b border-white/[0.06]">
            <h2 className="font-display text-sm font-bold text-white">Frequently Asked Questions</h2>
          </div>
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </Card>
      </div>
    </div>
  )
}
