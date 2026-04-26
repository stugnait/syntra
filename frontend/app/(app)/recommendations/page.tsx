"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Target, Zap, Map, CheckCircle, Clock, AlertCircle, ArrowRight, ExternalLink } from "lucide-react"

type Status = "New" | "Active" | "In Progress" | "Improving" | "Resolved" | "Ignored"
type Priority = "High" | "Medium" | "Low"
type Skill = "Positioning" | "Aim" | "Utility" | "Economy" | "Clutch" | "Map-specific"

interface Recommendation {
  id: string
  title: string
  skill: Skill
  map: string
  priority: Priority
  status: Status
  impact: string
  evidence: string[]
  actionPlan: string[]
  progress?: string
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec_1",
    title: "Fix connector early peeks",
    skill: "Positioning",
    map: "Mirage",
    priority: "High",
    status: "Active",
    impact: "High",
    evidence: ["Mirage 13:9, rounds 4, 9, 16", "Mirage 11:13, rounds 3, 12", "11 untraded deaths"],
    actionPlan: [
      "Delay first peek by 4–6 seconds",
      "Ask short player for flash before pushing",
      "Hold tighter connector angle",
      "Avoid wide swing without trade position",
    ],
  },
  {
    id: "rec_2",
    title: "Improve flash follow-up timing",
    skill: "Utility",
    map: "All maps",
    priority: "High",
    status: "Active",
    impact: "Medium",
    evidence: ["Flash conversion 0.42 — below average", "6 matches with low utility ROI", "Mirage, Inferno, Anubis affected"],
    actionPlan: [
      "Coordinate flash with teammate push timing",
      "Use pop-flash variants for solo plays",
      "Avoid throwing flashes before team is ready",
    ],
  },
  {
    id: "rec_3",
    title: "Reduce force-buy risk",
    skill: "Economy",
    map: "All maps",
    priority: "Medium",
    status: "New",
    impact: "Medium",
    evidence: ["Force buy win rate 32%", "6 second-round force buys hurt utility next round", "Pattern detected across 5 matches"],
    actionPlan: [
      "Save when team has fewer than 3 full buys",
      "Coordinate buy decision with team in round 2",
      "Avoid force buy without utility plan",
    ],
  },
  {
    id: "rec_4",
    title: "Reduce long-range dry peeks",
    skill: "Aim",
    map: "All maps",
    priority: "Medium",
    status: "In Progress",
    impact: "Medium",
    progress: "38% → 35% long-range loss rate (improving)",
    evidence: ["Long-range duel win rate 38%", "14 unnecessary risks detected", "AK-47 long-range ADR below average"],
    actionPlan: [
      "Always use flash before long-range contact",
      "Prefer AWP support on long corridors",
      "Hold angles instead of peeking",
    ],
  },
  {
    id: "rec_5",
    title: "Nuke outside smoke timing",
    skill: "Map-specific",
    map: "Nuke",
    priority: "Low",
    status: "New",
    impact: "Low",
    evidence: ["Nuke utility score 54 — lowest", "Late outside smokes detected in 4 matches", "Outside deaths 9 — caused by late info"],
    actionPlan: [
      "Learn outside smoke timing for CT rotation",
      "Throw outside smoke by 1:40 on T-side",
      "Review outside control strategy with team",
    ],
  },
]

const THIS_WEEK_PLAN = [
  { title: "Mirage connector survival", sub: "3 related matches" },
  { title: "Flash timing before mid contact", sub: "6 low conversion rounds" },
  { title: "Long-range duel discipline", sub: "38% win rate" },
]

const STATUS_STYLES: Record<Status, string> = {
  New:         "text-violet-400 bg-violet-400/10 border-violet-400/20",
  Active:      "text-blue-400  bg-blue-400/10  border-blue-400/20",
  "In Progress":"text-amber-400 bg-amber-400/10 border-amber-400/20",
  Improving:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Resolved:    "text-zinc-400  bg-zinc-400/10  border-zinc-400/20",
  Ignored:     "text-zinc-600  bg-zinc-600/10  border-zinc-600/20",
}

const PRIORITY_COLORS: Record<Priority, string> = {
  High:   "#EF4444",
  Medium: "#F59E0B",
  Low:    "#52525B",
}

const SKILL_ICONS: Partial<Record<Skill, React.ElementType>> = {
  Positioning: Map,
  Aim:         Target,
  Utility:     Zap,
  Economy:     CheckCircle,
  Clutch:      AlertCircle,
  "Map-specific": Map,
}

const ALL_PRIORITIES: Array<"All" | Priority> = ["All", "High", "Medium", "Low"]
const ALL_SKILLS: Array<"All" | Skill> = ["All", "Positioning", "Aim", "Utility", "Economy", "Clutch", "Map-specific"]
const ALL_STATUSES: Array<"All" | Status> = ["All", "New", "Active", "In Progress", "Improving", "Resolved"]

function FilterSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl px-3 py-2 pr-8 text-xs font-semibold text-zinc-300 cursor-pointer focus:outline-none"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {options.map((o) => <option key={o} value={o} className="bg-[#0D0D14]">{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
    </div>
  )
}

