// Mock data for Match Deep Report — mirrors the API shape from the spec

export type GradeLetter = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F"
export type Side        = "CT" | "T"
export type RoundResult = "WIN" | "LOSS"
export type Severity    = "HIGH" | "MEDIUM" | "LOW"
export type Priority    = "HIGH" | "MEDIUM" | "LOW"
export type Economy     = "FULL_BUY" | "FORCE_BUY" | "ECO" | "HALF_BUY"
export type RoundTag    = "early_death" | "untraded" | "positioning_mistake" | "good_entry" | "clutch" | "utility_value" | "trade_kill" | "multi_kill" | "eco_impact"

export interface TacticalGrade {
  grade: GradeLetter
  score: number
  note: string
  tooltip: string
}

export interface MatchStats {
  kills: number
  deaths: number
  assists: number
  kd: string
  adr: number
  hsPercent: number
  kast: number
  damage: number
  openingKills: number
  openingDeaths: number
  flashAssists: number
  utilityDamage: number
  clutches: string
  eloChange: number
}

export interface Round {
  round: number
  side: Side
  result: RoundResult
  economy: Economy
  mainEvent: string
  grade: GradeLetter
  note: string
  tags: RoundTag[]
  timeline?: { time: string; event: string }[]
  analysis?: string
  recommendation?: string
}

export interface Mistake {
  title: string
  explanation: string
  severity: Severity
  rounds: number[]
  impact: string
  impactMetric?: string
  recommendation: string
}

export interface TrainingFocus {
  title: string
  why: string
  how: string
  priority: Priority
  relatedRounds: number[]
}

export interface UtilityEntry {
  type: "Flash" | "Smoke" | "Molotov" | "HE"
  thrown: number
  value: number | string
  note: string
  secondary: string
  secondaryValue: string | number
}

export interface DuelEntry {
  label: string
  won: number | string
  lost?: number | string
  note?: string
}

export interface EconomyEntry {
  label: string
  value: string | number
  note?: string
}

export interface HeatZone {
  id: string
  label: string
  x: number   // percent of map width
  y: number   // percent of map height
  r: number   // radius in px
  kills: number
  deaths: number
  untradedDeaths: number
  avgDeathTime: string
  cause: string
}

export interface MatchReport {
  matchId: string
  map: string
  result: "WIN" | "LOSS" | "OT_WIN" | "OT_LOSS"
  score: string
  date: string
  duration: string
  source: string
  rounds: number
  matchIdShort: string
  overallGrade: GradeLetter
  overallScore: number
  grades: {
    aim: TacticalGrade
    utility: TacticalGrade
    positioning: TacticalGrade
    economy: TacticalGrade
    clutch: TacticalGrade
  }
  summary: {
    text: string
    mainIssue: string
    bestStrength: string
    priorityFocus: string
  }
  stats: MatchStats
  roundTimeline: Round[]
  heatZones: HeatZone[]
  duels: DuelEntry[]
  duelMatrix: { enemy: string; won: number; lost: number }[]
  utility: UtilityEntry[]
  utilityTimeline: { round: number; type: string; note: string; value: "HIGH" | "MEDIUM" | "LOW" }[]
  economy: EconomyEntry[]
  economyNote: string
  mistakes: Mistake[]
  training: TrainingFocus[]
}

export const GRADE_COLOR: Record<GradeLetter, string> = {
  "A+": "#34D399",
  "A":  "#34D399",
  "A-": "#6EE7B7",
  "B+": "#818CF8",
  "B":  "#818CF8",
  "B-": "#A78BFA",
  "C+": "#FCD34D",
  "C":  "#FCD34D",
  "C-": "#FBBF24",
  "D":  "#F87171",
  "F":  "#EF4444",
}

