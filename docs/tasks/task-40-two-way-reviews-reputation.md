# Task 40: Implement Two-Way Reviews and Client Reputation

**Phase:** Reviews · **Priority:** P1 · **Depends on:** Task 39 (done: `BookingModel::reviews()` is now HasMany and the duplicate check is per author, so shop→client reviews can coexist with client reviews on the same booking) · **Audit source:** Product-spec audit — Reviews (`backend/docs/04_house-rules.md:65` F1, `backend/docs/06_entity-model-abstract.md:115`, `:182-186`)

## Overview & Root Cause
The specs define two reviews per booking: the client rates the shop/barber and the shop rates the client, and clients carry a reputation rating. The code allows exactly one review per booking (`booking->review()->exists()` blocks a second) and only exposes a client submit route, so shops cannot rate clients and no client reputation exists.

## Evidence
- `backend/modules/Review/Handlers/Client/SubmitReviewHandler.php:31` — `if ($booking->review()->exists())` rejects any second review.
- `backend/modules/Booking/Models/BookingModel.php:64` — `review(): HasOne` (single review per booking).
- `backend/modules/Review/Routes/Api/V1/reviews.php:11-13` — only client submit and client dispute routes.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Change the booking relation to `reviews(): HasMany` and make uniqueness per `(booking_id, author_type)`; add `author_type` if absent (only `author_id` exists today).
- New route `POST /api/v1/branch/bookings/{booking}/review` (`auth:branch_api`) for completed or no-show bookings of the manager's branch; subject = client.
- Client reputation: aggregate of client-subject reviews exposed on the client resource used by branch/barber booking views.
  - **Decision (resolved, best option): client reviews are staff-only; barbers rate clients only when the booking has no branch.** Hiding them from the client follows F3 (the review protects other shops) and avoids retaliation; routing branch bookings to the branch and branchless bookings to the barber gives every finished booking exactly one provider-side rater.
### Implemented contract
- Shared code path: `Modules\Review\Handlers\Staff\ReviewClientHandler::handle()`, used by `POST /api/v1/branch/bookings/{booking}/review` (`auth:branch_api`), `POST /api/v1/barber/bookings/{booking}/review` (`auth:barber` + `EnsureBarberAccountAccess`) and `POST /api/v1/dashboard/bookings/{booking}/review` (branch managers and brand owners, scoped by `DashboardActor::scopedBranchIds()`). Reputation: `ClientModel::receivedReviews()` (published client-subject reviews) and `scopeWithReputation()`; staff payloads use `Modules\Booking\Http\Resources\Staff\StaffBookingResource` (client booking payload + `client {id, name, phone, reputation {average, count}}`).
- Scope of the rule: the booking must be `completed` or `no_show`; branch side = the booking's branch (`branch_id` ?? chair branch) and must be within the actor's scope; barber side = the booking's barber and the booking must have no branch. Uniqueness: one review per `(booking_id, author_type, subject_type)` (DB unique index, plus a pre-check under a booking row lock).
- Request: `rating` (required, 1–5), `comment` (nullable, ≤1000).
- Failure: 403 `not_own_booking` (another branch's or barber's booking, admin in the dashboard); 422 `booking_not_finished` (not completed/no-show); 422 `branch_rates_client` (barber on a branch booking); 409 `already_reviewed`; all `code = REVIEW_VALIDATION_FAILED`; validation 422 for the body.
- Success: 201, `data` = `ReviewResource` with `subject_type = client`, author `branch`/`barber`, status `published`. Branch booking lists/status updates, barber today/transition/cancel responses and all dashboard booking responses now include `client.reputation`; `/api/v1/bookings` (client) does not.
- Dashboard: BFF allow-list `POST bookings/{id}/review`; `rateBookingClient` mutation; `BookingRateClientForm` inside the booking actions dialog for managers and owners; `IBooking.client` + a "Client" list column showing name and ★ reputation; en/ar copy; Vitest for mapper, schema and path allow-list. Mobile: `core` `BookingClientDto`, `ClientReputationDto`, `BookingDto.client`, `rateClient` on `BranchOperationsRepository` and `StylistOperationsRepository` (+ endpoints); app fakes updated; the business/stylist UI is Task 85/83. Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`.
- Deviations from the original spec text: uniqueness is per `(booking_id, author_type, subject_type)` instead of `(booking_id, author_type)` because Task 39 lets the client review both the branch and the barber; `author_type` already existed. Reputation is shown in the dashboard booking list column now; the Task 70 detail page will reuse `IBooking.client`.

### Dashboard (BFF / React)
- Add a "Rate client" action on completed bookings in the manager bookings list (`frontend/dashboard/src/components/bookings/booking-actions-dialog.tsx`) via a new BFF path (allow-listed per Task 11).
- Show client reputation in booking details (Task 70 page).
### Mobile (Flutter / Repositories)
- Business app: "Rate client" on completed bookings (tracked in Task 85).

## Acceptance Criteria
- [x] A booking can hold one client-authored and one branch-authored review; a second review by the same author type → 409/422.
- [x] `POST branch/bookings/{booking}/review` for another branch's booking → 403; for a non-completed booking → 422.
- [x] Client resource in branch booking responses includes `reputation` (average rating, count).
- [x] Existing client review Feature tests still pass after the relation change.
- [x] `php artisan test` and `npm run test` pass; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Dispute workflow — Task 41.
- Business app UI — Task 85.
