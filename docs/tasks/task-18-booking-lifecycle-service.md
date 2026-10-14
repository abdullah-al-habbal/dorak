# Task 18: Centralize Booking Status Transitions

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 13 · **Audit source:** Spec-vs-backend reports (REMEDIATION Ph4, mvp-gap HIGH, DASHBOARD Task 1); `03_persona-journeys.md:54`; `08_edge-cases.md:19` (EC-3); `06_entity-model-abstract.md:169`

## Overview & Root Cause
`BookingLifecycleEloquentResolver` already locks the row and checks `BookingStatus::canTransitionTo()`. The barber and dashboard status/cancel actions use it, but three write paths bypass it:
- **Branch status update:** does a raw `update()`, so a branch manager can move a completed or canceled booking to any status, with no lock.
- **Dashboard reschedule:** has no status check.
- **Client and barber cancel:** use their own inline transactions.

Separately, no path can mark a confirmed booking as a no-show: the enum allows `no_show` only from `in_progress`, while spec EC-3 treats it as the outcome when the client never arrives. A branch manager also cannot confirm a booking.

## Evidence
- `backend/modules/Branch/Http/Actions/Branch/UpdateBookingStatusAction.php:34-37` — checks the status against a hard-coded list, then calls `$model->update(['status' => $status])`. No `canTransitionTo`, no lock, no event.
- `backend/modules/Dashboard/Eloquent/Resolvers/Bookings/RescheduleBookingEloquentResolver.php` — locks the row and checks for collisions, but never checks the booking's status.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CancelBookingEloquentResolver.php:27-35` and `backend/modules/Booking/Http/Actions/Barber/CancelBookingAction.php:31-34` — cancel logic duplicated outside the lifecycle resolver.
- `backend/modules/Booking/Enums/BookingStatus.php` — `Confirmed => [InProgress, Canceled]`, so `NoShow` is reachable only from `InProgress`.
- `backend/modules/Booking/Eloquent/Resolvers/Shared/BookingLifecycleEloquentResolver.php` — the existing `transitionForDashboard` / `transitionForBarber` methods to build on.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Make `BookingLifecycleEloquentResolver` the only writer of `bookings.status`.
  - Add `transitionForBranch(bookingId, branchId, target)`. It must scope the booking to the branch through its chair.
  - Add `cancelForClient(...)`, which keeps the 2-hour cutoff (`04_house-rules.md:115`, rule L2).
  - Route the barber cancel through it.
- Allow branch targets `confirmed`, `in_progress`, `completed`, `no_show` and `canceled`, all gated by `canTransitionTo`.
- Reschedule must reject terminal and in-progress bookings: only `pending` and `confirmed` can be rescheduled.
- **Decision resolved:** allow `Confirmed → NoShow`. EC-3 explicitly defines no-show as the outcome when the client never arrives, which occurs while the booking is confirmed. `NoShow` is also allowed from `InProgress` for a client who leaves before service begins.
- A not-allowed transition returns 422, using the existing `InvalidBookingTransitionException` mapping.

### Dashboard (BFF / React)
- `frontend/dashboard/src/services/api/dashboard/booking-status.schema.ts` currently only allows `["confirmed","in_progress"]`. Widen it to the transitions the backend accepts (display side is done in Task 70).
- `frontend/dashboard/src/components/bookings/booking-actions-dialog.tsx` — show the 422 transition error message.

### Mobile (Flutter / Repositories)
- `frontend/mobile/apps/business_app/lib/src/features/operations/branch_operations.screen.dart:110-130` — the status menu offers every status for every booking. Filter it by the booking's current status, using the same transition table.
- `frontend/mobile/packages/core/lib/src/network/repositories/operations.repository.dart` — `updateBookingStatus` must surface 422 as a typed failure.

## Acceptance Criteria
- [x] `grep -rn "update(\['status'" backend/modules` returns no booking-status writes outside `BookingLifecycleEloquentResolver`.
- [x] `PATCH /api/v1/branch/bookings/{id}/status` on a `completed` booking returns 422, and the stored status is unchanged.
- [x] `PATCH /api/v1/branch/bookings/{id}/status` for a booking in another branch returns 404.
- [x] `PATCH /api/v1/branch/bookings/{id}/status` with `status=confirmed` on a `pending` booking returns 200.
- [x] `PATCH /api/v1/dashboard/bookings/{id}/reschedule` on a `canceled` or `completed` booking returns 422.
- [x] Client cancel within 2 hours of the slot still returns 422 with the `cancel_too_late` message.
- [x] The no-show decision is recorded in this file, and `BookingStatusTest` (a unit test) asserts the full transition matrix.
- [x] The Feature test `BranchBookingStatusTransitionTest` covers allowed, forbidden and cross-branch transitions.
- [x] The business_app status menu shows only allowed targets, covered by a widget test.
- [x] The complete Pest suite passes. PHPStan max and Pint are clean. (`php artisan test` requires the unlimited-memory Pest invocation in this environment.)

## Out of Scope
- Notifications and broadcasts on transitions (Task 28).
- Rebook (Task 19).
- Audit log of transitions (Task 64).
