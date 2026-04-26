import { PlayerHeader }          from "@/components/app/dashboard/player-header"
import { KpiCards }               from "@/components/app/dashboard/kpi-cards"
import { PerformanceTrend }       from "@/components/app/dashboard/performance-trend"
import { WeaknessDetection }      from "@/components/app/dashboard/weakness-detection"
import { RecentMatches }          from "@/components/app/dashboard/recent-matches"
import { TacticalMapPulse }       from "@/components/app/dashboard/tactical-map-pulse"
import { TodaysRecommendations }  from "@/components/app/dashboard/todays-recommendations"
import { DemoLimitBanner }        from "@/components/app/billing/demo-limit-banner"

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-7 pb-12" style={{ background: "#05050A" }}>
      {/* Demo limit nudge — shown when user is near/at limit */}
      <DemoLimitBanner used={3} limit={3} plan="Free" />

      {/* Player header */}
      <PlayerHeader />

      {/* KPI cards row */}
      <KpiCards />

      {/* Mid row: chart (60%) + weakness (40%) */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        <div className="col-span-3 min-h-[380px]">
          <PerformanceTrend />
        </div>
        <div className="col-span-2 min-h-[380px]">
          <WeaknessDetection />
        </div>
      </div>

      {/* Bottom row: recent matches (45%) + map pulse (55%) */}
      <div className="grid grid-cols-9 gap-5 mb-5">
        <div className="col-span-4 min-h-[340px]">
          <RecentMatches />
        </div>
        <div className="col-span-5 min-h-[340px]">
          <TacticalMapPulse />
        </div>
      </div>

      {/* Training focus */}
      <TodaysRecommendations />
    </div>
  )
}
