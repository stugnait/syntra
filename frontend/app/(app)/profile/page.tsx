"use client"

import { useState } from "react"
import {
  User, Shield, Link2, RefreshCw, Trash2, AlertTriangle,
  Eye, EyeOff, CheckCircle2, XCircle, Globe, Lock,
  ExternalLink, Copy, ChevronRight,
} from "lucide-react"

const FACEIT_LEVEL_COLORS: Record<number, string> = {
  1: "#EEE1C6", 2: "#EEE1C6", 3: "#1CE400", 4: "#1CE400",
  5: "#FFCC00", 6: "#FFCC00", 7: "#FF8A00", 8: "#FF8A00",
  9: "#FE1F00", 10: "#FE1F00",
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-sm font-bold text-white mb-4">{children}</h2>
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
        style={{ background: checked ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.1)" }}
        aria-pressed={checked}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const faceitLevel = 8
  const levelColor = FACEIT_LEVEL_COLORS[faceitLevel]

  const [publicProfile, setPublicProfile] = useState(true)
  const [showMatchHistory, setShowMatchHistory] = useState(true)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showDeleteMatch, setShowDeleteMatch] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [steamDisconnected, setSteamDisconnected] = useState(false)
  const [faceitReconnecting, setFaceitReconnecting] = useState(false)
  const [faceitReconnected, setFaceitReconnected] = useState(false)
  const [avatarEditing, setAvatarEditing] = useState(false)

  const handleFaceitReconnect = () => {
    setFaceitReconnecting(true)
    setTimeout(() => { setFaceitReconnecting(false); setFaceitReconnected(true) }, 2000)
    setTimeout(() => setFaceitReconnected(false), 4500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText("syntra.gg/u/stugna-exe")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen p-7 pb-16" style={{ background: "#05050A" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Profile</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your player identity and connections</p>
        </div>

        {/* Player Card */}
        <Card className="mb-4 flex items-center gap-5">
          <div className="relative shrink-0">
            <div
              className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
              style={{
                background: "linear-gradient(135deg, #2D1B69 0%, #1B1B4B 100%)",
                border: "2px solid rgba(124,58,237,0.4)",
                boxShadow: "0 0 20px rgba(124,58,237,0.25)",
              }}
            >
              S
            </div>
            <div
              className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{
                background: "#0D0D1A",
                border: `2px solid ${levelColor}`,
                color: levelColor,
                boxShadow: `0 0 10px ${levelColor}55`,
              }}
            >
              {faceitLevel}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-xl font-black text-white leading-none mb-2">stugna.exe</h2>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{ background: `${levelColor}18`, color: levelColor, border: `1px solid ${levelColor}35` }}
              >
                <Shield className="h-3 w-3" /> FACEIT LVL {faceitLevel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                1842 ELO
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/[0.05] text-zinc-400 border border-white/[0.07]">
                124 matches analyzed
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>syntra.gg/u/stugna-exe</span>
              <button onClick={handleCopy} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <button
            onClick={() => setAvatarEditing(true)}
            className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <User className="h-3.5 w-3.5" /> {avatarEditing ? "Coming Soon" : "Edit Avatar"}
          </button>
        </Card>

        {/* Connections */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Steam */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black text-white"
                style={{ background: "linear-gradient(135deg, #1b2838, #2a475e)" }}
              >
                ST
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Steam</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </p>
              </div>
            </div>
            <div className="rounded-xl px-3 py-2 mb-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] text-zinc-500 mb-0.5">SteamID64</p>
              <p className="text-xs font-mono text-zinc-300">76561198123456789</p>
            </div>
            <div className="flex gap-2">
              <a
                href="https://store.steampowered.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <ExternalLink className="h-3 w-3" /> View
              </a>
              <button
                onClick={() => setSteamDisconnected((v) => !v)}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
                style={
                  steamDisconnected
                    ? { background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ADE80" }
                    : { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#F87171" }
                }
              >
                <XCircle className="h-3 w-3" /> {steamDisconnected ? "Reconnect" : "Disconnect"}
              </button>
            </div>
          </Card>

          {/* FACEIT */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black text-white"
                style={{ background: "linear-gradient(135deg, #FF5500, #CC4400)" }}
              >
                FC
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">FACEIT</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </p>
              </div>
            </div>
            <div className="rounded-xl px-3 py-2 mb-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <p className="text-[10px] text-zinc-500 mb-0.5">FACEIT Player ID</p>
              <p className="text-xs font-mono text-zinc-300">a1b2c3d4-e5f6-7890</p>
            </div>
            <div className="flex gap-2">
              <a
                href="https://www.faceit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <ExternalLink className="h-3 w-3" /> View
              </a>
              <button
                onClick={handleFaceitReconnect}
                disabled={faceitReconnecting}
                className="flex-1 flex items-center justify-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60"
                style={{
                  background: faceitReconnected ? "rgba(34,197,94,0.08)" : "rgba(124,58,237,0.08)",
                  border: faceitReconnected ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(124,58,237,0.2)",
                  color: faceitReconnected ? "#4ADE80" : "#A78BFA",
                }}
              >
                <RefreshCw className={`h-3 w-3 ${faceitReconnecting ? "animate-spin" : ""}`} />
                {faceitReconnecting ? "Connecting..." : faceitReconnected ? "Connected!" : "Reconnect"}
              </button>
            </div>
          </Card>
        </div>

        {/* Subscription status */}
        <Card className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
            >
              <Shield className="h-5 w-5 text-violet-400" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">SYNTRA Pro</p>
              <p className="text-xs text-zinc-500">Active · renews May 26, 2026</p>
            </div>
          </div>
          <a
            href="/billing"
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-violet-300 hover:text-white transition-colors"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
          >
            Manage Billing <ChevronRight className="h-3.5 w-3.5" />
          </a>
        </Card>

        {/* Public Profile */}
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-zinc-400" strokeWidth={1.8} />
            <SectionTitle>Public Profile</SectionTitle>
          </div>
          <p className="text-xs text-zinc-500 mb-4 -mt-3">
            Control what others can see on your public profile page at{" "}
            <span className="text-zinc-400">syntra.gg/u/stugna-exe</span>
          </p>
          <Toggle
            label="Make profile public"
            description="Your profile is visible to anyone with the link"
            checked={publicProfile}
            onChange={setPublicProfile}
          />
          <Toggle
            label="Show match history"
            description="Display your recent matches on your public profile"
            checked={showMatchHistory}
            onChange={setShowMatchHistory}
          />
          <Toggle
            label="Show recommendations"
            description="Display your AI coaching recommendations publicly"
            checked={showRecommendations}
            onChange={setShowRecommendations}
          />
          {!publicProfile && (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-zinc-400"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Lock className="h-3.5 w-3.5 shrink-0" />
              Your profile is private. Only you can see your data.
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card style={{ border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.8} />
            <h2 className="font-display text-sm font-bold text-red-400">Danger Zone</h2>
          </div>
          <div className="space-y-3">
            {/* Delete match history */}
            <div className="flex items-center justify-between gap-4 py-3 border-b border-red-500/10">
              <div>
                <p className="text-sm font-medium text-white">Delete match history</p>
                <p className="text-xs text-zinc-500 mt-0.5">Permanently remove all analyzed matches and reports. Cannot be undone.</p>
              </div>
              <button
                onClick={() => setShowDeleteMatch(true)}
                className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete History
              </button>
            </div>
            {/* Delete account */}
            <div className="flex items-center justify-between gap-4 pt-1">
              <div>
                <p className="text-sm font-medium text-white">Delete account</p>
                <p className="text-xs text-zinc-500 mt-0.5">Permanently delete your SYNTRA account, all data, and cancel your subscription.</p>
              </div>
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Account
              </button>
            </div>
          </div>

          {/* Confirm delete match history */}
          {showDeleteMatch && (
            <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-sm font-semibold text-red-300 mb-1">Are you sure?</p>
              <p className="text-xs text-zinc-400 mb-3">This will permanently delete all 124 analyzed matches and tactical reports.</p>
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-xl py-2 text-xs font-semibold text-white"
                  style={{ background: "rgba(239,68,68,0.7)" }}
                >
                  Yes, delete all matches
                </button>
                <button
                  onClick={() => setShowDeleteMatch(false)}
                  className="flex-1 rounded-xl py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Confirm delete account */}
          {showDeleteAccount && (
            <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-sm font-semibold text-red-300 mb-1">This is irreversible</p>
              <p className="text-xs text-zinc-400 mb-3">Your account, subscription, all matches, and reports will be permanently deleted.</p>
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-xl py-2 text-xs font-semibold text-white"
                  style={{ background: "rgba(239,68,68,0.7)" }}
                >
                  Delete my account
                </button>
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex-1 rounded-xl py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
