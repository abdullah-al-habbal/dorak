# Task 20: Unify Availability Semantics and Time Contract

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 18 · **Audit source:** Spec-vs-backend reports (floor plan vs create blocking, `available_now`, BE-10 chair availability); mobile audit (floor-plan slot vs booking time); `04_house-rules.md:23` (B3), `04_house-rules.md:116` (L3)

## Overview & Root Cause
Five code paths each decide "is this chair or barber busy?" with different status sets:
- **Booking create** blocks on `pending`, `confirmed` and `in_progress`.
- **Floor plan** ignores `pending`, so a chair shows as free and then booking it fails with 409.
- **Public chair list** and **Explore `available_now`** only consider `confirmed`, and Explore ignores `ends_at`, using a "started in the last hour" window instead.

Separately, the floor plan reads `date` and `time_slot` as server time (UTC), but the client app sends local wall-clock time for the floor plan and UTC for the booking. Any device not on UTC checks availability for a different hour than the one it books.

## Resolved Contract
- Availability uses the half-open interval overlap rule (`existing.time_slot < requested.ends_at` and `existing.ends_at > requested.starts_at`) and treats `pending`, `confirmed`, and `in_progress` bookings as blocking.
- The floor-plan query takes `starts_at` as an ISO-8601 UTC timestamp. Booking create, walk-in, reschedule, and rebook timestamps use the same UTC ISO-8601 contract (`Z` or `+00:00`). Dashboard date/time inputs are converted to UTC before submission; mobile sends the same UTC instant for availability and booking.
- Explore `available_now` uses a 15-minute look-ahead window.

## Evidence
- `backend/modules/Booking/Queries/BookingAvailability.php` — the shared blocking-status and interval-overlap predicate.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php`, `backend/modules/Branch/Eloquent/Resolvers/Shared/GetFloorPlanEloquentResolver.php`, `backend/modules/Chair/Eloquent/Resolvers/Shared/ListChairsEloquentResolver.php`, and the Explore resolvers — availability and reservation call sites.
- `backend/modules/Branch/Http/Requests/Shared/GetFloorPlanRequest.php` — validates and parses `starts_at` as UTC ISO-8601.
- `frontend/mobile/packages/core/lib/src/network/repositories/branch.repository.dart` and `booking.repository.dart` — send UTC ISO-8601 for both requests.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add one shared availability query, for example a scope or service in `Booking`, that uses `BookingStatus::reservationBlockingValues()` and an interval overlap (`time_slot < endsAt AND ends_at > startsAt`).
- Use it in the floor plan, the chair list, Explore `available_now` (window: now to now + a minimum service duration) and booking create.
- Time contract: every time input on the floor plan, booking create, reschedule and rebook is ISO-8601 UTC. Change `GetFloorPlanRequest` to accept a `starts_at` UTC timestamp, or document `date`/`time_slot` as UTC. Pick one and apply it to all four inputs.
- Delete `availabilityBlockingValues()` if nothing uses it any more.

### Dashboard (BFF / React)
- Check `frontend/dashboard/src/services/api/dashboard/walk-in-booking.schema.ts` and `booking-reschedule.schema.ts` send UTC ISO timestamps. Convert local input to UTC before sending.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/branch.repository.dart` — send floor-plan time in UTC, matching `booking.repository.dart`.
- `frontend/mobile/packages/core/test/booking_repository_test.dart` and a new branch repository test must assert the floor-plan and booking requests carry the same UTC instant.

## Acceptance Criteria
- [x] A chair with a `pending` booking at T appears unavailable in `GET /api/v1/branches/{branch}/floor-plan` for T, and in `GET /api/v1/chairs`.
- [x] A barber with an `in_progress` booking overlapping now is excluded by `available_now=1` on `explore/barbers`. A booking that ended (`ends_at < now`) does not exclude them.
- [x] One availability helper is referenced by all availability and reservation overlap call sites. `where('status', 'confirmed')` checks were removed from Explore and Chair.
- [x] Feature test `AvailabilityConsistencyTest`: for the same branch, chair, instant and duration, the floor plan reports free if and only if `POST /bookings` succeeds.
- [x] Mobile unit test: with an explicit UTC+3 timestamp, the floor-plan and booking requests encode the same UTC instant.
- [x] The full backend Pest suite (memory-unlimited fallback for the Artisan wrapper's 128 MB limit) and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Slot listing (Task 21).
- Hours and schedule (Task 22).
- Maintenance conflict handling (Task 27).
