// ── Heatmap mock data ────────────────────────────────────────────────────────

export type LayerKey = "deaths" | "kills" | "movement" | "opening_duels" | "utility" | "damage" | "clutch"

export interface HeatPoint {
  x: number // percentage 0–100
  y: number // percentage 0–100
  zone: string
  intensity: number // 0–1
  type: LayerKey
  side: "CT" | "T" | "both"
  meta?: string
}

export interface ZoneInfo {
  name: string
  deaths: number
  kills: number
  duelDiff: number
  untradedDeaths: number
  avgDeathTime: string
  mainIssue: string
  severity: "High" | "Medium" | "Low"
}

export interface RelatedExample {
  match: string
  round: number
  description: string
}

export const HEATMAP_ZONES: Record<string, ZoneInfo> = {
  Connector: {
    name: "Connector",
    deaths: 18,
    kills: 11,
    duelDiff: -7,
    untradedDeaths: 11,
    avgDeathTime: "1:23",
    mainIssue: "Dry early peeks",
    severity: "High",
  },
  "A Site": {
    name: "A Site",
    deaths: 9,
    kills: 14,
    duelDiff: 5,
    untradedDeaths: 3,
    avgDeathTime: "0:54",
    mainIssue: "Post-plant positioning",
    severity: "Low",
  },
  "B Apartments": {
    name: "B Apartments",
    deaths: 12,
    kills: 8,
    duelDiff: -4,
    untradedDeaths: 7,
    avgDeathTime: "1:40",
    mainIssue: "Stacked entries without flash",
    severity: "Medium",
  },
  "Mid Window": {
    name: "Mid Window",
    deaths: 6,
    kills: 9,
    duelDiff: 3,
    untradedDeaths: 2,
    avgDeathTime: "0:48",
    mainIssue: "Consistent flash timing",
    severity: "Low",
  },
  "B Site": {
    name: "B Site",
    deaths: 10,
    kills: 7,
    duelDiff: -3,
    untradedDeaths: 5,
    avgDeathTime: "0:35",
    mainIssue: "Late rotations",
    severity: "Medium",
  },
}

export const RELATED_EXAMPLES: RelatedExample[] = [
  { match: "Mirage 13:9",  round: 4,  description: "Died untraded in connector" },
  { match: "Mirage 11:13", round: 9,  description: "Lost opening duel" },
  { match: "Mirage 8:13",  round: 16, description: "Peeked without flash support" },
]

