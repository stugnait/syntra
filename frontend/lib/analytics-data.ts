// ── Mock analytics data for SYNTRA ──────────────────────────────────────────

export const SCORE_TREND = [
  { match: "M1",  overall: 68, aim: 72, utility: 64, positioning: 61 },
  { match: "M2",  overall: 65, aim: 69, utility: 60, positioning: 58 },
  { match: "M3",  overall: 70, aim: 75, utility: 62, positioning: 63 },
  { match: "M4",  overall: 67, aim: 71, utility: 67, positioning: 60 },
  { match: "M5",  overall: 73, aim: 78, utility: 64, positioning: 65 },
  { match: "M6",  overall: 71, aim: 74, utility: 70, positioning: 62 },
  { match: "M7",  overall: 76, aim: 80, utility: 66, positioning: 67 },
  { match: "M8",  overall: 74, aim: 77, utility: 72, positioning: 64 },
  { match: "M9",  overall: 79, aim: 82, utility: 68, positioning: 69 },
  { match: "M10", overall: 76, aim: 79, utility: 73, positioning: 66 },
  { match: "M11", overall: 80, aim: 83, utility: 71, positioning: 68 },
  { match: "M12", overall: 78, aim: 84, utility: 71, positioning: 63 },
]

export const KPI_CARDS = [
  {
    label: "Overall",
    value: 78,
    suffix: "/100",
    badge: "+5 this month",
    badgeType: "positive" as const,
    tab: "overview",
  },
  {
    label: "Aim Score",
    value: 84,
    suffix: "/100",
    badge: "Strong",
    badgeType: "positive" as const,
    tab: "aim",
  },
  {
    label: "Utility",
    value: 71,
    suffix: "/100",
    badge: "Needs work",
    badgeType: "warning" as const,
    tab: "utility",
  },
  {
    label: "Positioning",
    value: 63,
    suffix: "/100",
    badge: "Weak zone",
    badgeType: "danger" as const,
    tab: "positioning",
  },
  {
    label: "Clutch",
    value: 42,
    suffix: "%",
    badge: "Improving",
    badgeType: "positive" as const,
    tab: "clutch",
  },
]

export const STRONGEST_AREAS = [
  { rank: 1, title: "Opening duel impact", stat: "+12% above baseline" },
  { rank: 2, title: "A-site entry timing", stat: "Strong on Mirage/Ancient" },
  { rank: 3, title: "Rifle damage output", stat: "ADR stable above 80" },
]

export const WEAKEST_AREAS = [
  { rank: 1, title: "CT-side early deaths", stat: "31% deaths before 1:15" },
  { rank: 2, title: "Flash conversion", stat: "Only 0.42 value" },
  { rank: 3, title: "Connector survival", stat: "Negative duel differential" },
]

export const MAP_PERFORMANCE = [
  { map: "Mirage",  matches: 18, winRate: 61, grade: "B+", best: "Aim",    weakness: "Position" },
  { map: "Inferno", matches: 13, winRate: 46, grade: "C+", best: "Utility", weakness: "Survival" },
  { map: "Ancient", matches: 9,  winRate: 67, grade: "A-", best: "Entry",  weakness: "Clutch" },
  { map: "Nuke",    matches: 7,  winRate: 42, grade: "C",  best: "Damage", weakness: "Rotations" },
]

// Aim tab
export const AIM_DUEL_BREAKDOWN = [
  { label: "Opening duels",  value: 58, color: "#9F67FF" },
  { label: "Traded duels",   value: 64, color: "#22D3EE" },
  { label: "Isolated duels", value: 41, color: "#F59E0B" },
  { label: "Long range",     value: 38, color: "#EF4444" },
  { label: "Close range",    value: 62, color: "#10B981" },
]

export const DISTANCE_ANALYSIS = [
  { label: "Close range", value: 62, color: "#10B981" },
  { label: "Mid range",   value: 51, color: "#22D3EE" },
  { label: "Long range",  value: 38, color: "#EF4444" },
]

export const WEAPON_ANALYSIS = [
  { weapon: "AK-47",  kills: 184, deaths: 141, adr: 87, grade: "A-" },
  { weapon: "M4A1-S", kills: 139, deaths: 128, adr: 78, grade: "B" },
  { weapon: "AWP",    kills: 42,  deaths: 39,  adr: 66, grade: "C+" },
  { weapon: "Deagle", kills: 31,  deaths: 22,  adr: 74, grade: "B+" },
]

