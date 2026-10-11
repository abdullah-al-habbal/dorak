# Task 20: Unify Availability Semantics and Time Contract

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 18 · **Audit source:** Spec-vs-backend reports (floor plan vs create blocking, `available_now`, BE-10 chair availability); mobile audit (floor-plan slot vs booking time); `04_house-rules.md:23` (B3), `04_house-rules.md:116` (L3)

## Overview & Root Cause
Five code paths each decide "is this chair or barber busy?" with different status sets:
- **Booking create** blocks on `pending`, `confirmed` and `in_progress`.
- **Floor plan** ignores `pending`, so a chair shows as free and then booking it fails with 409.
- **Public chair list** and **Explore `available_now`** only consider `confirmed`, and Explore ignores `ends_at`, using a "started in the last hour" window instead.

Separately, the floor plan reads `date` and `time_slot` as server time (UTC), but the client app sends local wall-clock time for the floor plan and UTC for the booking. Any device not on UTC checks availability for a different hour than the one it books.

## Evidence
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:95` — `reservationBlockingValues()`, which includes `pending`.
- `backend/modules/Branch/Eloquent/Resolvers/Shared/GetFloorPlanEloquentResolver.php:22` — `availabilityBlockingValues()`, which excludes `pending`.
- `backend/modules/Chair/Eloquent/Resolvers/Shared/ListChairsEloquentResolver.php:21` — `where('status', BookingStatus::Confirmed)` only.
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBranchesEloquentResolver.php:117` and `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php:114` — `available_now` checks `status = confirmed` only.
- `backend/modules/Branch/Http/Requests/Shared/GetFloorPlanRequest.php:26-29` — `Carbon::createFromFormat('Y-m-d H:i', date.' '.time_slot)` in the app timezone. `backend/modules/Core/Config/app.php:15` sets the timezone to `UTC`.
- `frontend/mobile/packages/core/lib/src/network/repositories/branch.repository.dart:25-28` — sends local `date` and `time_slot`.
- `frontend/mobile/packages/core/lib/src/network/repositories/booking.repository.dart:81` — sends `timeSlot.toUtc()`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add one shared availability query, for example a scope or service in `Booking`, that uses `BookingStatus::reservationBlockingValues()` and an interval overlap (`time_slot < endsAt AND ends_at > startsAt`).
- Use it in the floor plan, the chair list, Explore `available_now` (window: now to now + a minimum service duration) and booking create.
- Time contract: every time input on the floor plan, booking create, reschedule and rebook is ISO-8601 UTC. Change `GetFloorPlanRequest` to accept a `starts_at` UTC timestamp, or document `date`/`time_slot` as UTC. Pick one and apply it to all four inputs.
- Delete `availabilityBlockingValues()` if nothing uses it any more.

### Dashboard (BFF / React)
- Check `frontend/dashboard/new/src/services/api/dashboard/walk-in-booking.schema.ts` and `booking-reschedule.schema.ts` send UTC ISO timestamps. Convert local input to UTC before sending.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/branch.repository.dart` — send floor-plan time in UTC, matching `booking.repository.dart`.
- `frontend/mobile/packages/core/test/booking_repository_test.dart` and a new branch repository test must assert the floor-plan and booking requests carry the same UTC instant.

## Acceptance Criteria
- [ ] A chair with a `pending` booking at T appears unavailable in `GET /api/v1/branches/{branch}/floor-plan` for T, and in `GET /api/v1/chairs`.
- [ ] A barber with an `in_progress` booking overlapping now is excluded by `available_now=1` on `explore/barbers`. A booking that ended (`ends_at < now`) does not exclude them.
- [ ] One availability helper is referenced by all four call sites. `grep -rn "where('status', 'confirmed')" backend/modules/Explore backend/modules/Chair` returns nothing.
- [ ] Feature test `AvailabilityConsistencyTest`: for the same branch, chair, instant and duration, the floor plan reports free if and only if `POST /bookings` succeeds.
- [ ] Mobile unit test: with a non-UTC device timezone (for example UTC+3), the floor-plan and booking requests encode the same UTC instant.
- [ ] `php artisan test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Slot listing (Task 21).
- Hours and schedule (Task 22).
- Maintenance conflict handling (Task 27).
