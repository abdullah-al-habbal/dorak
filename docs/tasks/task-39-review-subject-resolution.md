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
  - **Decision (resolved, best option): both, as separate review records.** The entity model treats the subject as one polymorphic party per review; one record per subject keeps disputes (Task 41) and aggregates (Task 42) per entity, and rating only the branch would leave shop barbers unrated. `barber_rating` is optional and defaults to `rating`, so the current one-score app flow rates both.
- Add `GET /api/v1/barbers/{barber}/reviews` (public, paginated) mirroring `GET branches/{branch}/reviews`.
### Implemented contract
- Shared code path: `Modules\Review\Handlers\Client\SubmitReviewHandler::handle()` (the only review writer for clients) and `Modules\Review\Jobs\ReviewRequestNotification` (same subject rule for the "how was your visit" push). `BookingModel::review()` (HasOne) became `reviews()` (HasMany), since a booking now has several reviews.
- Scope of the rule: branch = `bookings.branch_id` ?? chair's `branch_id`; barber = `bookings.barber_id`. Branch + barber → branch review (`rating`) + barber review (`barber_rating` ?? `rating`); barber only → barber review (`rating`); branch only → branch review; neither → `no_subject`.
- Request: `POST /api/v1/client/bookings/{booking}/review` gains optional `barber_rating` (integer 1–5, nullable); `rating`, `comment` unchanged.
- Failure: unchanged codes — 403 `not_own_booking`, 422 `booking_not_completed`, 422 `no_subject`, 409 `already_reviewed` (any earlier review by this client on the booking), all with `code = REVIEW_VALIDATION_FAILED`; nothing is written.
- Success: 201, `data` = the primary review (branch, or barber when there is no branch); `meta.barber_review` = the extra barber review when one was written. `ReviewResource` adds `subject_type` (`branch`/`barber`/`client`, morph alias) and `subject_id`. `GET /api/v1/barbers/{barber}/reviews` (public, `per_page` 1–100, default 20) lists published barber reviews, newest first; unknown barber → 404.
- Dashboard: none (barber workspace reviews remain Task 69). Mobile: `core` `ReviewEndpoints.barberReviews`, `ReviewRepository.getBarberReviews`, optional `barberRating` on `submitReview`, `ReviewDto.subjectType/subjectId` (+ `isBarberReview`/`isBranchReview`); `client_app` needed no change (any completed booking is rateable; verified in `bookings.screen.dart`) beyond the test fake. Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`.
- Deviations from the original spec text: review requests are now also sent for barber-only bookings so they match what can be reviewed.

### Dashboard (BFF / React)
- Barber workspace (`frontend/dashboard/src/components/barber-workspace/barber-workspace.tsx`) may show the barber's reviews — optional, tracked in Task 69.
### Mobile (Flutter / Repositories)
- `packages/core/lib/src/network/repositories/review.repository.dart`: add `getBarberReviews`.
- `apps/client_app/lib/src/features/review/review_submit.bloc.dart`: remove any client-side assumption that only chair bookings are reviewable.

## Acceptance Criteria
- [x] Completed at-home booking with a barber → `POST client/bookings/{booking}/review` returns 201; stored review has `subject_type` = barber morph class and `subject_id` = booking barber.
- [x] Completed chair booking → 201 with branch subject (existing behaviour preserved, test kept).
- [x] Completed booking with neither chair nor barber → 422 with the existing `noSubject` error code.
- [x] `GET barbers/{barber}/reviews` → 200, paginated, only `published` reviews.
- [x] `php artisan test` and `melos run test` pass; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Shop-rates-client reviews — Task 40.
- Rating aggregates in discovery — Task 42.
