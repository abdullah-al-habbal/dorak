---
codeanchors:
  - backend/modules/Booking/Eloquent/Resolvers/
  - backend/modules/Dashboard/Eloquent/Resolvers/Bookings/
  - backend/modules/Chair/Services/
---

# 1. Lock order and deadlocks

Routes: [booking concurrency](index.md) · [documentation graph](../index.md)

All booking locking is InnoDB `lockForUpdate` inside `DB::transaction`. There is no `sharedLock`, `GET_LOCK` or `Cache::lock` in the booking paths. Under REPEATABLE READ, the overlap scans are range scans on the `(chair_id|barber_id, starts_at, ends_at, booking_status)` indexes, so they take gap and next-key locks as well as row locks.

## Locks by path

Create (`POST /api/v1/bookings`), `Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php`, inside `CreateBookingHandler` (line 22). Walk-in (`Dashboard/Handlers/Bookings/CreateWalkInBookingHandler.php:25`) wraps the same resolver in its own transaction.

| Step | Row locked | Line |
|---|---|---|
| 1 | `clients` row of the booking client | 46 |
| 2 | `chairs` row, only if `chair_id` was sent | 100 |
| 3 | `offered_services` rows `WHERE id IN (...) AND is_active`, no `ORDER BY` | 116-120 |
| 4 | chair's active `bookings` range scan | 261-265 |
| 5 | `barbers` row | 182 |
| 6 | barber's active `bookings` range scan | 261-265 |
| 7 | insert `bookings` and `booking_offered_service` | 220-221 |

Branches and brands are never locked; they are read plainly. The overlap predicate is `Booking/Queries/BookingAvailability.php`: status in pending, confirmed, in progress, `starts_at < end` and `ends_at > start`.

Reschedule (`Dashboard/Eloquent/Resolvers/Bookings/RescheduleBookingEloquentResolver.php`): reads the booking plainly, locks the chair, the barber, then the booking row, re-checks the chair and barber did not change, then scans for overlaps excluding the booking itself. Since `097741742` this matches create's order, except that reschedule takes no service lock. The change is a private method `lockInCreateOrder`: a plain read of the booking, `lockForUpdate` on the chair, then the barber, then the booking row, and a re-check that the chair and barber on the row did not change in between.

Confirm, accept and start (`Booking/Eloquent/Resolvers/Shared/BookingLifecycleEloquentResolver.php`): `transitionForDashboard`, `transitionForBranch` and `transitionForBarber` go through `lockForTarget`. Since commit `c386493f2` a `Confirmed` target calls `BookingLockOrder::lockBooking`, which reads the booking plainly, locks its chair, then its barber, then the booking row, and re-checks that the chair and barber did not change, before the overlap scan (`ensureNoActiveOverlap`). Before that commit these paths locked the booking row first, then the chair and barber. Every other target locks the booking row only; only confirming re-scans overlaps, so they cannot invert against a create.

Cancel and the other transitions lock the booking row only. Client cancel, barber cancel and chair-maintenance cancel need nothing else, so they cannot invert against create.

Other writers: `Chair/Services/ChairStatusService.php:32-45` locks the chair, then the affected bookings, then each booking again (chair before booking matches create). Reviews lock the booking row only. Brand suspension and branch destroy lock the brand, then call the lifecycle transitions.

## Inversions

