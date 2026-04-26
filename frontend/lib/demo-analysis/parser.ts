import { DemoSchema, SCHEMA_VERSION, type Demo, type DemoEvent } from "@/lib/demo-analysis/types"

export interface ParserInput {
  demoId: string
  map: string
  source: string
  uploadedAtIso: string
  rawLines: string[]
}

function createEventId(index: number, timestampMs: number) {
  return `evt_${timestampMs}_${index}`
}

function parseRawLine(line: string, index: number): DemoEvent | null {
  const parts = line.split("|")
  const [timestampRaw, type, actorName, targetName, value] = parts

  const timestampMs = Number(timestampRaw)
  if (Number.isNaN(timestampMs) || !type) {
    return null
  }

  const base = {
    id: createEventId(index, timestampMs),
    timestampMs,
  }

  if (type === "KILL") {
    return {
      ...base,
      type: "player_kill",
      actor: actorName ? { id: actorName.toLowerCase(), name: actorName, team: "UNKNOWN" } : null,
      target: targetName ? { id: targetName.toLowerCase(), name: targetName, team: "UNKNOWN" } : null,
      payload: { weapon: value ?? "unknown" },
    }
  }

  if (type === "DMG") {
    return {
      ...base,
      type: "player_damage",
      actor: actorName ? { id: actorName.toLowerCase(), name: actorName, team: "UNKNOWN" } : null,
      target: targetName ? { id: targetName.toLowerCase(), name: targetName, team: "UNKNOWN" } : null,
      payload: { amount: Number(value ?? 0) || 0 },
    }
  }

  if (type === "UTIL") {
    return {
      ...base,
      type: "utility_thrown",
      actor: actorName ? { id: actorName.toLowerCase(), name: actorName, team: "UNKNOWN" } : null,
      target: null,
      payload: { utility: value ?? "unknown" },
    }
  }

  if (type === "ROUND_START") {
    return {
      ...base,
      type: "round_start",
      actor: null,
      target: null,
      payload: { round: Number(value ?? 0) || 0 },
    }
  }

  if (type === "ROUND_END") {
    return {
      ...base,
      type: "round_end",
      actor: null,
      target: null,
      payload: { round: Number(value ?? 0) || 0 },
    }
  }

  return null
}

export function parseDemo(input: ParserInput): Demo {
  const events = input.rawLines
    .map((line, index) => parseRawLine(line, index))
    .filter((event): event is DemoEvent => event !== null)

  return DemoSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    demoId: input.demoId,
    source: input.source,
    map: input.map,
    uploadedAtIso: input.uploadedAtIso,
    events,
  })
}
