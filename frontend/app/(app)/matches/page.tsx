"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, RefreshCw, Upload, SlidersHorizontal, ChevronDown, LayoutGrid, AlignJustify } from "lucide-react"
import { cn } from "@/lib/utils"
import { MATCH_DATA, GRADE_COLORS, type MatchResult, type MatchStatus } from "@/lib/matches-data"
import { MatchCard } from "@/components/app/matches/match-card"

const MAPS    = ["All", "Mirage", "Inferno", "Ancient", "Nuke", "Anubis", "Vertigo", "Dust2", "Overpass"]
const RESULTS = ["All", "WIN", "LOSS", "DRAW"]
const GRADES  = ["All", "A range", "B range", "C range", "D/F range"]
const STATUSES= ["All", "Report Ready", "Processing", "Waiting Demo", "Failed", "Stats Only"]
const SORTS   = ["Newest first", "Oldest first", "Best grade", "Worst grade", "Highest ADR", "Biggest ELO gain", "Biggest ELO loss"]

function FilterDropdown({
  label, options, value, onChange,
}: {
  label: string; options: string[]; value: string; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
          value !== "All" && value !== options[0]
            ? "text-violet-300 border-violet-500/30 bg-violet-500/10"
            : "text-zinc-400 hover:text-white"
        )}
        style={{
          background: value !== "All" && value !== options[0] ? undefined : "rgba(255,255,255,0.04)",
          border: value !== "All" && value !== options[0]
            ? "1px solid rgba(124,58,237,0.3)"
            : "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {value === "All" || value === options[0] ? label : value}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1.5 z-20 min-w-[148px] rounded-xl overflow-hidden py-1"
            style={{ background: "#0E0E1A", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}
          >
            {options.map((o) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false) }}
                className={cn(
                  "w-full text-left px-3.5 py-2 text-xs transition-colors",
                  o === value ? "text-violet-300 bg-violet-500/10" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SummaryStrip({ matches }: { matches: typeof MATCH_DATA }) {
  const wins   = matches.filter((m) => m.result === "WIN").length
  const losses = matches.filter((m) => m.result === "LOSS").length
  const wr     = matches.length ? Math.round((wins / matches.length) * 100) : 0
  const avgAdr = matches.length ? Math.round(matches.reduce((s, m) => s + m.adr, 0) / matches.length) : 0
  const avgUtility = matches.length ? Math.round(matches.reduce((s, m) => s + m.utilityScore, 0) / matches.length) : 0

  const gradeOrder = ["A+","A","A-","B+","B","B-","C+","C","C-","D","F"]
  const readyGrades = matches.filter((m) => m.status === "ready").map((m) => m.grade)
  const avgGrade = readyGrades.length
    ? gradeOrder[Math.round(readyGrades.reduce((s, g) => s + gradeOrder.indexOf(g), 0) / readyGrades.length)]
    : "—"

  const stats = [
    { label: "Matches",     value: matches.length },
    { label: "Win Rate",    value: `${wr}%` },
    { label: "Avg Grade",   value: avgGrade },
    { label: "Avg ADR",     value: avgAdr },
    { label: "Avg Utility", value: avgUtility },
  ]

  return (
    <div
      className="grid grid-cols-5 gap-px mb-5 rounded-2xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn("flex flex-col items-center py-3.5", i < 4 && "border-r border-white/[0.06]")}
          style={{ background: "rgba(255,255,255,0.025)" }}
        >
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">{s.label}</span>
          <span className="font-display text-xl font-black text-white">{s.value}</span>
        </div>
      ))}
    </div>
  )
}

// Table row
function MatchTableRow({ match }: { match: typeof MATCH_DATA[0] }) {
  const gradeColor  = GRADE_COLORS[match.grade] ?? "#71717A"
  const isReady     = match.status === "ready"

  return (
    <tr
      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer"
      onClick={() => isReady && (window.location.href = `/matches/${match.id}`)}
    >
      <td className="py-3 px-4 text-[11px] text-zinc-500">{match.dateLabel}</td>
      <td className="py-3 px-4 text-sm font-semibold text-white">{match.map}</td>
      <td className="py-3 px-4">
        <span
          className={cn(
            "text-[11px] font-black rounded-lg px-2 py-0.5",
            match.result === "WIN"  && "bg-emerald-500/12 text-emerald-400",
            match.result === "LOSS" && "bg-red-500/12 text-red-400",
            match.result === "DRAW" && "bg-zinc-500/12 text-zinc-400",
          )}
        >
          {match.result}
        </span>
      </td>
      <td className="py-3 px-4 text-xs font-mono text-zinc-300">{match.score}</td>
      <td className="py-3 px-4 text-xs text-zinc-300">{match.adr}</td>
      <td className="py-3 px-4 text-xs text-zinc-300">{match.kd}</td>
      <td className="py-3 px-4">
        <span className="text-sm font-black" style={{ color: gradeColor }}>{isReady ? match.grade : "—"}</span>
      </td>
      <td className="py-3 px-4">
        {isReady && (
          <button
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            onClick={(e) => { e.stopPropagation(); window.location.href = `/matches/${match.id}` }}
          >
            Report →
          </button>
        )}
      </td>
    </tr>
  )
}

const PAGE_SIZE = 8

export default function MatchesPage() {
  const router = useRouter()
  const [search,     setSearch]     = useState("")
  const [mapFilter,  setMapFilter]  = useState("All")
  const [resultFilter, setResult]   = useState("All")
  const [gradeFilter, setGrade]     = useState("All")
  const [statusFilter, setStatus]   = useState("All")
  const [sort,       setSort]       = useState("Newest first")
  const [viewMode,   setViewMode]   = useState<"cards" | "table">("cards")
  const [page,       setPage]       = useState(1)

  const filtered = useMemo(() => {
    let data = [...MATCH_DATA]

    if (search) {
      const q = search.toLowerCase()
      data = data.filter((m) => m.map.toLowerCase().includes(q) || m.id.includes(q))
    }
    if (mapFilter !== "All") data = data.filter((m) => m.map === mapFilter)
    if (resultFilter !== "All") data = data.filter((m) => m.result === resultFilter)
    if (gradeFilter !== "All") {
      const rangeMap: Record<string, string[]> = {
        "A range": ["A+","A","A-"], "B range": ["B+","B","B-"],
        "C range": ["C+","C","C-"], "D/F range": ["D","F"],
      }
      data = data.filter((m) => rangeMap[gradeFilter]?.includes(m.grade))
    }
    if (statusFilter !== "All") {
      const labelToStatus: Record<string, MatchStatus> = {
        "Report Ready": "ready", "Processing": "processing",
        "Waiting Demo": "waiting_demo", "Failed": "failed", "Stats Only": "stats_only",
      }
      data = data.filter((m) => m.status === labelToStatus[statusFilter])
    }

    const gradeOrder = ["A+","A","A-","B+","B","B-","C+","C","C-","D","F"]
    switch (sort) {
      case "Oldest first":      data.sort((a, b) => a.date.localeCompare(b.date)); break
      case "Best grade":        data.sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade)); break
      case "Worst grade":       data.sort((a, b) => gradeOrder.indexOf(b.grade) - gradeOrder.indexOf(a.grade)); break
      case "Highest ADR":       data.sort((a, b) => b.adr - a.adr); break
      case "Biggest ELO gain":  data.sort((a, b) => b.eloChange - a.eloChange); break
      case "Biggest ELO loss":  data.sort((a, b) => a.eloChange - b.eloChange); break
      default:                  data.sort((a, b) => b.date.localeCompare(a.date))
    }

    return data
  }, [search, mapFilter, resultFilter, gradeFilter, statusFilter, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearch(""); setMapFilter("All"); setResult("All")
    setGrade("All"); setStatus("All"); setSort("Newest first"); setPage(1)
  }
  const hasFilters = search || mapFilter !== "All" || resultFilter !== "All" || gradeFilter !== "All" || statusFilter !== "All"

  return (
    <div className="min-h-screen p-7 pb-14" style={{ background: "#05050A" }}>
      {/* Page header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase mb-1">Match Archive</p>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">
            Imported FACEIT Matches
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-lg">
            Filter, compare, and open tactical reports generated from parsed demo telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push("/upload")}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Demo
          </button>
          <button
            onClick={() => router.push("/settings?tab=sync")}
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 0 12px rgba(124,58,237,0.25)" }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Now
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 flex-1 min-w-[220px] max-w-xs"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Search className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          <input
            type="text"
            placeholder="Search by map, match id..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="bg-transparent text-xs text-white placeholder-zinc-600 outline-none flex-1"
          />
        </div>

        <FilterDropdown label="Map"    options={MAPS}    value={mapFilter}    onChange={(v) => { setMapFilter(v); setPage(1) }} />
        <FilterDropdown label="Result" options={RESULTS} value={resultFilter} onChange={(v) => { setResult(v); setPage(1) }} />
        <FilterDropdown label="Grade"  options={GRADES}  value={gradeFilter}  onChange={(v) => { setGrade(v); setPage(1) }} />
        <FilterDropdown label="Status" options={STATUSES} value={statusFilter} onChange={(v) => { setStatus(v); setPage(1) }} />
        <FilterDropdown label="Sort"   options={SORTS}   value={sort}         onChange={(v) => { setSort(v); setPage(1) }} />

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-zinc-500 hover:text-white transition-colors px-2 py-2"
          >
            Reset
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["cards","table"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={cn("p-1.5 rounded-lg transition-all", viewMode === m ? "text-white" : "text-zinc-600")}
              style={viewMode === m ? { background: "rgba(124,58,237,0.3)" } : undefined}
            >
              {m === "cards" ? <LayoutGrid className="h-3.5 w-3.5" /> : <AlignJustify className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <SummaryStrip matches={filtered} />

      {/* Empty state */}
      {filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p className="text-zinc-400 font-semibold mb-1">No matches match your filters.</p>
          <p className="text-zinc-600 text-sm mb-4">Try changing map, date range, or grade filters.</p>
          <button
            onClick={resetFilters}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-violet-300"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Cards view */}
      {filtered.length > 0 && viewMode === "cards" && (
        <div className="grid grid-cols-2 gap-4">
          {paginated.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}

      {/* Table view */}
      {filtered.length > 0 && viewMode === "table" && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Date","Map","Result","Score","ADR","K/D","Grade","Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-zinc-600 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((m) => <MatchTableRow key={m.id} match={m} />)}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <p className="text-xs text-zinc-600 mr-3">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} matches
          </p>
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                p === page
                  ? { background: "rgba(124,58,237,0.3)", color: "#C4B5FD", border: "1px solid rgba(124,58,237,0.4)" }
                  : { background: "rgba(255,255,255,0.03)", color: "#52525B", border: "1px solid rgba(255,255,255,0.06)" }
              }
            >
              {p}
            </button>
          ))}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
