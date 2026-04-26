import { AnalysisReportSchema, SCHEMA_VERSION, type Demo, type Metric } from "@/lib/demo-analysis/types"

export function analyzeDemo(demo: Demo) {
  let kills = 0
  let deaths = 0
  let damage = 0
  let utility = 0
  let rounds = 0

  demo.events.forEach((event) => {
    if (event.type === "player_kill") {
      kills += 1
      deaths += 1
    }

    if (event.type === "player_damage") {
      const value = event.payload.amount
      if (typeof value === "number") {
        damage += value
      }
    }

    if (event.type === "utility_thrown") {
      utility += 1
    }

    if (event.type === "round_end") {
      rounds += 1
    }
  })

  const kd = deaths === 0 ? kills : kills / deaths

  const metrics: Metric[] = [
    { name: "rounds_total", value: rounds, scope: "match" },
    { name: "kills", value: kills, scope: "match" },
    { name: "deaths", value: deaths, scope: "match" },
    { name: "damage_dealt", value: damage, scope: "match" },
    { name: "utility_thrown", value: utility, scope: "match" },
    { name: "kd_ratio", value: Number(kd.toFixed(2)), scope: "match" },
  ]

  return AnalysisReportSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    demoId: demo.demoId,
    generatedAtIso: new Date().toISOString(),
    metrics,
  })
}
