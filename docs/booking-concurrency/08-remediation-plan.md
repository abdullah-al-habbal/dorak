---
nodeid: docs.booking-concurrency.remediation-plan
parentnode: docs.booking-concurrency
childnodes: []
codeanchors:
  - backend/modules/Booking/
  - backend/tests/Concurrency/
  - frontend/mobile/apps/client_app/lib/src/features/booking/
  - frontend/mobile/packages/core/lib/src/network/
---

# 8. Remediation plan (booking findings)

Routes: [booking concurrency](index.md) · [documentation graph](../index.md) · [backlog](../backlog/index.md) · [write-path audit](09-write-path-audit.md) · [fix order](10-fix-order.md) · [session board](../sessions/index.md)

Order of work for the booking findings 1 to 10 in the [index](index.md). The non-booking write races (W1 to W15) are a separate plan: [write-path audit](09-write-path-audit.md) and [fix order](10-fix-order.md), owned by another session. Both plans share the conventions in file 10 (lock order, retries, tests); do not restate them here. Every item follows the task executor: a failing test first, gates, one local commit, no push. Owner of this file: `dorak-61`.

## Done

| Finding | What | Commit |
|---|---|---|
| 1 (reschedule and confirm halves), 6 (booking create) | Reschedule takes chair, barber, booking; the 1213 deadlock was reproduced first. `Idempotency-Key` on `POST /bookings`, required since `af8cf0565` | `097741742`, `dda9ac13c`, `af8cf0565` |
| Throttles | Named limiters on booking and explore routes (BG-10) | `03747a67b` |

## Order

| Phase | Item | Finding | What | Depends on |
|---|---|---|---|---|
| ~~1~~ | ~~**BG-17**~~ | 1 | **Done** (`cb57adc6a`, by `booking-concurrency-idempotency-hardening`): the parallel confirm-versus-create test fails with 1213 on the old order and passes on `BookingLockOrder`. Left over: barber and branch accept routes have no test of their own ([07](07-test-coverage.md), item 1) | |
| 1 | **BG-18** | 2 | `DB::transaction($callback, $attempts)` on the booking transactions, and map an exhausted retry to a retryable 503 or 409 with a stable code. Test with a forced 1213. **Taken by `booking-concurrency-idempotency-hardening`** (board Q-12); this file keeps the plan | BG-17 (done) |
| 2 | **BG-20** | 10 | `client_app`: on a 409 from booking create reload the slots and clear the chosen time; own messages for 429 and 503 (EN and AR) | none (mobile only) |
| 2 | **BG-19** | 9 | Slot list loads the day once and computes in memory (about 300 to 500 queries down to under 10), with a query-count ceiling in the slot tests and a list-versus-create agreement test | none; touches `BookingAvailability` use, so run after BG-17 to avoid editing the same predicate twice |
| 3 | **BG-21** | 10 | `RetryInterceptor` honours `Retry-After` and stops retrying lifecycle `PATCH` and `DELETE` on a 5xx without server-side idempotency | fix order convention 7 (idempotent deletes) |
| 3 | **BG-16** | 9 | Throttle the remaining public GET routes | none |
| 4 | **BG-35** (fix order) | 3 | Services locked shared and in id order; needs a measurement first, so it is a test plus a load check, not a guess | BG-17 |
| Decision | **BD-10** | 5 | May one client hold overlapping bookings with different barbers? If no: client scan inside the client lock, `ClientDoubleBookingException`, index `(client_id, starts_at, ends_at, booking_status)` ([file 02](02-overlap-guards.md)) | owner |
| Later | Finding 4 | 4 | A database backstop for overlaps. Options are in [file 02](02-overlap-guards.md); the recommendation is an audit command plus a Pest test that fails on any overlapping active rows, not a schema change | owner decision on cost |

Phase 1 changes no API shape. BG-18 adds one error code, so it needs a translation key (EN and AR) and a note in `backend/docs/feature-index.md`. BG-20 and BG-21 touch the mobile apps: run `melos verify` (it takes over ten minutes; run it in the background and read the exit code from the log).

## Verification per item

- **BG-17:** done; the check was `composer test:concurrency` with the new test failing on the old order and passing on HEAD.
- **BG-18:** a Pest test forces a concurrency exception and asserts the retry and the mapped answer; the concurrency suite still passes.
- **BG-19:** the query count is asserted, every returned slot books successfully, every omitted slot is refused.
- **BG-20, BG-21:** bloc and interceptor tests that fail first; `melos verify` exit 0.

## Docs to update when each item ships

- Remove the backlog row and add a line to `backend/docs/feature-index.md`.
- Edit the finding in the file that owns it (01, 02, 05 or 06) and the "State" section of the [index](index.md); do not leave a fixed finding described as open.
- Add the covered case to [test coverage](07-test-coverage.md) and delete it from "Not proven yet".
- Keep the booking-lock paragraph in `backend/AGENTS.md` and the "Concurrency" section true.
- Record any question for another session in the [coordination log](../sessions/index.md).
