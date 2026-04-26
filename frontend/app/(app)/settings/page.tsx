"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
  Settings, RefreshCw, Bell, Lock, Palette, Database,
  Monitor, Moon, Sun, Download, Trash2, ChevronRight,
  Globe, AlertTriangle, CheckCircle2, Volume2, VolumeX,
} from "lucide-react"

// ── Shared primitives ────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
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

function SelectField({
  label,
  value,
  options,
  onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.05] last:border-0">
      <p className="text-sm font-medium text-white">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl px-3 py-1.5 text-xs font-medium text-white outline-none cursor-pointer"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

// ── Tab content components ────────────────────────────────────────────────────

function GeneralTab() {
  const [username, setUsername] = useState("stugna.exe")
  const [region, setRegion] = useState("EU West")
  const [language, setLanguage] = useState("English")
  const [timezone, setTimezone] = useState("UTC+2 (Kyiv)")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-4">Account Info</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Display Name</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Email</label>
            <input
              defaultValue="stugna@gmail.com"
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-zinc-400 outline-none cursor-not-allowed"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              readOnly
            />
            <p className="text-[10px] text-zinc-600 mt-1">Email is linked to your auth provider and cannot be changed here.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-2">Locale</h3>
        <SelectField label="Region" value={region} options={["EU West", "EU East", "NA", "CIS", "Asia"]} onChange={setRegion} />
        <SelectField label="Language" value={language} options={["English", "Ukrainian", "Russian", "German", "French"]} onChange={setLanguage} />
        <SelectField label="Timezone" value={timezone} options={["UTC+2 (Kyiv)", "UTC+0 (London)", "UTC+1 (Berlin)", "UTC-5 (New York)"]} onChange={setTimezone} />
      </Card>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)", boxShadow: "0 0 16px rgba(124,58,237,0.3)" }}
      >
        {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save Changes"}
      </button>
    </div>
  )
}

function SyncTab() {
  const [autoSync, setAutoSync] = useState(true)
  const [freq, setFreq] = useState("Every 15 minutes")
  const [processAuto, setProcessAuto] = useState(true)
  const [genRecs, setGenRecs] = useState(true)
  const [notifyReady, setNotifyReady] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [countdown] = useState("04:51")

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => setSyncing(false), 2500)
  }

  return (
    <div className="space-y-4">
      {/* FACEIT Auto Sync */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-sm font-bold text-white">FACEIT Auto Sync</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Automatically import new FACEIT matches</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold text-emerald-400">Active</span>
          </div>
        </div>

        <div
          className="rounded-xl px-4 py-3 mb-4 grid grid-cols-3 gap-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <p className="text-[10px] text-zinc-500 mb-0.5">Last sync</p>
            <p className="text-xs font-semibold text-white">5 minutes ago</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 mb-0.5">Next sync</p>
            <p className="text-xs font-semibold text-white">in {countdown}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 mb-0.5">Webhook</p>
            <p className="text-xs font-semibold text-emerald-400">Connected</p>
          </div>
        </div>

        <Toggle label="Enable auto-sync" description="Automatically check for new matches on FACEIT" checked={autoSync} onChange={setAutoSync} />
        <SelectField
          label="Sync frequency"
          value={freq}
          options={["Every 5 minutes", "Every 15 minutes", "Every 30 minutes", "Every hour"]}
          onChange={setFreq}
        />

        <div className="pt-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "rgba(124,58,237,0.5)", border: "1px solid rgba(124,58,237,0.4)" }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </Card>

      {/* Demo Processing */}
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-2">Demo Processing</h3>
        <Toggle label="Process new demos automatically" description="Start analysis immediately when a new match is detected" checked={processAuto} onChange={setProcessAuto} />
        <Toggle label="Generate AI recommendations" description="Run the AI coaching engine after each report is generated" checked={genRecs} onChange={setGenRecs} />
        <Toggle label="Notify when report is ready" description="Receive an in-app notification when analysis completes" checked={notifyReady} onChange={setNotifyReady} />
      </Card>

      {/* FACEIT Webhook */}
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-3">FACEIT Webhook</h3>
        <div className="rounded-xl px-3.5 py-2.5 mb-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <p className="text-[10px] text-zinc-500 mb-0.5">Webhook URL</p>
            <p className="text-xs font-mono text-zinc-300">https://syntra.gg/api/webhooks/faceit/...</p>
          </div>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-emerald-400" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
            Active
          </span>
        </div>
        <p className="text-[11px] text-zinc-600">Register this URL in your FACEIT Developer Console to enable real-time match notifications.</p>
      </Card>
    </div>
  )
}

