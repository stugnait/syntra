import { z } from "zod"

export const SCHEMA_VERSION = "1.0.0"

export const ActorSchema = z.object({
  id: z.string(),
  name: z.string(),
  team: z.enum(["T", "CT", "UNKNOWN"]),
})

export const DemoEventSchema = z.object({
  id: z.string(),
  timestampMs: z.number().nonnegative(),
  type: z.enum(["player_kill", "player_damage", "utility_thrown", "round_start", "round_end"]),
  actor: ActorSchema.nullable(),
  target: ActorSchema.nullable(),
  payload: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])),
})

export const DemoSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  demoId: z.string(),
  source: z.string(),
  map: z.string(),
  uploadedAtIso: z.string(),
  events: z.array(DemoEventSchema),
})

export const MetricSchema = z.object({
  name: z.string(),
  value: z.union([z.number(), z.string()]),
  scope: z.enum(["match", "player", "round"]),
})

export const AnalysisReportSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  demoId: z.string(),
  generatedAtIso: z.string(),
  metrics: z.array(MetricSchema),
})

export type Actor = z.infer<typeof ActorSchema>
export type DemoEvent = z.infer<typeof DemoEventSchema>
export type Demo = z.infer<typeof DemoSchema>
export type Metric = z.infer<typeof MetricSchema>
export type AnalysisReport = z.infer<typeof AnalysisReportSchema>