export const SEVERITY_COLOR: Record<Severity, { bg: string; border: string; text: string }> = {
  HIGH:   { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   text: "#F87171" },
  MEDIUM: { bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.25)",  text: "#A78BFA" },
  LOW:    { bg: "rgba(113,113,122,0.08)", border: "rgba(113,113,122,0.2)",  text: "#71717A" },
}

export const PRIORITY_COLOR: Record<Priority, { bg: string; border: string; text: string; dot: string }> = {
  HIGH:   { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   text: "#F87171", dot: "#EF4444" },
  MEDIUM: { bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  text: "#FCD34D", dot: "#F59E0B" },
  LOW:    { bg: "rgba(113,113,122,0.07)", border: "rgba(113,113,122,0.18)", text: "#71717A", dot: "#52525B" },
}

export const ECONOMY_LABEL: Record<Economy, string> = {
  FULL_BUY:  "Full Buy",
  FORCE_BUY: "Force Buy",
  ECO:       "Eco",
  HALF_BUY:  "Half Buy",
}

// ── Mock report for m1 (Mirage win) ──────────────────────────────────
export const MOCK_REPORT: MatchReport = {
  matchId: "m1",
  map: "Mirage",
  result: "WIN",
  score: "13:9",
  date: "Today 21:44",
  duration: "39:12",
  source: "FACEIT",
  rounds: 22,
  matchIdShort: "1-cb038819",
  overallGrade: "A-",
  overallScore: 82,

  grades: {
    aim: {
      grade: "A-", score: 84, note: "Strong opening duels",
      tooltip: "Based on duel win rate, headshot %, damage output, opening duel impact, and multi-kill conversion.",
    },
    utility: {
      grade: "B", score: 71, note: "Good smokes, weak flash conversion",
      tooltip: "Measures smoke block rate, flash conversion, molotov area denial efficiency, and HE output.",
    },
    positioning: {
      grade: "C+", score: 63, note: "Repeated connector exposure",
      tooltip: "Evaluates trade position, crossfire setup, rotation timing, and untraded death rate.",
    },
    economy: {
      grade: "B+", score: 76, note: "Good buy discipline",
      tooltip: "Tracks buy sync with team, force buy win rate, eco round damage, and weapon value efficiency.",
    },
    clutch: {
      grade: "C", score: 42, note: "Low 1vX conversion",
      tooltip: "Win rate in 1v1, 1v2, 1v3 scenarios, including time usage and utility consumption in clutch rounds.",
    },
  },

  summary: {
    text: "SYNTRA detected strong impact during T-side executes, especially when entering A site with flash support. Your aim efficiency was above your recent baseline, but several CT-side deaths came from early isolated peeks in mid connector. The match was won mainly through high entry value and strong mid-round damage impact — however, 4 of your 7 CT-side deaths occurred after taking mid contact without flash support or a teammate in trade position.",
    mainIssue: "Uncontrolled connector peeks",
    bestStrength: "A-site entry timing",
    priorityFocus: "Delay first contact and request flash support",
  },

  stats: {
    kills: 22, deaths: 15, assists: 6, kd: "1.47",
    adr: 91, hsPercent: 48, kast: 74, damage: 2002,
    openingKills: 5, openingDeaths: 3, flashAssists: 1,
    utilityDamage: 47, clutches: "1/3", eloChange: 24,
  },

  roundTimeline: [
    { round: 1,  side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "Opening kill",          grade: "A",  note: "Clean A ramp entry, fast trade follow-up.",          tags: ["good_entry"] },
    { round: 2,  side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "2 kills, survived",     grade: "A-", note: "Good mid-round positioning after entry.",             tags: ["trade_kill"] },
    { round: 3,  side: "T",  result: "LOSS", economy: "FULL_BUY",  mainEvent: "Died untraded",         grade: "C",  note: "Solo peek ramp without utility.",                    tags: ["untraded", "positioning_mistake"] },
    { round: 4,  side: "CT", result: "LOSS", economy: "FULL_BUY",  mainEvent: "Died untraded at 1:28", grade: "C-", note: "Wide peeked connector without flash support.",        tags: ["early_death", "untraded", "positioning_mistake"],
      timeline: [
        { time: "1:53", event: "Bought M4A1-S + flash + smoke" },
        { time: "1:42", event: "Moved to connector" },
        { time: "1:31", event: "Teammate made contact mid" },
        { time: "1:28", event: "Peeked connector wide" },
        { time: "1:27", event: "Died without trade" },
      ],
      analysis: "You took first contact without flash support while your teammate was not in a trade position.",
      recommendation: "Delay connector peek by 4-6 seconds or request a flash from the short player.",
    },
    { round: 5,  side: "CT", result: "WIN",  economy: "FULL_BUY",  mainEvent: "2 kills, held B",       grade: "A",  note: "Strong passive hold on B short, created team pressure.", tags: ["trade_kill"] },
    { round: 6,  side: "CT", result: "WIN",  economy: "ECO",        mainEvent: "1 kill, survived",      grade: "B+", note: "Effective pistol hold, saved rifle for next round.",    tags: ["eco_impact"] },
    { round: 7,  side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "A execute, 3 kills",    grade: "A+", note: "Textbook A execute with smoke + flash coordination.",   tags: ["good_entry", "utility_value", "multi_kill"] },
    { round: 8,  side: "T",  result: "LOSS", economy: "FULL_BUY",  mainEvent: "Flash failed, died",    grade: "C-", note: "Flash thrown too early — no teammate in position.",      tags: ["positioning_mistake"] },
    { round: 9,  side: "CT", result: "LOSS", economy: "FULL_BUY",  mainEvent: "Died untraded mid",     grade: "D",  note: "Repeated connector peek pattern — same position as R4.", tags: ["early_death", "untraded", "positioning_mistake"] },
    { round: 10, side: "CT", result: "WIN",  economy: "HALF_BUY",  mainEvent: "1 kill, rotated",       grade: "B",  note: "Good rotation call after losing mid early.",            tags: [] },
    { round: 11, side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "Clutch 1v1",            grade: "A-", note: "Good utility usage in post-plant to force the peek.",   tags: ["clutch", "utility_value"] },
    { round: 12, side: "CT", result: "LOSS", economy: "FULL_BUY",  mainEvent: "Late B rotation",       grade: "C+", note: "Held A too long — B rotation came 4 seconds too late.", tags: ["positioning_mistake"] },
    { round: 13, side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "2 kills, planted",      grade: "B+", note: "Consistent pressure with solid utility.",               tags: ["good_entry"] },
    { round: 14, side: "T",  result: "WIN",  economy: "FORCE_BUY", mainEvent: "Force buy, 2 kills",    grade: "B",  note: "Risky but successful force — won entry duels.",         tags: ["eco_impact"] },
    { round: 15, side: "T",  result: "LOSS", economy: "ECO",        mainEvent: "Eco rush, 1 kill",      grade: "B-", note: "Good eco round damage output — maintained buy next.",   tags: ["eco_impact"] },
    { round: 16, side: "CT", result: "LOSS", economy: "FULL_BUY",  mainEvent: "Died untraded mid",     grade: "D",  note: "Third connector peek without flash — same mistake.",    tags: ["early_death", "untraded", "positioning_mistake"] },
    { round: 17, side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "Opening kill, 2 kills", grade: "A-", note: "Solid T-side presence, created opening advantage.",     tags: ["good_entry", "trade_kill"] },
    { round: 18, side: "CT", result: "LOSS", economy: "FORCE_BUY", mainEvent: "Force buy failed",      grade: "C-", note: "Risky force buy with low utility reduced next round.",  tags: ["positioning_mistake"] },
    { round: 19, side: "CT", result: "LOSS", economy: "FULL_BUY",  mainEvent: "Late B rotation again", grade: "C",  note: "Repeated rotation timing issue from R12.",             tags: ["positioning_mistake"] },
    { round: 20, side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "A execute, 2 kills",    grade: "A-", note: "Strong execute — consistent with your best T rounds.",  tags: ["good_entry", "utility_value"] },
    { round: 21, side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "3 kills, match point",  grade: "A",  note: "Dominant last round — good entry + mid-round kills.",   tags: ["multi_kill", "good_entry"] },
    { round: 22, side: "T",  result: "WIN",  economy: "FULL_BUY",  mainEvent: "Match point",           grade: "A-", note: "Controlled close-out round.",                          tags: ["good_entry"] },
  ],

  heatZones: [
    { id: "connector", label: "Connector",  x: 52, y: 44, r: 28, kills: 1, deaths: 4, untradedDeaths: 3, avgDeathTime: "1:28", cause: "Isolated peek without flash support" },
    { id: "a_site",    label: "A Site",     x: 72, y: 25, r: 32, kills: 9, deaths: 2, untradedDeaths: 0, avgDeathTime: "0:55", cause: "Entry kills on A execute" },
    { id: "b_short",   label: "B Short",    x: 30, y: 32, r: 22, kills: 4, deaths: 2, untradedDeaths: 1, avgDeathTime: "1:12", cause: "Passive hold position" },
    { id: "t_spawn",   label: "Mid",        x: 50, y: 55, r: 18, kills: 3, deaths: 3, untradedDeaths: 2, avgDeathTime: "1:05", cause: "Mid control contest" },
    { id: "b_site",    label: "B Site",     x: 22, y: 55, r: 20, kills: 3, deaths: 2, untradedDeaths: 0, avgDeathTime: "0:48", cause: "B execute kills" },
    { id: "short",     label: "A Short",    x: 68, y: 45, r: 16, kills: 2, deaths: 1, untradedDeaths: 0, avgDeathTime: "1:18", cause: "Short peek duels" },
  ],

  duels: [
    { label: "Opening Duels",       won: 5,     lost: 3,    note: "Above average for FACEIT LVL 8" },
    { label: "Traded Deaths",       won: "4/7", lost: undefined, note: "57% trade rate" },
    { label: "Untraded Deaths",     won: 3,     lost: undefined, note: "High — mostly connector" },
    { label: "Multi-kill Rounds",   won: 4,     lost: undefined, note: "4 rounds with 2+ kills" },
    { label: "Long-range Win Rate", won: "42%", lost: undefined, note: "Below average" },
    { label: "Close-range Win Rate",won: "61%", lost: undefined, note: "Good" },
  ],

  duelMatrix: [
    { enemy: "k1ngs_", won: 4, lost: 2 },
    { enemy: "flame_xo", won: 1, lost: 5 },
    { enemy: "rook99", won: 3, lost: 3 },
    { enemy: "mVp_cs", won: 3, lost: 1 },
    { enemy: "Phantom_T", won: 2, lost: 2 },
  ],

  utility: [
    { type: "Flash",   thrown: 8, value: "0.42", note: "Low conversion", secondary: "Flash assists", secondaryValue: 1 },
    { type: "Smoke",   thrown: 5, value: "78/100", note: "Good area denial", secondary: "Successful blocks", secondaryValue: 4 },
    { type: "Molotov", thrown: 3, value: "34 dmg", note: "Medium impact", secondary: "Area denial time", secondaryValue: "18s" },
    { type: "HE",      thrown: 2, value: "47 dmg", note: "Good damage output", secondary: "Rounds with HE", secondaryValue: 2 },
  ],

  utilityTimeline: [
    { round: 7,  type: "Smoke",   note: "Enabled A execute — blocked CT window and jungle",    value: "HIGH" },
    { round: 9,  type: "Flash",   note: "Thrown mid — no teammate follow-up",                  value: "LOW" },
    { round: 11, type: "Molotov", note: "Banana delay — pushed back B rotation by 7s",         value: "MEDIUM" },
    { round: 13, type: "Smoke",   note: "A ramp smoke — forced CT rotation",                   value: "HIGH" },
    { round: 18, type: "Flash",   note: "Late throw on force buy round — no entry created",    value: "LOW" },
    { round: 20, type: "Smoke",   note: "CT window blocked cleanly — enabled A execute again", value: "HIGH" },
  ],

  economy: [
    { label: "Buy Discipline",      value: "B+",    note: "Consistent full-buy sync with team" },
    { label: "Full Buy Rounds",     value: 16,      note: "" },
    { label: "Eco Rounds",          value: 3,       note: "" },
    { label: "Force Buy Rounds",    value: 3,       note: "1/3 rounds won" },
    { label: "Force Buy Win Rate",  value: "33%",   note: "Below average" },
    { label: "Eco Round Damage",    value: "312",   note: "Good eco contribution" },
    { label: "Bad Buy Decisions",   value: 2,       note: "R14, R18 risky force buys" },
  ],
  economyNote: "Your economy decisions were mostly stable, but Round 18 shows a risky force buy with low utility that reduced your next-round impact and contributed to a consecutive CT-side loss.",

  mistakes: [
    {
      title: "Uncontrolled connector peeks",
      explanation: "You repeatedly took mid contact in connector without flash support or a teammate in trade position. This pattern was detected across 3 rounds on CT side.",
      severity: "HIGH",
      rounds: [4, 9, 16],
      impact: "3 untraded deaths",
      impactMetric: "-18% duel differential in connector",
      recommendation: "Delay first contact by 4-6 seconds, or request a flash from the player holding short before committing to a connector peek.",
    },
    {
      title: "Low flash follow-up",
      explanation: "Your flashes were thrown at correct timings in 5 of 8 cases, but teammate coordination was missing — nobody pushed after the flash landed.",
      severity: "MEDIUM",
      rounds: [6, 11, 18],
      impact: "0.42 flash conversion rate",
      impactMetric: "Industry avg for this ELO: 0.65",
      recommendation: "Communicate flash intent before throwing. Use quick chat or voice to signal 'flashing now' so teammates are ready to push.",
    },
    {
      title: "Late B rotation",
      explanation: "On two CT rounds you held A too long after getting information that B was being hit. This resulted in a 4-second rotation disadvantage.",
      severity: "MEDIUM",
      rounds: [12, 19],
      impact: "Site retake disadvantage",
      recommendation: "When mid is lost and T-side has A site presence, begin rotating to B at 0:55 mark rather than waiting for plant audio.",
    },
  ],

  training: [
    {
      title: "Mirage connector pre-aim",
      why: "You lost 4 duels in connector — 3 of them were untraded wide peeks against a holding enemy.",
      how: "Practice holding tighter angles and avoid wide swings. Use Refrag or Aimlab connector maps. Focus on shoulder peeking to gather info before committing.",
      priority: "HIGH",
      relatedRounds: [4, 9, 16],
    },
    {
      title: "Flash timing and communication",
      why: "Flash conversion rate was 0.42 — well below the 0.65 baseline for your ELO range.",
      how: "Before every flash, use voice: 'flash coming' + teammate name. Practice pop-flash techniques on Mirage window and short.",
      priority: "MEDIUM",
      relatedRounds: [6, 11, 18],
    },
    {
      title: "CT-side rotation discipline",
      why: "31% of early deaths on CT side came after delayed rotations allowed the enemy to take uncontested site control.",
      how: "Review your rotation triggers: mid lost = earlier B commitment. Use demo review to time your rotation relative to plant sounds.",
      priority: "HIGH",
      relatedRounds: [12, 19],
    },
  ],
}

// Map of matchId -> report (in production this would be a DB lookup)
export const REPORTS: Record<string, MatchReport> = {
  m1: MOCK_REPORT,
}
