"use client"

import { use } from "react"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

import { REPORTS } from "@/lib/report-data"
import { getEntitlements } from "@/lib/billing-data"
import { ReportHeader } from "@/components/app/report/report-header"
import { GradeCards } from "@/components/app/report/grade-cards"
import { AISummary, KeyStats } from "@/components/app/report/summary-stats"
import { RoundTimeline } from "@/components/app/report/round-timeline"
import { HeatmapBlock } from "@/components/app/report/heatmap-block"
import { DuelBreakdown } from "@/components/app/report/duel-breakdown"
import { UtilityAnalysis } from "@/components/app/report/utility-analysis"
import { EconomyAnalysis } from "@/components/app/report/economy-analysis"
import { MistakeBreakdown } from "@/components/app/report/mistake-breakdown"
import { TrainingFocus } from "@/components/app/report/training-focus"
import { ReportNav } from "@/components/app/report/report-nav"
import { LockedFeature } from "@/components/app/billing/locked-feature"

export default function MatchReportPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params)
  const report = REPORTS[matchId]
  // In production this would come from session/auth context.
  // Simulate a "pro" user so the full report is visible by default.
  const ent = getEntitlements("pro")

  // Report not found
  if (!report) {
    return (
      <div className="min-h-screen p-7 flex flex-col items-center justify-center" style={{ background: "#05050A" }}>
        <div
          className="flex flex-col items-center text-center p-8 rounded-2xl max-w-md"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="font-display text-xl font-bold text-white mb-2">Report Not Found</h1>
          <p className="text-sm text-zinc-500 mb-6">
            The match report you&apos;re looking for doesn&apos;t exist or hasn&apos;t been processed yet.
          </p>
          <Link
            href="/matches"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 0 12px rgba(124,58,237,0.25)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Matches
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-7 pb-20" style={{ background: "#05050A" }}>
      {/* Back link */}
      <Link
        href="/matches"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-white transition-colors mb-5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Matches
      </Link>

      {/* Sticky section nav */}
      <ReportNav />

      {/* Section: Overview */}
      <section id="overview">
        {/* Match Header */}
        <ReportHeader report={report} />

        {/* Tactical Grade Cards */}
        <GradeCards report={report} />

        {/* AI Summary + Key Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <AISummary report={report} />
          <KeyStats report={report} />
        </div>
      </section>

      {/* Section: Round Timeline */}
      <section id="rounds" className="mb-5 scroll-mt-28">
        {ent.roundTimeline ? (
          <RoundTimeline report={report} />
        ) : (
          <LockedFeature
            featureKey="roundTimeline"
            overlay
            title="Round Timeline — Pro Feature"
            description="Unlock per-round tactical breakdowns with full kill feeds and player positions."
          >
            <RoundTimeline report={report} />
          </LockedFeature>
        )}
      </section>

      {/* Section: Heatmap */}
      <section id="heatmap" className="mb-5 scroll-mt-28">
        {ent.heatmaps ? (
          <HeatmapBlock report={report} />
        ) : (
          <LockedFeature
            featureKey="heatmaps"
            overlay
            title="Kill / Death Heatmap — Pro Feature"
            description="Unlock full tactical heatmaps showing your kill and death clusters across the map."
          >
            <HeatmapBlock report={report} />
          </LockedFeature>
        )}
      </section>

      {/* Section: Duels + Utility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <section id="duels" className="scroll-mt-28">
          <DuelBreakdown report={report} />
        </section>
        <section id="utility" className="scroll-mt-28">
          <UtilityAnalysis report={report} />
        </section>
      </div>

      {/* Section: Economy */}
      <section id="economy" className="mb-5 scroll-mt-28">
        <EconomyAnalysis report={report} />
      </section>

      {/* Section: Mistakes */}
      <section id="mistakes" className="mb-5 scroll-mt-28">
        {ent.mistakeBreakdown ? (
          <MistakeBreakdown report={report} />
        ) : (
          <LockedFeature
            featureKey="mistakeBreakdown"
            title="Mistake Breakdown — Pro Feature"
            description="Upgrade to Pro to see AI-detected mistake patterns with severity ratings and recommendations."
            className="min-h-[180px]"
          />
        )}
      </section>

      {/* Section: Training Focus */}
      <section id="training" className="scroll-mt-28">
        <TrainingFocus report={report} />
      </section>
    </div>
  )
}
