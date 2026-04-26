export type MatchStatus = "ready" | "processing" | "waiting_demo" | "failed" | "no_demo" | "stats_only"
export type MatchResult = "WIN" | "LOSS" | "DRAW"

export interface Match {
  id: string
  map: string
  result: MatchResult
  score: string
  date: string
  dateLabel: string
  status: MatchStatus
  grade: string
  eloChange: number
  kd: string
  kdRatio: number
  adr: number
  hs: number
  kast: number
  aimScore: number
  utilityScore: number
  impactScore: number
  positionScore: number
  mainInsight: string
  rounds: number
  processingProgress?: number
}

export const MATCH_DATA: Match[] = [
  { id: "m1",  map: "Mirage",   result: "WIN",  score: "13:9",  date: "2026-04-26", dateLabel: "Today, 21:44",  status: "ready",        grade: "A-",  eloChange: +24, kd: "22/15", kdRatio: 1.47, adr: 91,  hs: 48, kast: 74, aimScore: 84, utilityScore: 71, impactScore: 89, positionScore: 63, mainInsight: "Repeated connector deaths without flash support.", rounds: 24 },
  { id: "m2",  map: "Inferno",  result: "LOSS", score: "11:13", date: "2026-04-26", dateLabel: "Today, 19:11",  status: "ready",        grade: "B",   eloChange: -18, kd: "18/19", kdRatio: 0.95, adr: 76,  hs: 40, kast: 68, aimScore: 72, utilityScore: 64, impactScore: 74, positionScore: 58, mainInsight: "Low utility impact on B-site retakes.", rounds: 26 },
  { id: "m3",  map: "Ancient",  result: "WIN",  score: "13:7",  date: "2026-04-25", dateLabel: "Apr 25",        status: "ready",        grade: "A",   eloChange: +27, kd: "26/12", kdRatio: 2.17, adr: 98,  hs: 52, kast: 81, aimScore: 91, utilityScore: 78, impactScore: 94, positionScore: 77, mainInsight: "Strong impact: high entry success on T-side A executes.", rounds: 22 },
  { id: "m4",  map: "Anubis",   result: "WIN",  score: "13:11", date: "2026-04-25", dateLabel: "Apr 25",        status: "processing",   grade: "B+",  eloChange: +21, kd: "21/16", kdRatio: 1.31, adr: 84,  hs: 44, kast: 72, aimScore: 78, utilityScore: 70, impactScore: 81, positionScore: 66, mainInsight: "", rounds: 26, processingProgress: 64 },
  { id: "m5",  map: "Vertigo",  result: "LOSS", score: "10:13", date: "2026-04-24", dateLabel: "Apr 24",        status: "waiting_demo", grade: "C+",  eloChange: -22, kd: "15/18", kdRatio: 0.83, adr: 68,  hs: 36, kast: 61, aimScore: 63, utilityScore: 55, impactScore: 67, positionScore: 49, mainInsight: "", rounds: 25 },
  { id: "m6",  map: "Nuke",     result: "LOSS", score: "8:13",  date: "2026-04-23", dateLabel: "Apr 23",        status: "ready",        grade: "C+",  eloChange: -22, kd: "14/18", kdRatio: 0.78, adr: 65,  hs: 34, kast: 59, aimScore: 60, utilityScore: 52, impactScore: 63, positionScore: 45, mainInsight: "Roof rotations too slow — losing Ramp control on T-side.", rounds: 23 },
  { id: "m7",  map: "Mirage",   result: "WIN",  score: "13:6",  date: "2026-04-22", dateLabel: "Apr 22",        status: "ready",        grade: "A",   eloChange: +29, kd: "24/11", kdRatio: 2.18, adr: 102, hs: 55, kast: 84, aimScore: 93, utilityScore: 82, impactScore: 96, positionScore: 80, mainInsight: "Best game this week: dominant A-site control.", rounds: 21 },
  { id: "m8",  map: "Inferno",  result: "WIN",  score: "13:10", date: "2026-04-21", dateLabel: "Apr 21",        status: "ready",        grade: "B+",  eloChange: +19, kd: "20/17", kdRatio: 1.18, adr: 81,  hs: 43, kast: 70, aimScore: 76, utilityScore: 73, impactScore: 79, positionScore: 68, mainInsight: "Good banana control but weak CT second half.", rounds: 25 },
  { id: "m9",  map: "Overpass", result: "LOSS", score: "9:13",  date: "2026-04-20", dateLabel: "Apr 20",        status: "failed",       grade: "D",   eloChange: -28, kd: "12/20", kdRatio: 0.60, adr: 55,  hs: 28, kast: 51, aimScore: 48, utilityScore: 40, impactScore: 52, positionScore: 36, mainInsight: "", rounds: 24 },
  { id: "m10", map: "Ancient",  result: "WIN",  score: "13:8",  date: "2026-04-19", dateLabel: "Apr 19",        status: "ready",        grade: "B+",  eloChange: +22, kd: "19/15", kdRatio: 1.27, adr: 83,  hs: 46, kast: 71, aimScore: 79, utilityScore: 69, impactScore: 82, positionScore: 64, mainInsight: "Solid mid-round calling helped convert 3 key rounds.", rounds: 23 },
  { id: "m11", map: "Dust2",    result: "LOSS", score: "12:13", date: "2026-04-18", dateLabel: "Apr 18",        status: "ready",        grade: "B",   eloChange: -14, kd: "20/20", kdRatio: 1.00, adr: 80,  hs: 42, kast: 69, aimScore: 77, utilityScore: 65, impactScore: 80, positionScore: 62, mainInsight: "Lost 3 crucial 1v2 clutches that could have sealed it.", rounds: 27 },
  { id: "m12", map: "Nuke",     result: "WIN",  score: "13:11", date: "2026-04-17", dateLabel: "Apr 17",        status: "stats_only",   grade: "B-",  eloChange: +16, kd: "17/16", kdRatio: 1.06, adr: 74,  hs: 38, kast: 66, aimScore: 69, utilityScore: 61, impactScore: 72, positionScore: 58, mainInsight: "", rounds: 26 },
]

export const GRADE_COLORS: Record<string, string> = {
  "A+": "#10B981", "A": "#10B981", "A-": "#22D3EE",
  "B+": "#9F67FF", "B": "#9F67FF", "B-": "#7C3AED",
  "C+": "#F59E0B", "C": "#F59E0B", "C-": "#D97706",
  "D": "#EF4444",  "F": "#EF4444",
}

export const STATUS_CONFIG: Record<MatchStatus, { label: string; bg: string; text: string }> = {
  ready:        { label: "Report Ready",    bg: "rgba(34,197,94,0.1)",   text: "#22C55E" },
  processing:   { label: "Processing Demo", bg: "rgba(124,58,237,0.1)",  text: "#A78BFA" },
  waiting_demo: { label: "Waiting Demo",    bg: "rgba(251,191,36,0.1)",  text: "#FCD34D" },
  failed:       { label: "Failed",          bg: "rgba(239,68,68,0.1)",   text: "#F87171" },
  no_demo:      { label: "No Demo",         bg: "rgba(113,113,122,0.1)", text: "#A1A1AA" },
  stats_only:   { label: "Stats Only",      bg: "rgba(34,211,238,0.08)", text: "#67E8F9" },
}