// Points per layer for Mirage (normalised x/y to % of map image dimensions)
export const MIRAGE_POINTS: Record<LayerKey, HeatPoint[]> = {
  deaths: [
    { x: 42, y: 38, zone: "Connector",    intensity: 0.9, type: "deaths", side: "CT" },
    { x: 44, y: 36, zone: "Connector",    intensity: 0.8, type: "deaths", side: "CT" },
    { x: 40, y: 40, zone: "Connector",    intensity: 0.7, type: "deaths", side: "CT" },
    { x: 72, y: 28, zone: "A Site",       intensity: 0.5, type: "deaths", side: "both" },
    { x: 70, y: 30, zone: "A Site",       intensity: 0.4, type: "deaths", side: "both" },
    { x: 18, y: 68, zone: "B Apartments", intensity: 0.7, type: "deaths", side: "T" },
    { x: 20, y: 65, zone: "B Apartments", intensity: 0.6, type: "deaths", side: "T" },
    { x: 50, y: 22, zone: "Mid Window",   intensity: 0.3, type: "deaths", side: "both" },
    { x: 22, y: 80, zone: "B Site",       intensity: 0.5, type: "deaths", side: "CT" },
  ],
  kills: [
    { x: 43, y: 37, zone: "Connector",    intensity: 0.6, type: "kills", side: "CT" },
    { x: 75, y: 25, zone: "A Site",       intensity: 0.8, type: "kills", side: "both" },
    { x: 73, y: 27, zone: "A Site",       intensity: 0.7, type: "kills", side: "both" },
    { x: 15, y: 70, zone: "B Apartments", intensity: 0.5, type: "kills", side: "T" },
    { x: 52, y: 20, zone: "Mid Window",   intensity: 0.7, type: "kills", side: "both" },
    { x: 50, y: 23, zone: "Mid Window",   intensity: 0.6, type: "kills", side: "both" },
    { x: 20, y: 82, zone: "B Site",       intensity: 0.4, type: "kills", side: "CT" },
  ],
  movement: [
    { x: 42, y: 50, zone: "Connector",    intensity: 0.8, type: "movement", side: "CT", meta: "Repeated risky path" },
    { x: 60, y: 45, zone: "Mid",          intensity: 0.6, type: "movement", side: "both" },
    { x: 30, y: 60, zone: "B Short",      intensity: 0.5, type: "movement", side: "T" },
    { x: 70, y: 35, zone: "A Site",       intensity: 0.7, type: "movement", side: "T" },
    { x: 20, y: 75, zone: "B Apartments", intensity: 0.6, type: "movement", side: "T" },
  ],
  opening_duels: [
    { x: 42, y: 38, zone: "Connector",  intensity: 0.9, type: "opening_duels", side: "CT" },
    { x: 50, y: 22, zone: "Mid Window", intensity: 0.7, type: "opening_duels", side: "both" },
    { x: 72, y: 28, zone: "A Site",     intensity: 0.6, type: "opening_duels", side: "both" },
    { x: 18, y: 68, zone: "B Apts",     intensity: 0.5, type: "opening_duels", side: "T" },
  ],
  utility: [
    { x: 50, y: 25, zone: "Mid Window",   intensity: 0.8, type: "utility", side: "CT", meta: "Window smoke – 72% success" },
    { x: 68, y: 30, zone: "A Site",       intensity: 0.7, type: "utility", side: "T",  meta: "A-site flash – 58% success" },
    { x: 22, y: 70, zone: "B Apartments", intensity: 0.6, type: "utility", side: "CT", meta: "B-apps flash – 44% success" },
    { x: 30, y: 80, zone: "B Site",       intensity: 0.5, type: "utility", side: "T",  meta: "B molotov – 62% success" },
  ],
  damage: [
    { x: 43, y: 37, zone: "Connector", intensity: 0.8, type: "damage", side: "CT" },
    { x: 72, y: 27, zone: "A Site",    intensity: 0.9, type: "damage", side: "both" },
    { x: 17, y: 68, zone: "B Apts",    intensity: 0.6, type: "damage", side: "T" },
  ],
  clutch: [
    { x: 72, y: 28, zone: "A Site", intensity: 0.7, type: "clutch", side: "CT" },
    { x: 22, y: 80, zone: "B Site", intensity: 0.5, type: "clutch", side: "CT" },
    { x: 42, y: 38, zone: "Connector", intensity: 0.4, type: "clutch", side: "CT" },
  ],
}

export const LAYER_COLORS: Record<LayerKey, { point: string; glow: string; label: string }> = {
  deaths:       { point: "#EF4444", glow: "rgba(239,68,68,0.5)",   label: "Deaths" },
  kills:        { point: "#10B981", glow: "rgba(16,185,129,0.5)",  label: "Kills" },
  movement:     { point: "#22D3EE", glow: "rgba(34,211,238,0.5)",  label: "Movement" },
  opening_duels:{ point: "#9F67FF", glow: "rgba(159,103,255,0.5)", label: "Opening Duels" },
  utility:      { point: "#F59E0B", glow: "rgba(245,158,11,0.5)",  label: "Utility" },
  damage:       { point: "#F97316", glow: "rgba(249,115,22,0.5)",  label: "Damage" },
  clutch:       { point: "#EC4899", glow: "rgba(236,72,153,0.5)",  label: "Clutch" },
}
