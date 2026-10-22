# Task 41: Complete Review Dispute Workflow

**Phase:** Reviews · **Priority:** P1 · **Depends on:** Task 03, Task 40 · **Audit source:** Product-spec audit — Reviews (`backend/docs/02_prd.md:139`, `backend/docs/04_house-rules.md:117`); backend route audit (admin guard)

## Overview & Root Cause
The PRD has the reviewed shop flag a review as disputed, with an admin decision inside a 48-hour window. In code only the review's own author (the client) can flag a dispute, which inverts the intent. The admin resolve handler only allows resolution after 48 hours have passed, and there is no job that auto-releases a dispute when the window expires. The admin route also sits behind the session-based `auth:admin` guard (fixed by Task 03).

## Evidence
- `backend/modules/Review/Handlers/Client/FlagReviewDisputeHandler.php:20` — requires `author_id === clientId`.
- `backend/modules/Review/Handlers/Admin/ResolveReviewDisputeHandler.php:23` — rejects resolution while `disputedAt > now()->subHours(48)`.
- `backend/modules/Review/Routes/Api/V1/reviews.php:13,16-17` — client dispute route; admin resolve under `auth:admin`.
- `backend/modules/Review/Enums/ReviewStatus.php` — `Published`, `Disputed`, `Resolved`, `Hidden`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- New `POST /api/v1/branch/reviews/{review}/dispute` (`auth:branch_api`) allowed only when the review subject is the manager's branch (and barber equivalent if barber subjects exist after Task 39).
  - **Decision (resolved, best option): remove it.** The spec gives the dispute to the reviewed shop; the author route inverted that and nothing calls it. Barbers dispute their own barber-subject reviews (Task 39).
- Admin can resolve at any time inside the window; a scheduled command auto-resolves (re-publishes) disputes older than 48 hours without an admin decision.
- Disputed reviews are excluded from rating aggregates while disputed (coordinate with Task 42).
### Implemented contract
- Shared code path: `Modules\Review\Handlers\Staff\FlagReviewDisputeHandler::handle()` (branch and barber routes), `Modules\Review\Handlers\Admin\ResolveReviewDisputeHandler`, `Modules\Review\Console\Commands\ReleaseExpiredReviewDisputesCommand` (`reviews:release-expired-disputes`, scheduled hourly in `ReviewServiceProvider`). Rating filters: `ExploreBranchesEloquentResolver` / `ExploreBarbersEloquentResolver` count only `published` reviews.
- Scope of the rule: only the review's subject (branch for `branch`, barber for `barber`) may dispute, only while the review is `published`; a dispute sets `status = disputed`, `dispute_reason`, `disputed_at` and clears earlier resolution fields. Admin resolve works while `disputed` (no minimum wait); after 48 h without a decision the command re-publishes it (`resolved_at = now`, `resolved_by = null`).
- Request: `POST /api/v1/branch/reviews/{review}/dispute` (`auth:branch_api`), `POST /api/v1/barber/reviews/{review}/dispute` (`auth:barber` + active barber): `reason` (required, 10–1000 chars). `PATCH /api/v1/admin/reviews/{review}/resolve` (`auth:admin_api`): `status` ∈ `published|hidden` (unchanged).
- Failure: 403 `dispute_not_reviewed_party` (not the review's subject) and 422 `dispute_not_allowed` (not published), `code = REVIEW_VALIDATION_FAILED`; admin resolve of a non-disputed review → 422 `dispute_resolution_not_available`. `POST /api/v1/client/reviews/{review}/dispute` is removed (404).
- Success: 200 with the `ReviewResource` (`status = disputed` or the resolved status).
- Dashboard: none in this task (manager dispute action → Task 74, admin queue → Task 76). Mobile: no app called the client dispute route, so nothing is removed; the business/stylist dispute action is Task 85/83 (routes above). Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`, Task 42/74/76/83/85 notes.
- Deviations from the original spec text: none. Fixed in passing: `rating_min` compared `avg(rating)` with a bound float that SQLite treats as text, so the filter matched nothing in the test environment; the comparison is now numeric on both engines (`havingRaw('avg(rating) >= (? + 0)')`).

### Dashboard (BFF / React)
- Manager: "Dispute" action on branch reviews (Task 74 reviews view).
- Admin: dispute queue + resolve action (Task 76).
### Mobile (Flutter / Repositories)
- Business app dispute action (Task 85). Remove the unused client dispute call if the client route is dropped.

## Acceptance Criteria
- [x] Branch manager disputing a review of their branch → 200, status `disputed`, `disputed_at` set; disputing another branch's review → 403.
- [x] Admin (`admin_api` token) resolving a disputed review within 48h → 200.
- [x] Scheduled command, run with time travel past 48h, sets unresolved disputes back to `published`; Feature/Unit test covers it and the command is registered in the scheduler.
- [x] Disputed reviews are not counted in `rating_min` filtering (test).
- [x] `php artisan test` passes; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Admin guard swap — Task 03.
- Admin moderation UI — Task 76.
