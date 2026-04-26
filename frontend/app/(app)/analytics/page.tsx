"use client"

import { useState, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Download, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnalyticsKpiCards } from "@/components/app/analytics/analytics-kpi-cards"
import { TabOverview }       from "@/components/app/analytics/tab-overview"
import { TabAim }            from "@/components/app/analytics/tab-aim"
import { TabUtility }        from "@/components/app/analytics/tab-utility"
import { TabPositioning }    from "@/components/app/analytics/tab-positioning"
import { TabEconomy }        from "@/components/app/analytics/tab-economy"
import { TabClutch }         from "@/components/app/analytics/tab-clutch"
import { TabMaps }           from "@/components/app/analytics/tab-maps"

const TABS = [
  { key: "overview",     label: "Overview" },
  { key: "aim",          label: "Aim" },
  { key: "utility",      label: "Utility" },
  { key: "positioning",  label: "Positioning" },
  { key: "economy",      label: "Economy" },
  { key: "clutch",       label: "Clutch" },
  { key: "maps",         label: "Maps" },
] as const

type TabKey = typeof TABS[number]["key"]

const DATE_OPTIONS  = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"]
const MAP_OPTIONS   = ["All maps", "Mirage", "Inferno", "Ancient", "Nuke"]
const SIDE_OPTIONS  = ["All sides", "CT Side", "T Side"]

function FilterSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-zinc-300 cursor-pointer transition-all focus:outline-none"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {options.map((o) => <option key={o} value={o} className="bg-[#0D0D14]">{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
    </div>
  )
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview")
  const [dateFilter,  setDateFilter]  = useState(DATE_OPTIONS[1])
  const [mapFilter,   setMapFilter]   = useState(MAP_OPTIONS[0])
  const [sideFilter,  setSideFilter]  = useState(SIDE_OPTIONS[0])

  const handleTabChange = useCallback((tab: string) => {
    if (TABS.find((t) => t.key === tab)) setActiveTab(tab as TabKey)
  }, [])

  return (
    <div className="min-h-screen p-7 pb-12" style={{ background: "#05050A" }}>
      {/* Page header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">
            PERFORMANCE ANALYTICS
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Your long-term CS2 performance profile</p>
          <p className="text-zinc-600 text-xs mt-0.5 max-w-lg">
            Analyze your gameplay patterns across all FACEIT matches processed by SYNTRA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect options={DATE_OPTIONS}  value={dateFilter}  onChange={setDateFilter} />
          <FilterSelect options={MAP_OPTIONS}   value={mapFilter}   onChange={setMapFilter} />
          <FilterSelect options={SIDE_OPTIONS}  value={sideFilter}  onChange={setSideFilter} />
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300 transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.8} />
            Export
          </button>
        </div>
      </div>

      {/* KPI cards — clicking navigates to tab */}
      <AnalyticsKpiCards onTabChange={handleTabChange} />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-150",
              activeTab === tab.key ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            )}
            style={
              activeTab === tab.key
                ? { background: "rgba(124,58,237,0.3)", boxShadow: "0 0 0 1px rgba(124,58,237,0.4)" }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === "overview"    && <TabOverview    onTabChange={handleTabChange} />}
        {activeTab === "aim"         && <TabAim />}
        {activeTab === "utility"     && <TabUtility />}
        {activeTab === "positioning" && <TabPositioning />}
        {activeTab === "economy"     && <TabEconomy />}
        {activeTab === "clutch"      && <TabClutch />}
        {activeTab === "maps"        && <TabMaps />}
      </div>
    </div>
  )
}
