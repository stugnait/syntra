# SYNTRA Frontend Analysis (Deep Dive)

## 1) What this project is
SYNTRA frontend is a **Next.js 16 + React 19** tactical analytics dashboard for CS2 players.
Product positioning is visible across landing/auth/app routes:
- Value prop: AI-powered match intelligence, demo parsing, tactical reports, heatmaps, recommendations.
- Core entities: matches, report grades, utility/aim/positioning metrics, billing plans, onboarding/sync pipeline.

This is currently a **high-fidelity product prototype / frontend shell** with rich UI and simulated app logic, not yet a fully connected production frontend.

## 2) Tech stack and architecture
- Framework: Next.js App Router.
- Rendering model: mostly client components for interactive dashboards.
- Styling: Tailwind utility classes + custom gradients/glow styles.
- UI primitives: Radix-based component set under `components/ui`.
- Charts/visualization: Recharts + custom SVG/radar visuals.
- Motion: framer-motion and CSS animation utilities.

## 3) App structure (mental model)
Two major surfaces:
1. **Marketing site** (`/`) with narrative sections (Hero, Features, Pricing, FAQ).
2. **Authenticated app area** (`/(app)/*`) using shared sidebar/mobile nav shell.

Primary internal modules:
- Dashboard snapshot (`/dashboard`)
- Match archive (`/matches`) and deep report (`/matches/[matchId]`)
- Long-term analytics (`/analytics`)
- Manual demo upload + processing simulator (`/upload`, `/processing/[jobId]`)
- Progress/recommendations/heatmaps/settings/profile/billing

## 4) Data model and current state
Current frontend state is mostly mocked/static:
- Match list and statuses are in `lib/matches-data.ts`.
- Deep report schema and mock report are in `lib/report-data.ts`.
- Analytics/billing/heatmap sample datasets exist in `lib/*-data.ts`.

Important implication:
- UI and product language are already strong.
- Network/API integration layer is not yet implemented in pages/components (very little real `fetch` usage).

## 5) UX strengths
- Strong visual identity: clear cyber/tactical theme with consistent typography and color semantics.
- Good information hierarchy in analytics/report screens.
- High interaction density (filters, tabs, badges, grading, progression states).
- Onboarding and processing experiences are emotionally engaging and polished.
- Mobile navigation exists for app mode, desktop sidebar for primary workflows.

## 6) Technical gaps and risks to fix early
1. **Type safety bypass in production**
   - `next.config.mjs` sets `typescript.ignoreBuildErrors = true`.
   - This can ship runtime bugs undetected.
2. **No real API boundary yet**
   - No centralized API client, DTO validation, auth/session wiring, error policy, caching strategy.
3. **Mock-heavy flows**
   - Upload, processing, analytics, and report generation are mostly simulated timers/data.
4. **Navigation handling inconsistencies**
   - Some places still use `window.location.href` instead of Next router/link patterns.
5. **No explicit test harness in repo flow**
   - No visible unit/integration/e2e setup for critical UX and data transformations.

## 7) Suggested implementation roadmap (execution order)

### Phase A — Foundation (1 sprint)
- Introduce strict production gate: remove build error ignore.
- Add app-wide providers: auth/session, query cache (e.g., TanStack Query), error toasts.
- Define API client layer (`lib/api/*`) and typed schemas (zod).
- Add environment config contract for backend URL and feature flags.

### Phase B — Real data plumbing (1–2 sprints)
- Replace `MATCH_DATA` read path with backend list endpoint.
- Wire `/matches/[matchId]` to backend report endpoint using existing `MatchReport` shape.
- Connect upload page to real upload endpoint + job creation response.
- Poll or subscribe processing page to job status endpoint.

### Phase C — Product hardening (1 sprint)
- Add optimistic/empty/error states for each top route.
- Add route-level loading skeletons and retry UX.
- Normalize date/time/locale formatting across all pages.
- Add analytics and event tracking model per key funnel actions.

### Phase D — Quality and scale (ongoing)
- Testing pyramid:
  - unit tests for data transforms and filters
  - component tests for critical cards/tables
  - Playwright e2e for onboarding → upload → report flow
- Performance:
  - reduce client bundle pressure on large pages
  - split heavyweight chart panels
  - memoize expensive filtered views

## 8) Immediate “ready-to-code” priorities for us
1. Build `lib/api/client.ts` + typed endpoints for matches/report/upload.
2. Migrate `/matches` from static import to server/query-driven data.
3. Migrate `/processing/[jobId]` from timer simulation to live job polling.
4. Remove `ignoreBuildErrors` and fix resulting TS issues.
5. Add first smoke e2e for upload→processing→report open.

## 9) Collaboration mode going forward
I’m now aligned to this repo’s frontend domain model:
- route taxonomy
- visual language and component system
- current mock data contracts
- integration debt and rollout order

Ready to proceed in implementation mode sprint-by-sprint.
