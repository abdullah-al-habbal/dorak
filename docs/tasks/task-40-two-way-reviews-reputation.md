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
- Decision required: are client-subject reviews visible to the client, and can barbers (not just branches) rate clients?
### Dashboard (BFF / React)
- Add a "Rate client" action on completed bookings in the manager bookings list (`frontend/dashboard/src/components/bookings/booking-actions-dialog.tsx`) via a new BFF path (allow-listed per Task 11).
- Show client reputation in booking details (Task 70 page).
### Mobile (Flutter / Repositories)
- Business app: "Rate client" on completed bookings (tracked in Task 85).

## Acceptance Criteria
- [ ] A booking can hold one client-authored and one branch-authored review; a second review by the same author type → 409/422.
- [ ] `POST branch/bookings/{booking}/review` for another branch's booking → 403; for a non-completed booking → 422.
- [ ] Client resource in branch booking responses includes `reputation` (average rating, count).
- [ ] Existing client review Feature tests still pass after the relation change.
- [ ] `php artisan test` and `npm run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Dispute workflow — Task 41.
- Business app UI — Task 85.
