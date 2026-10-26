# Task 65: Specify and Build Monetization and Analytics APIs

**Phase:** Phase 11 — Admin & Platform · **Priority:** P3 · **Depends on:** Task 03, Task 50, Task 64 · **Audit source:** Feature spec vs backend (mvp-gap / DASHBOARD plan rows); `docs/mvp-gap-analysis-and-monorepo-roadmap.md:93-94,161-162,200`

## Overview & Root Cause
The roadmap lists subscriptions, commission rules, payouts, payments/transactions and platform-wide analytics as platform capabilities. None of them exist in the backend: there are no tables, routes or modules. Unlike every other gap in this plan, there is **no detailed product spec** for these features, only one-line mentions. This task is spec-first: no code may be written until the spec is approved.

## Evidence
- `docs/mvp-gap-analysis-and-monorepo-roadmap.md:93` — "No audited REST group supports Super Admin dashboard actions for subscriptions, payouts, commissions, or platform analytics."
- `docs/mvp-gap-analysis-and-monorepo-roadmap.md:94` — "Payments, transactions, subscriptions, platform commissions, payouts … do not [exist]."
- `docs/mvp-gap-analysis-and-monorepo-roadmap.md:200` — "defer billing/payout UI until payment and …"
- Repo-wide grep for `subscription|payout|commission` under `backend/modules` finds nothing.
- `backend/modules/Dashboard/Http/Actions/OverviewAction.php:36` — `'revenue' => 0.0` is hard-coded, so no revenue data source exists.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Phase A (spec): write `backend/docs/features/BE-20-monetization.md` covering entities, state machines, money representation and currency, and the payment provider.
- Decision required: payment provider (none, or a named PSP), and whether payments are online at booking time or offline.
- Decision required: subscription plans and how they map to the brand feature flags from Task 50 (`multi_branch`, `job_board`).
- Decision required: commission model (percent or fixed; per booking or per period) and payout schedule.
- Phase B (build, only after the spec is approved): modules for subscriptions, commissions, payouts and analytics, all behind `auth:admin_api`, with policies and feature tests.
### Dashboard (BFF / React)
- After Phase B: admin pages for plans, commission rules, payouts and a platform analytics overview, behind new allowlisted BFF paths.
### Mobile (Flutter / Repositories)
- None until the spec decides whether clients pay in-app.

## Acceptance Criteria
- [ ] [NEEDSHIL] `backend/docs/features/BE-20-monetization.md` exists, every "Decision required" above is answered, and it is marked approved by the product owner. **Status: drafted, not approved.** The document is written (`backend/docs/features/BE-20-monetization.md`) with all three decisions (payment provider/timing, subscription→feature-flag mapping, commission model/payout schedule) recorded as open `[NEEDSHIL]` questions — these are genuine business/pricing/vendor decisions with zero trace in the codebase or docs to infer from, not engineering judgment calls. A human product owner must answer them and flip the document's status to `Approved` before Phase B starts.
- [x] Phase B is not started (no migrations or routes) before that approval. A PR reviewer can check this. No `subscriptions`/`commission_rules`/`payouts`/`transactions` migration, module, or route was added.
- [ ] After Phase B, every new route is under `auth:admin_api` (a feature test asserts 401/403 for the other guards), and every money column uses integer minor units plus a currency id. **Blocked on the approval above; not started.**
- [x] `OverviewAction` returns real revenue computed from completed bookings, or from transactions once they exist, instead of `0.0`. Feature test `DashboardOverviewRevenueTest` covers it. This AC does not depend on the Phase A/B decisions (no payments table is needed to sum existing completed-booking service prices), so it shipped now; see `backend/docs/features/BE-20-monetization.md` for the one call site to repoint once a transactions table exists.
- [x] `php artisan test` passes; Pint is clean (PHPStan is exempted repo-wide per `backend/CLAUDE.md`).

## Out of Scope
- Brand feature flags themselves (Task 50).
- Overview currency formatting in the UI (Task 72).
