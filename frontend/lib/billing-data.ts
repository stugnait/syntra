// ── Billing / Subscription data types & mock state ──────────────────────────

export type PlanSlug = "free" | "pro" | "team"
export type BillingInterval = "monthly" | "yearly"
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "failed"

export interface PlanPrice {
  monthly: number
  yearly: number   // full year price (already discounted)
}

export interface Plan {
  slug: PlanSlug
  name: string
  tagline: string
  prices: PlanPrice
  featured?: boolean
  badge?: string
  features: string[]
  limits: {
    monthlyDemoLimit: number | null   // null = unlimited
    teamSeats: number
    storageGB: number
    syncFrequencyMinutes: number
  }
  entitlements: {
    heatmaps: boolean
    aiRecommendations: boolean
    pdfExport: boolean
    roundTimeline: boolean
    mistakeBreakdown: boolean
    teamFeatures: boolean
    progressTracking: boolean
  }
}

export const PLANS: Plan[] = [
  {
    slug: "free",
    name: "Free",
    tagline: "Get a taste of tactical intelligence.",
    prices: { monthly: 0, yearly: 0 },
    features: [
      "3 analyzed matches per month",
      "Basic match stats (K/D, ADR, HS%)",
      "Match history (last 10)",
      "FACEIT profile connection",
      "Manual sync",
      "Limited dashboard",
    ],
    limits: {
      monthlyDemoLimit: 3,
      teamSeats: 1,
      storageGB: 1,
      syncFrequencyMinutes: 120,
    },
    entitlements: {
      heatmaps: false,
      aiRecommendations: false,
      pdfExport: false,
      roundTimeline: false,
      mistakeBreakdown: false,
      teamFeatures: false,
      progressTracking: false,
    },
  },
  {
    slug: "pro",
    name: "Pro",
    tagline: "Unlock your full performance intelligence.",
    prices: { monthly: 9, yearly: 79 },
    featured: true,
    badge: "Most Popular",
    features: [
      "50 analyzed demos per month",
      "Automatic FACEIT sync",
      "Full deep match reports",
      "Tactical kill-zone heatmaps",
      "AI coaching recommendations",
      "Aim / utility / positioning analytics",
      "Progress tracking (90 days)",
      "PDF export",
      "Priority demo processing",
    ],
    limits: {
      monthlyDemoLimit: 50,
      teamSeats: 1,
      storageGB: 20,
      syncFrequencyMinutes: 15,
    },
    entitlements: {
      heatmaps: true,
      aiRecommendations: true,
      pdfExport: true,
      roundTimeline: true,
      mistakeBreakdown: true,
      teamFeatures: false,
      progressTracking: true,
    },
  },
  {
    slug: "team",
    name: "Team",
    tagline: "For stacks, coaches, and semi-pro squads.",
    prices: { monthly: 29, yearly: 249 },
    features: [
      "Everything in Pro",
      "Up to 5 player seats",
      "Shared team workspace",
      "Team dashboard & comparison",
      "Coach notes",
      "Cross-player heatmap overlay",
      "Shared match reports",
      "Team economy analysis",
      "API access",
    ],
    limits: {
      monthlyDemoLimit: null,
      teamSeats: 5,
      storageGB: 100,
      syncFrequencyMinutes: 5,
    },
    entitlements: {
      heatmaps: true,
      aiRecommendations: true,
      pdfExport: true,
      roundTimeline: true,
      mistakeBreakdown: true,
      teamFeatures: true,
      progressTracking: true,
    },
  },
]

export function getPlan(slug: PlanSlug): Plan {
  return PLANS.find((p) => p.slug === slug)!
}

// ── Mock current subscription (simulates a Pro user) ────────────────────────
export interface MockSubscription {
  plan: PlanSlug
  status: SubscriptionStatus
  interval: BillingInterval
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  usage: {
    demoReportsUsed: number
    storageGB: number
    teamSeats: number
  }
  paymentMethod: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
}

export const MOCK_SUBSCRIPTION: MockSubscription = {
  plan: "pro",
  status: "active",
  interval: "monthly",
  currentPeriodEnd: "2026-05-26",
  cancelAtPeriodEnd: false,
  usage: {
    demoReportsUsed: 18,
    storageGB: 2.4,
    teamSeats: 1,
  },
  paymentMethod: {
    brand: "Visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2027,
  },
}

export interface MockInvoice {
  id: string
  date: string
  plan: string
  amount: number
  status: "paid" | "failed" | "refunded" | "pending"
}

export const MOCK_INVOICES: MockInvoice[] = [
  { id: "inv_001", date: "Apr 26, 2026", plan: "SYNTRA Pro", amount: 9, status: "paid" },
  { id: "inv_002", date: "Mar 26, 2026", plan: "SYNTRA Pro", amount: 9, status: "paid" },
  { id: "inv_003", date: "Feb 26, 2026", plan: "SYNTRA Pro", amount: 9, status: "paid" },
  { id: "inv_004", date: "Jan 26, 2026", plan: "SYNTRA Pro", amount: 9, status: "paid" },
]

// ── Entitlement helpers ──────────────────────────────────────────────────────
export function getEntitlements(slug: PlanSlug) {
  return getPlan(slug).entitlements
}

export const FEATURE_LABELS: Record<string, string> = {
  heatmaps: "Tactical Heatmaps",
  aiRecommendations: "AI Recommendations",
  pdfExport: "PDF Export",
  roundTimeline: "Round Timeline",
  mistakeBreakdown: "Mistake Breakdown",
  teamFeatures: "Team Features",
  progressTracking: "Progress Tracking",
}
