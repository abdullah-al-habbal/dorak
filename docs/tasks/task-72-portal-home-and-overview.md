# Task 72: Replace Portal Home Placeholders and Fix Overview

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** Task 57 (currency), Task 65 (revenue source, partial) · **Audit source:** Dashboard BFF/UI audit (portal root stub, overview metrics); revenue constant verified in session

## Overview & Root Cause
The admin and manager portal roots render a generic placeholder, "Your protected portal shell is ready for authenticated features.", and the sidebar's first item ("dashboard") points to them. The overview page formats revenue with a hard-coded `currency: "USD"` and uses inline English strings. The backend overview returns `'revenue' => 0.0` unconditionally, so the revenue tile is always wrong.

## Evidence
- `frontend/dashboard/src/app/(portals)/admin/page.tsx` and `…/manager/page.tsx` — `createPortalPage()`.
- `frontend/dashboard/src/i18n/messages/en.constant.ts:29` — the placeholder description string.
- `frontend/dashboard/src/config/routes.constant.ts:62-68` — `PORTAL_NAVIGATION` "dashboard" item points to the portal root for all actors.
- `frontend/dashboard/src/components/overview/overview-dashboard.tsx:22-25,37` — inline "Today bookings", "Active chairs", "Stylists", "Revenue", "No bookings today." and `currency: "USD"`.
- `backend/modules/Dashboard/Http/Actions/OverviewAction.php:36` — `'revenue' => 0.0`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Compute `revenue` as the sum of completed bookings' service prices in the actor scope and today's window. Return `revenue_currency` (the brand base currency, or the platform default for admin).
- Decision required: an admin viewing several brands with different base currencies. Either convert to one platform currency (needs Task 57) or return revenue per currency.
### Dashboard (BFF / React)
- Admin and manager roots redirect to `/{actor}/overview`, or render the overview. Drop the duplicate "dashboard" nav item for those actors, or point it at overview. `/barber` stays the workspace.
- Revenue uses `revenue_currency` from the API. Move all overview strings into `i18n/messages/{en,ar}`.
### Mobile (Flutter / Repositories)
- None. The business app dashboard uses `GET branch/dashboard`; aligning its revenue figure with this computation is noted for Task 85.

## Acceptance Criteria
- [x] `GET /api/v1/dashboard/overview` returns a non-zero `revenue` when completed bookings exist today in scope, and `0` otherwise, plus a `revenue_currency` code. Feature test `DashboardOverviewRevenueTest` — the three original cases are unchanged, plus two new ones: a branch manager gets their brand's base currency, an admin gets the platform default.
- [x] Visiting `/admin` or `/manager` never shows the placeholder string, which no longer appears in rendered output. `src/app/(portals)/{admin,manager,owner}/page.tsx` now call `redirect(ROUTES.operations.overview(actor))`; the placeholder component (`PortalEntryPage`/`createPortalPage`) and its dictionary string (`portal.description`) were dead code after the redirect, so both were deleted rather than left unreferenced. Covered by `tests/config/routes.util.test.ts` (asserts the redirect call is present, `createPortalPage` is not) and `tests/i18n/dictionary.util.test.ts` (asserts the key is gone from both locales).
- [x] `overview-dashboard.tsx` contains no hard-coded `"USD"` and no inline English UI strings. The component already routed every label through the dictionary; only the `Intl.NumberFormat` call hard-coded `currency: "USD"` — it now uses `metric.revenueCurrency` from the API, falling back to the raw number when the API reports no currency (empty scope with no brand at all). Covered by `tests/components/overview/overview-dashboard.test.tsx`, including a static source-grep guard against the literal re-appearing.
- [x] Arabic locale renders translated overview labels. Unchanged by this task (`overviewDashboard.*` keys already existed in both locales); `dictionary.util.test.ts`'s shape-parity check still passes.
- [x] `php artisan test` and `npm run test` pass; Pint is clean; eslint and tsc are clean. (PHPStan is out of gate scope per `backend/CLAUDE.md`.) Also ran `npm run build` — green.

### Implemented contract
- Backend: `OverviewAction` gained `revenue_currency` (string or null) alongside the existing `revenue`. Resolution: one brand in scope → that brand's `base_currency`; otherwise → `CurrencyModel::where('is_default', true)`, falling back to any currency row if none is flagged default, or `null` if the database has no currency at all.
- Dashboard: `DashboardOverviewSchema`/`mapDashboardOverview` carry the new field through to `IDashboardOverview.revenueCurrency`. The `PORTAL_NAVIGATION` "dashboard" entry is now barber-only (it pointed at the same destination as "overview" for every operations actor, which is no longer a stub).

## Out of Scope
- Platform analytics, subscriptions and payouts (Task 65).
