# Task 76: Add Admin Moderation UI

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** Task 03, Task 41, Task 53, Task 57 · **Audit source:** Dashboard BFF/UI audit (admin barber activate/deactivate, review dispute resolve, currency admin — Missing BFF Route)

## Overview & Root Cause
Admin-only backend actions have no dashboard surface: barber activation and deactivation, review dispute resolution, and exchange rates and currency conversion. Review resolve and the currency routes are also behind the session guard `auth:admin`, which a token-based BFF cannot satisfy (Task 03). There is no admin endpoint for listing disputed reviews, so even with a proxy the admin cannot find what to resolve.

## Evidence
- `backend/modules/Activation/Routes/Api/V1/activation.php:9-11` — `auth:admin_api` on `admin/barbers/{barber}/activate|deactivate`.
- `backend/modules/Review/Routes/Api/V1/reviews.php:16-17` — `auth:admin` (session) on `PATCH admin/reviews/{review}/resolve`. There is no list-disputes route in this file.
- `backend/modules/Currency/Routes/Api/V1/currencies.php:12-14` — `auth:admin` on `GET exchange-rates` and `POST currency/convert`.
- `frontend/dashboard/src/services/api/dashboard/dashboard-resource.constant.ts` — no admin moderation roots.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `GET /api/v1/admin/reviews?status=disputed` (paginated, `auth:admin_api`), unless Task 41 already delivers it.
- Rely on Task 03 for the guard fix and Task 53 for branch activation.
### Dashboard (BFF / React)
- Stylists list (admin): Activate/Deactivate action with a reason, showing the current `is_enabled` state. Invalidates `["dashboard","stylists"]`.
- Disputed reviews page: list, view review and dispute reason, Resolve (uphold or remove) with a note. Invalidates `["dashboard","reviews","disputed"]`.
- Exchange rates page: read-only rates table. Editing rates is only in scope if Task 57 adds a write endpoint.
- All pages are admin-only. Route policy (`services/api/auth/route-policy.util.ts`) blocks managers and barbers.
### Mobile (Flutter / Repositories)
- None — admin-only.

## Acceptance Criteria
- [ ] Admin deactivates a barber: 200, and the barber is shown as disabled. A manager session cannot reach the page (redirect to `/forbidden`) and the BFF returns 403 for it.
- [ ] `GET /api/v1/admin/reviews?status=disputed` returns only disputed reviews for `admin_api`, and 401/403 for other guards (feature test).
- [ ] Resolving a dispute from the UI returns 200 and removes it from the disputed list without a reload.
- [ ] Exchange rates page renders data from the backend through an admin token (proves the Task 03 guard fix end to end).
- [ ] `php artisan test` and `npm run test` pass; eslint and tsc are clean.

## Out of Scope
- Review dispute business rules and the 48-hour window (Task 41).
- Platform analytics, subscriptions and payouts (Task 65).

> Note (Task 41): admins may resolve a disputed review at any time (`PATCH admin/reviews/{review}/resolve`, `published|hidden`); unresolved disputes auto-release after 48 h.

> Note (Task 50): brand flags are toggled with `PATCH /api/v1/admin/brands/{brand}/features` (`multi_branch`, `job_board`).