1. **Confirm versus create: reproduced, fixed.** Before `c386493f2`, confirm locked booking B, then the chair, then scanned; create locks the chair, scans the chair's bookings and, because a pending booking blocks, reaches B. Confirm held B and waited for the chair; create held the chair and waited for B. The parallel test `never ends in a database error when a dashboard confirm races a client booking on the same chair` (`cb57adc6a`, BG-17) fails with MySQL 1213 on the old order and passes on `BookingLockOrder`. Covered: a dashboard confirm. Not separately covered: the barber and branch accept routes, which share `lockForTarget`.
2. **Reschedule versus create: reproduced, fixed.** Before `097741742` reschedule locked the booking row, then the chair; see [Reproduced deadlock](#reproduced-deadlock-reschedule-versus-create). Consistent since `097741742`. The chair and barber of a booking can change between the plain read and the lock; this is handled by throwing `InvalidBookingTransitionException`, which is a failure, not a retry.
3. **Barber-only create versus chair create:** consistent. Chair always comes before barber, and a barber-only create never takes a chair.
4. **Service locks, unproven and left alone (BG-9 step 4):** `whereIn` without `ORDER BY` takes the locks in whatever order the optimizer reads them, so two creates with different service sets could take them in opposite order. No fixed primary-key order exists. Not reproduced: the parallel suite never saw it, and there is no throughput measurement to justify touching a lock that protects price and duration reads. Revisit only with evidence (a load test on a brand-owned service).

## Reproduced deadlock: reschedule versus create

Found by the process-based test `never ends in a database error when a dashboard reschedule races a client booking on the same chair` in `backend/tests/Concurrency/ConcurrentBookingsTest.php` (BG-9, 19 November 2026). A dashboard reschedule of booking B on a chair runs while a client creates a booking on that chair for an overlapping time.

| Session | Holds | Waits for |
|---|---|---|
| Reschedule (old order) | the booking row B | the `chairs` row |
| Create | the `chairs` row, then its range scan reaches B | the booking row B |

MySQL aborted one of them with `SQLSTATE[40001] 1213 Deadlock found ... select * from chairs ... for update`, and the API answered HTTP 500. The test showed it within the first 5 rounds in each of three runs. After `lockInCreateOrder` it passed 40 consecutive rounds, twice (`BOOKING_RACE_ROUNDS=40`), and the suite keeps 8 rounds by default. The same test also asserts that no two blocking bookings overlap afterwards, so a fix that stopped the 500 by dropping the check would still fail it.

Method note: a reported exception is invisible in a worker process, so `tests/Support/concurrency-worker.php` prints reported exceptions to stderr and `concurrencyFinish` returns it. Without that, the failure was an unexplained 500.

## Deadlock handling gap

No call passes an attempts argument to `DB::transaction`, and nothing handles error 1213, 1205 or SQLSTATE 40001 in `modules/` or `bootstrap/`. `bootstrap/app.php:28-40` and `Core/Services/ApiExceptionResponseHandler.php` do not map `QueryException`, so a deadlock or a lock-wait timeout becomes HTTP 500 with code `SERVER_ERROR`. Data stays correct (the transaction rolls back); the client sees an unexplained failure and may retry blindly.

Laravel already ships the pieces: `DB::transaction($callback, $attempts)` retries only concurrency errors, and `Illuminate\Database\ConcurrencyErrorDetector` classifies them.

## The `offered_services` lock

`CreateBookingEloquentResolver::lockActiveServices` (lines 114-127) takes an exclusive lock on the requested active services for the whole transaction. It makes sure the services exist and are active while duration and price are read (`totalDuration`, lines 149-169; scope check, 250-259). Its only real contention is with service edits.

A brand-owned service (`serviceable_type = Brand`) is a single row shared by every branch of the brand. Every create that books it takes an exclusive lock on that row, held through the two range scans, the branch-hours and barber-schedule checks and the insert. Creates are therefore serial across all branches, chairs and barbers of the brand. A barber-owned service serializes only that barber. Reschedule does not take the lock.

This is a throughput problem, not an integrity one: the slot is protected by the chair and barber locks, not the service lock. A shared lock (`lockForShare`) ordered by id keeps the guarantee that a service cannot be edited or deactivated mid-booking, while creates stop blocking each other.

## Target lock order

client, chair, barber, bookings (scans, then the booking row), services (shared, ordered by id). One helper, `Booking/Services/BookingLockOrder`, owns the chair, barber and booking part; create, reschedule and confirm call it. Status on 19 November 2026: reschedule is fixed and tested in `097741742`; the helper and the confirm-path change were committed in `c386493f2` (the catch-all commit) and proven by the confirm-versus-create parallel test in `cb57adc6a` (see [test coverage](07-test-coverage.md)). Create does not call the helper; it keeps its own order, which already matches.