export default function RecommendationsPage() {
  const [selectedId,     setSelectedId]     = useState<string>("rec_1")
  const [filterPriority, setFilterPriority] = useState("All")
  const [filterSkill,    setFilterSkill]    = useState("All")
  const [filterStatus,   setFilterStatus]   = useState("All")

  const filtered = RECOMMENDATIONS.filter((r) => {
    if (filterPriority !== "All" && r.priority !== filterPriority) return false
    if (filterSkill    !== "All" && r.skill    !== filterSkill)    return false
    if (filterStatus   !== "All" && r.status   !== filterStatus)   return false
    return true
  })

  const selected = RECOMMENDATIONS.find((r) => r.id === selectedId) ?? RECOMMENDATIONS[0]

  const highCount = RECOMMENDATIONS.filter((r) => r.priority === "High").length

  return (
    <div className="min-h-screen p-7 pb-12" style={{ background: "#05050A" }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-black text-white tracking-tight">RECOMMENDATIONS</h1>
          <p className="text-zinc-500 text-sm mt-1">Personalized improvement plan based on your match history</p>
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect options={ALL_PRIORITIES} value={filterPriority} onChange={setFilterPriority} />
          <FilterSelect options={ALL_SKILLS}     value={filterSkill}    onChange={setFilterSkill} />
          <FilterSelect options={ALL_STATUSES}   value={filterStatus}   onChange={setFilterStatus} />
        </div>
      </div>

      {/* Priority focus block */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(124,58,237,0.08) 100%)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
                Priority Focus
              </span>
            </div>
            <h2 className="font-display text-xl font-black text-white mb-2">Fix Mirage connector survival</h2>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
              You died 18 times in connector across recent Mirage matches. 11 deaths were untraded and 7 happened before 1:15. This pattern is the single largest contributor to lost rounds on your most-played map.
            </p>
            <div className="flex gap-6 mt-3 text-xs text-zinc-500">
              <span>Impact: <span className="text-red-400 font-semibold">High</span></span>
              <span>Related matches: <span className="text-white font-semibold">5</span></span>
            </div>
          </div>
          <div className="flex gap-2 ml-6 shrink-0">
            <button className="rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
              style={{ background: "rgba(124,58,237,0.4)", border: "1px solid rgba(124,58,237,0.5)" }}>
              Start Focus Plan
            </button>
            <button className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              View Related Rounds
            </button>
          </div>
        </div>
      </div>

      {/* Main: list + detail */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        {/* List */}
        <div className="col-span-2 space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-zinc-600 text-sm">No results for selected filters.</p>
            </div>
          ) : (
            filtered.map((rec) => {
              const SkillIcon = SKILL_ICONS[rec.skill] ?? Target
              const isSelected = selectedId === rec.id
              return (
                <button
                  key={rec.id}
                  onClick={() => setSelectedId(rec.id)}
                  className="w-full text-left rounded-2xl p-4 transition-all duration-200"
                  style={{
                    background: isSelected ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.03)",
                    border: isSelected ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: isSelected ? "0 0 0 1px rgba(124,58,237,0.2) inset" : "none",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full shrink-0 mt-0.5" style={{ background: PRIORITY_COLORS[rec.priority] }} />
                      <span className="text-sm font-semibold text-white text-pretty">{rec.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <SkillIcon className="h-3 w-3" strokeWidth={1.8} />
                      {rec.skill}
                    </span>
                    <span className="text-[10px] text-zinc-600">·</span>
                    <span className="text-[10px] text-zinc-500">{rec.map}</span>
                    <span className={cn("ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border", STATUS_STYLES[rec.status])}>
                      {rec.status}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Detail */}
        <div className="col-span-3 rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {selected && (
            <>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: PRIORITY_COLORS[selected.priority] }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{selected.priority} Priority · {selected.skill}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", STATUS_STYLES[selected.status])}>
                      {selected.status}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">{selected.title}</h3>
                  {selected.progress && (
                    <p className="text-xs text-emerald-400 mt-1">{selected.progress}</p>
                  )}
                </div>
              </div>

              {/* Evidence */}
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Evidence</p>
                <div className="space-y-1.5">
                  {selected.evidence.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-zinc-600 mt-0.5">–</span>
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action plan */}
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Action Plan</p>
                <div className="space-y-2">
                  {selected.actionPlan.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span className="font-display font-black text-sm text-violet-400/60 mt-0.5 shrink-0">{i + 1}</span>
                      <span className="text-sm text-zinc-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "rgba(124,58,237,0.4)", border: "1px solid rgba(124,58,237,0.5)" }}>
                  Mark as Active Focus
                </button>
                <button className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Open Heatmap
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* This week training plan */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="font-display text-base font-bold text-white mb-4">This Week Training Plan</h3>
        <div className="grid grid-cols-3 gap-4">
          {THIS_WEEK_PLAN.map((item, i) => (
            <div key={i} className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <span className="font-display font-black text-lg text-violet-400/50 shrink-0">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
