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
- Decision required: keep or remove the client-side dispute route (client disputing their own review has no spec basis).
- Admin can resolve at any time inside the window; a scheduled command auto-resolves (re-publishes) disputes older than 48 hours without an admin decision.
- Disputed reviews are excluded from rating aggregates while disputed (coordinate with Task 42).
### Dashboard (BFF / React)
- Manager: "Dispute" action on branch reviews (Task 74 reviews view).
- Admin: dispute queue + resolve action (Task 76).
### Mobile (Flutter / Repositories)
- Business app dispute action (Task 85). Remove the unused client dispute call if the client route is dropped.

## Acceptance Criteria
- [ ] Branch manager disputing a review of their branch → 200, status `disputed`, `disputed_at` set; disputing another branch's review → 403.
- [ ] Admin (`admin_api` token) resolving a disputed review within 48h → 200.
- [ ] Scheduled command, run with time travel past 48h, sets unresolved disputes back to `published`; Feature/Unit test covers it and the command is registered in the scheduler.
- [ ] Disputed reviews are not counted in `rating_min` filtering (test).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Admin guard swap — Task 03.
- Admin moderation UI — Task 76.