// Utility tab
export const UTILITY_TYPE_BREAKDOWN = [
  { label: "Flashes",      raw: "0.42 value",  value: 42, color: "#F59E0B" },
  { label: "Smokes",       raw: "78 / 100",    value: 78, color: "#22D3EE" },
  { label: "Molotovs",     raw: "61 / 100",    value: 61, color: "#EF4444" },
  { label: "HE Grenades",  raw: "47 avg dmg",  value: 47, color: "#10B981" },
]

export const BEST_UTILITY_MAPS = [
  { map: "Inferno", score: 78, best: "Banana smokes" },
  { map: "Ancient", score: 74, best: "A-site molly" },
  { map: "Mirage",  score: 69, best: "Window smoke" },
]

export const WEAK_UTILITY_MAPS = [
  { map: "Nuke",   score: 54, issue: "Late outside smokes" },
  { map: "Mirage", score: 61, issue: "Low flash follow-up" },
  { map: "Anubis", score: 58, issue: "Unused utility" },
]

// Positioning tab
export const DEATH_TIMING = [
  { label: "Before 1:30",   value: 14, color: "#EF4444" },
  { label: "1:30 – 1:00",   value: 26, color: "#F59E0B" },
  { label: "1:00 – 0:30",   value: 38, color: "#22D3EE" },
  { label: "After 0:30",    value: 22, color: "#10B981" },
]

export const RISK_ZONES = [
  { map: "Mirage",  zone: "Connector", deaths: 18, cause: "dry peek" },
  { map: "Inferno", zone: "Banana",    deaths: 13, cause: "no trade" },
  { map: "Nuke",    zone: "Outside",   deaths: 9,  cause: "late smoke" },
]

// Economy tab
export const BUY_TYPE_PERFORMANCE = [
  { type: "Full buy",  rounds: 82, winRate: 58, avgImpact: 81, color: "#9F67FF" },
  { type: "Force buy", rounds: 19, winRate: 32, avgImpact: 54, color: "#F59E0B" },
  { type: "Eco",       rounds: 21, winRate: 14, avgImpact: 39, color: "#EF4444" },
  { type: "Half buy",  rounds: 16, winRate: 31, avgImpact: 48, color: "#22D3EE" },
]

// Clutch tab
export const CLUTCH_BREAKDOWN = [
  { situation: "1v1",       attempts: 14, winRate: 57, color: "#10B981" },
  { situation: "1v2",       attempts: 11, winRate: 27, color: "#22D3EE" },
  { situation: "1v3",       attempts: 4,  winRate: 0,  color: "#EF4444" },
  { situation: "Post-plant",attempts: 9,  winRate: 44, color: "#9F67FF" },
  { situation: "Retake",    attempts: 12, winRate: 33, color: "#F59E0B" },
]

export const LATE_ROUND_MISTAKES = [
  { rank: 1, title: "Reload after first kill",  rounds: 4 },
  { rank: 2, title: "Wide swing after plant",   rounds: 3 },
  { rank: 3, title: "Low time awareness",        rounds: 5 },
]

// Maps tab
export const MAP_MATRIX = [
  { map: "Mirage",  matches: 18, winRate: 61, aim: 84, util: 69, position: 62, grade: "B+" },
  { map: "Inferno", matches: 13, winRate: 46, aim: 76, util: 78, position: 55, grade: "C+" },
  { map: "Ancient", matches: 9,  winRate: 67, aim: 88, util: 74, position: 71, grade: "A-" },
  { map: "Nuke",    matches: 7,  winRate: 42, aim: 69, util: 54, position: 48, grade: "C" },
]

export const BEST_MAP_DETAIL = {
  map: "Ancient",
  winRate: 67,
  grade: "A-",
  strongestSide: "T",
  bestSkill: "Entry duels",
  weakPoint: "Clutch conversion",
}

export const WORST_MAP_DETAIL = {
  map: "Nuke",
  winRate: 42,
  grade: "C",
  mainIssue: "Outside control",
  weakestSkill: "Utility timing",
  recommendation: "Focus outside smoke timings",
}
