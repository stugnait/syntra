import { AnimatedBg } from '@/components/syntra/animated-bg'
import { Navbar } from '@/components/syntra/navbar'
import { Hero } from '@/components/syntra/hero'
import { TrustStrip } from '@/components/syntra/trust-strip'
import { HowItWorks } from '@/components/syntra/how-it-works'
import { FeatureGrid } from '@/components/syntra/feature-grid'
import { DashboardPreview } from '@/components/syntra/dashboard-preview'
import { AIReportPreview } from '@/components/syntra/ai-report-preview'
import { Pricing } from '@/components/syntra/pricing'
import { FAQ } from '@/components/syntra/faq'
import { Footer } from '@/components/syntra/footer'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#07070F] overflow-x-hidden">
      <AnimatedBg />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <TrustStrip />
          <HowItWorks />
          <FeatureGrid />
          <DashboardPreview />
          <AIReportPreview />
          <Pricing />
          <FAQ />
        </main>
        <Footer />
      </div>
    </div>
  )
}
