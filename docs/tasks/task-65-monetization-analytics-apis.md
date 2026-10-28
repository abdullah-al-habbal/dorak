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
- [x] `backend/docs/features/BE-20-monetization.md` exists, every "Decision required" above is answered, and it is marked approved by the product owner. **Approved 2026-10-29** (dynamic, zero-hardcoding model; see Implemented).
- [x] Phase B was not started before that approval (the migrations arrived in the same task, after the approval above).
- [x] After Phase B, every new route is admin-only (mounted in the dashboard `admin` group and authorized by Policies; `MonetizationAuthorizationTest` asserts 401 anonymous and 403 non-admin on every route, `MonetizationPoliciesTest` asserts the Policies), and every money column uses integer minor units plus a currency id.
- [x] `OverviewAction` returns real revenue computed from completed bookings, or from transactions once they exist, instead of `0.0`. Feature test `DashboardOverviewRevenueTest` covers it. This AC does not depend on the Phase A/B decisions (no payments table is needed to sum existing completed-booking service prices), so it shipped now; see `backend/docs/features/BE-20-monetization.md` for the one call site to repoint once a transactions table exists.
- [x] `php artisan test` passes; Pint is clean (PHPStan is exempted repo-wide per `backend/CLAUDE.md`).

## Out of Scope
- Brand feature flags themselves (Task 50).
- Overview currency formatting in the UI (Task 72).

## Implemented
- **Backend** (new modules `Subscription`, `Payment`, `Commission`, `Payout`; analytics in `Dashboard`): tables `subscription_plans`, `plan_features`, `brand_subscriptions`, `payment_gateways`, `commission_rules`, `commission_entries`, `payouts`. Routes under `/api/v1/dashboard/admin/...`, see `BE-20-monetization.md` for the contract, state machines and rules. `BrandFeatures::keys()` is the one registry of mappable flags. Commission accrues from `BookingCompletedCommissionObserver`; `payouts:generate` creates drafts only. Tests: `backend/tests/Feature/Monetization/` (every route, policy and state transition).
- **Dashboard:** admin pages for plans (with feature mapping and brand subscriptions), payment gateways, commission rules, payouts and the platform analytics overview, behind allowlisted BFF paths.
- **Mobile:** no feature change. `BookingPaymentMethod`/`BookingPaymentStatus` are untouched and the mobile DTOs read them as plain strings; a core contract test pins that. A client-facing "active gateways" endpoint is deliberately not built until bookings are wired to gateways.
- **Left as is:** `OverviewAction::completedBookingsRevenue` still sums completed-booking service prices (no transactions table exists under this model).
