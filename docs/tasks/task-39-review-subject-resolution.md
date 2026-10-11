# Task 39: Resolve Review Subject for Barber and At-Home Bookings

**Phase:** Reviews · **Priority:** P1 · **Depends on:** Task 13 · **Audit source:** Feature-spec audit — BE-05 / feature-index (barber fallback); product-spec audit — Reviews (`backend/docs/04_house-rules.md:65`)

## Overview & Root Cause
`SubmitReviewHandler` always uses the booking chair's branch as the review subject. Bookings without a chair (at-home bookings) return `noSubject` and cannot be reviewed at all, and barbers are never a review subject. `feature-index.md` documents a fallback to the barber that does not exist. A downstream effect is that barber ratings are always empty, so `rating_min` on barber discovery excludes every barber (Task 42).

## Evidence
- `backend/modules/Review/Handlers/Client/SubmitReviewHandler.php:35-38` — `$subjectId = $booking->chair?->branch_id`; `null` → `SubmitReviewResult::noSubject()`.
- `backend/modules/Review/Handlers/Client/SubmitReviewHandler.php:46` — `subject_type` hard-coded to `BranchModel`.
- `backend/modules/Barber/Models/BarberModel.php:68` — `reviews()` MorphMany exists but nothing writes barber-subject reviews.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Resolve the subject as: chair booking → branch; chairless booking with a barber (at-home, Task 24 barber-only booking) → barber.
- Decision required: should a chair booking with an assigned barber produce a review for the branch only, the barber only, or both (a rating for each)? The entity model (`backend/docs/06_entity-model-abstract.md:182-186`) suggests separate review records.
- Add `GET /api/v1/barbers/{barber}/reviews` (public, paginated) mirroring `GET branches/{branch}/reviews`.
### Dashboard (BFF / React)
- Barber workspace (`frontend/dashboard/new/src/components/barber-workspace/barber-workspace.tsx`) may show the barber's reviews — optional, tracked in Task 69.
### Mobile (Flutter / Repositories)
- `packages/core/lib/src/network/repositories/review.repository.dart`: add `getBarberReviews`.
- `apps/client_app/lib/src/features/review/review_submit.bloc.dart`: remove any client-side assumption that only chair bookings are reviewable.

## Acceptance Criteria
- [ ] Completed at-home booking with a barber → `POST client/bookings/{booking}/review` returns 201; stored review has `subject_type` = barber morph class and `subject_id` = booking barber.
- [ ] Completed chair booking → 201 with branch subject (existing behaviour preserved, test kept).
- [ ] Completed booking with neither chair nor barber → 422 with the existing `noSubject` error code.
- [ ] `GET barbers/{barber}/reviews` → 200, paginated, only `published` reviews.
- [ ] `php artisan test` and `melos run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Shop-rates-client reviews — Task 40.
- Rating aggregates in discovery — Task 42.