function NotificationsTab() {
  const [reportReady, setReportReady]           = useState(true)
  const [newMatch, setNewMatch]                 = useState(true)
  const [processFailed, setProcessFailed]       = useState(true)
  const [paymentAlerts, setPaymentAlerts]       = useState(true)
  const [limitWarning, setLimitWarning]         = useState(true)
  const [systemUpdates, setSystemUpdates]       = useState(false)
  const [soundEnabled, setSoundEnabled]         = useState(false)

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-2">In-App Notifications</h3>
        <Toggle label="Report ready" description="Notify when a tactical report finishes processing" checked={reportReady} onChange={setReportReady} />
        <Toggle label="New match detected" description="Notify when a new FACEIT match is found" checked={newMatch} onChange={setNewMatch} />
        <Toggle label="Processing failed" description="Notify when a demo fails to process" checked={processFailed} onChange={setProcessFailed} />
        <Toggle label="Payment & billing alerts" description="Failed payments, renewal reminders, limit warnings" checked={paymentAlerts} onChange={setPaymentAlerts} />
        <Toggle label="Monthly limit warning" description="Alert at 80% and 100% of your monthly demo limit" checked={limitWarning} onChange={setLimitWarning} />
        <Toggle label="System updates" description="Product updates, new features, and maintenance notices" checked={systemUpdates} onChange={setSystemUpdates} />
      </Card>
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-2">Sound</h3>
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            {soundEnabled ? <Volume2 className="h-4 w-4 text-zinc-400" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
            <div>
              <p className="text-sm font-medium text-white">Notification sounds</p>
              <p className="text-xs text-zinc-500 mt-0.5">Play a sound when notifications arrive</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
            style={{ background: soundEnabled ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.1)" }}
            aria-pressed={soundEnabled}
          >
            <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200" style={{ left: soundEnabled ? "calc(100% - 18px)" : "2px" }} />
          </button>
        </div>
      </Card>
    </div>
  )
}

function PrivacyTab() {
  const [shareAnalytics, setShareAnalytics] = useState(true)
  const [crashReports, setCrashReports]     = useState(true)
  const [marketingEmails, setMarketing]     = useState(false)
  const [dataBroker, setDataBroker]         = useState(false)
  const [downloading, setDownloading]       = useState(false)
  const [deleteRequested, setDeleteRequested] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => setDownloading(false), 2200)
  }

  const handleDeletion = () => {
    setDeleteRequested(true)
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-2">Data Sharing</h3>
        <Toggle label="Share anonymous usage analytics" description="Help us improve SYNTRA by sharing anonymous product usage data" checked={shareAnalytics} onChange={setShareAnalytics} />
        <Toggle label="Send crash reports" description="Automatically send error reports to help fix bugs faster" checked={crashReports} onChange={setCrashReports} />
        <Toggle label="Marketing communications" description="Receive emails about new features, tips, and promotions" checked={marketingEmails} onChange={setMarketing} />
        <Toggle label="Appear in partner data" description="Allow us to share aggregated, anonymised stats with research partners" checked={dataBroker} onChange={setDataBroker} />
      </Card>
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-3">Your Data Rights</h3>
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3">
              <Download className="h-4 w-4 text-zinc-400 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-medium text-white">Download my data</p>
                <p className="text-xs text-zinc-500">
                  {downloading ? "Preparing your data export..." : "Export a full copy of all your SYNTRA data"}
                </p>
              </div>
            </div>
            {downloading
              ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              : <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />}
          </button>
          <button
            onClick={handleDeletion}
            className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-red-500/[0.04]"
            style={{ border: deleteRequested ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3">
              <Trash2 className={`h-4 w-4 shrink-0 ${deleteRequested ? "text-red-400" : "text-zinc-400"}`} strokeWidth={1.8} />
              <div>
                <p className={`text-sm font-medium ${deleteRequested ? "text-red-300" : "text-white"}`}>Request data deletion</p>
                <p className="text-xs text-zinc-500">
                  {deleteRequested ? "Request submitted. We will contact you within 30 days." : "Submit a GDPR/CCPA deletion request"}
                </p>
              </div>
            </div>
            {deleteRequested
              ? <CheckCircle2 className="h-4 w-4 text-red-400 shrink-0" />
              : <ChevronRight className="h-4 w-4 text-zinc-600 shrink-0" />}
          </button>
        </div>
      </Card>
    </div>
  )
}

function AppearanceTab() {
  const [accentColor, setAccentColor] = useState("violet")
  const [density, setDensity]         = useState("comfortable")
  const [animations, setAnimations]   = useState(true)

  const accents = [
    { id: "violet", color: "#7C3AED" },
    { id: "cyan",   color: "#06B6D4" },
    { id: "emerald",color: "#10B981" },
    { id: "amber",  color: "#F59E0B" },
    { id: "rose",   color: "#F43F5E" },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-4">Theme</h3>
        <div className="flex gap-3 mb-1">
          {[
            { id: "dark", icon: Moon,    label: "Dark" },
            { id: "light", icon: Sun,    label: "Light" },
            { id: "system", icon: Monitor, label: "System" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className="flex-1 flex flex-col items-center gap-2 rounded-xl py-3 text-xs font-medium transition-all"
              style={
                id === "dark"
                  ? { background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)", color: "#fff" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#71717a" }
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-zinc-600 mt-2">SYNTRA is built for dark mode. Light theme coming soon.</p>
      </Card>

      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-4">Accent Color</h3>
        <div className="flex gap-3">
          {accents.map(({ id, color }) => (
            <button
              key={id}
              onClick={() => setAccentColor(id)}
              className="h-8 w-8 rounded-full transition-transform hover:scale-110"
              style={{
                background: color,
                boxShadow: accentColor === id ? `0 0 14px ${color}88` : "none",
                outline: accentColor === id ? `2px solid ${color}` : "none",
                outlineOffset: "2px",
              }}
              aria-label={id}
            />
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-2">Layout Density</h3>
        <SelectField label="Density" value={density} options={["compact", "comfortable", "spacious"]} onChange={setDensity} />
        <Toggle label="Enable animations" description="Radar animations, transitions, and other motion effects" checked={animations} onChange={setAnimations} />
      </Card>
    </div>
  )
}

function DataTab() {
  const [exportFormat, setExportFormat] = useState("JSON")
  const [exportRequested, setExportRequested] = useState(false)
  const [cacheCleared, setCacheCleared]       = useState(false)

  const handleExport = () => {
    setExportRequested(true)
    setTimeout(() => setExportRequested(false), 3000)
  }

  const handleClearCache = () => {
    setCacheCleared(true)
    setTimeout(() => setCacheCleared(false), 2500)
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-3">Export Your Data</h3>
        <p className="text-xs text-zinc-500 mb-4">Download a complete archive of all your SYNTRA data including match history, reports, and settings.</p>
        <SelectField label="Export format" value={exportFormat} options={["JSON", "CSV", "PDF"]} onChange={setExportFormat} />
        <button
          onClick={handleExport}
          className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {exportRequested
            ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Export Requested</>
            : <><Download className="h-3.5 w-3.5" /> Request Data Export</>}
        </button>
      </Card>

      <Card>
        <h3 className="font-display text-sm font-bold text-white mb-3">Storage Usage</h3>
        <div className="space-y-3">
          {[
            { label: "Demo files",     used: 1.8,  total: 20,  color: "#7C3AED" },
            { label: "Report data",    used: 0.4,  total: 20,  color: "#06B6D4" },
            { label: "Heatmap cache",  used: 0.2,  total: 20,  color: "#10B981" },
          ].map(({ label, used, total, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-400">{label}</span>
                <span className="text-zinc-500">{used} GB / {total} GB</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-full rounded-full" style={{ width: `${(used / total) * 100}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)" }}>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-500" strokeWidth={1.8} />
          <h3 className="font-display text-sm font-bold text-red-400">Clear Cached Data</h3>
        </div>
        <p className="text-xs text-zinc-500 mb-3">This removes locally cached heatmaps and report data. Your raw data is not affected.</p>
        <button
          onClick={handleClearCache}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:bg-red-500/10"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: cacheCleared ? "#34D399" : "#F87171",
          }}
        >
          {cacheCleared
            ? <><CheckCircle2 className="h-3.5 w-3.5" /> Cache Cleared</>
            : <><Trash2 className="h-3.5 w-3.5" /> Clear Cache</>}
        </button>
      </Card>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "general",       label: "General",       icon: Settings },
  { id: "sync",          label: "Sync",          icon: RefreshCw },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy",       label: "Privacy",       icon: Lock },
  { id: "appearance",   label: "Appearance",    icon: Palette },
  { id: "data",          label: "Data",          icon: Database },
] as const

type TabId = typeof TABS[number]["id"]

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as TabId | null
  const [activeTab, setActiveTab] = useState<TabId>(
    tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : "general"
  )

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <div className="min-h-screen p-7 pb-16" style={{ background: "#05050A" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-7">
          <h1 className="font-display text-2xl font-black text-white tracking-tight">Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Customize how SYNTRA works for your account</p>
        </div>

        <div className="flex gap-6">
          {/* Left menu */}
          <aside className="w-48 shrink-0">
            <nav className="space-y-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="w-full flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-medium text-left transition-all duration-150"
                  style={
                    activeTab === id
                      ? {
                          background: "linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(34,211,238,0.08) 100%)",
                          boxShadow: "0 0 0 1px rgba(124,58,237,0.28) inset",
                          color: "#fff",
                        }
                      : { color: "#71717a" }
                  }
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    strokeWidth={1.8}
                    style={{ color: activeTab === id ? "#a78bfa" : "#52525b" }}
                  />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "general"       && <GeneralTab />}
            {activeTab === "sync"          && <SyncTab />}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "privacy"       && <PrivacyTab />}
            {activeTab === "appearance"    && <AppearanceTab />}
            {activeTab === "data"          && <DataTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
