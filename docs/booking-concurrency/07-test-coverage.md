---
codeanchors:
  - backend/tests/Concurrency/
  - backend/tests/Support/
  - backend/tests/Feature/Booking/BookingIdempotencyTest.php
  - backend/tests/Feature/Booking/BookingRouteThrottleTest.php
---

# 7. Test coverage

Routes: [booking concurrency](index.md) · [documentation graph](../index.md) · [testing strategy](../architecture/testing-strategy.md)

What the booking concurrency tests prove, how they are built, and which cases are still unproven (BG-9, BG-10, BG-17).

## Method: one process per request

The default Pest run wraps each test in one database transaction, so two "simultaneous" requests inside it share one session and cannot block each other. A real race needs separate sessions. The `concurrency` group therefore starts every request in its own PHP process:

- `tests/Support/concurrency-helpers.php`: `concurrencyStart(method, uri, token, body, headers, env)` launches `tests/Support/concurrency-worker.php` (a Symfony Process); `concurrencyFinish` waits and returns `status`, `body` and `stderr`; `concurrencyStatuses` sorts the codes; `concurrencyLocker()` gives the test a third session to freeze a row; `concurrencyAwaitBlocked` polls the MySQL process list until the request is really stuck on a lock (no `sleep` guess); `concurrencyCommitFixtures` closes the shared transaction so the workers can see the rows.
- The worker re-runs `TestDatabaseGuard`, takes optional JSON headers (argv 5, used for `Idempotency-Key`) and prints reported exceptions to stderr. A worker's exception is otherwise invisible, and the failure shows up only as a 500.
- Every test ends with `migrate:fresh`, so committed rows never leak into the next test or the regular suite.
- The group is excluded from `composer test` and runs with `composer test:concurrency`. The group has 12 tests: 5 in `ConcurrentBookingsTest` and 7 in `ConcurrentAnswersTest` (counted 2026-11-27, when all 12 passed in CI).

Two kinds of proof, and they are not equal: *blocked-then-refused* proves a lock exists (the request waits, and re-reads state after the holder commits); a *race* proves only the outcome, because a broken lock can pass by luck. The booking races below are outcome proofs. The reschedule race is the exception: it failed before the fix, so it is a real detector.

## What is proven

| Case | Test | Proves |
|---|---|---|
| Five clients, same barber and slot | `ConcurrentBookingsTest` | exactly one 201, four 409 `double_booking`; one booking row |
| Chair booking racing a barber-only booking on one barber | `ConcurrentBookingsTest` | one 201 and one 409; the chair-before-barber order holds |
| Dashboard reschedule racing a create, `BOOKING_RACE_ROUNDS` rounds (default 8) | `ConcurrentBookingsTest` | no 500, and no two blocking bookings overlap. **Reproduced the 1213 deadlock before the fix**; 40 rounds pass after it |
| Five simultaneous retries with one `Idempotency-Key` | `ConcurrentBookingsTest` | one booking, five identical answers, one key row |
| Replay, key reuse, expiry, failed attempt, other client's key, missing or malformed key | `Feature/Booking/BookingIdempotencyTest` | the replay contract; a mutation check (replay forced off, reuse check forced off) made 4 of them fail |
| Dashboard confirm racing a create on the same chair, `BOOKING_RACE_ROUNDS` rounds | `ConcurrentBookingsTest` (`cb57adc6a`, BG-17) | confirm 200 and create 409 every round, one blocking booking. **Fails with MySQL 1213 on the old order** (author's report in board Q-12; not rerun by `dorak-5f`), passes on `BookingLockOrder` |
| 11th booking write and 61st read per minute, slots by IP, explore by IP, limiter keyed per client | `Feature/Booking/BookingRouteThrottleTest` (6 tests) | the BG-10 limits and their keys |
| Same key, same request body: the client app reuses it; changed body: new key; success: cleared | `client_app` bloc tests, `idempotency_key_test.dart`, `booking_repository_test.dart` | the app side of the contract |

Mutation checks matter here: each new test was run once against a broken implementation and had to fail. Do the same for new race tests.

## Not proven yet

1. **Barber accept and branch accept versus create.** The dashboard confirm is proven (table above); the two accept routes reach `Confirmed` through the same `lockForTarget` but have no parallel test of their own. Low risk, cheap to add by reusing `bookingRaceWorld`; the start and complete transitions lock the booking row only and do not rescan, so they cannot invert.
2. **Deadlock retry and mapping.** Nothing proves what a client sees when a 1213 or 1205 still happens. There is no mapping yet (finding 2 in the [index](index.md)); add a test with the fix.
3. **Walk-in racing a client create** on one slot (a third path to the same locks).
4. **Service lock contention** (finding 3): needs a measurement, not a pass/fail test.
5. **Database-level backstop** for overlaps: no constraint exists, so a path that forgets the locks passes every test above. See [file 02](02-overlap-guards.md).
6. **Client overlap (BD-10):** decided, not built; add the test with the check.
7. Races on subscription assign, payouts, phone verification and registration ([file 03](03-idempotency-and-uniqueness.md)).

## Rules for a new concurrency test

- Put it in `tests/Concurrency/`, keep it in the `concurrency` group, and end it with the shared `afterEach` (`migrate:fresh`).
- Prove the failure first: run it against the unfixed code or a deliberately broken one and keep the failing output in the commit message or the backlog entry.
- Assert on the data afterwards (row counts, no overlap), not only on status codes.
- Use `BOOKING_RACE_ROUNDS` style loops for deadlock hunts: one pass proves little.
