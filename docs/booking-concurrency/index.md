---
nodeid: docs.booking-concurrency
parentnode: docs.graph.part-3
childnodes:
  - docs.booking-concurrency.lock-order-and-deadlocks
  - docs.booking-concurrency.overlap-guards
  - docs.booking-concurrency.idempotency-and-uniqueness
  - docs.booking-concurrency.hashing-and-tokens
  - docs.booking-concurrency.search-and-availability
  - docs.booking-concurrency.client-sync-and-ux
  - docs.booking-concurrency.test-coverage
  - docs.booking-concurrency.remediation-plan
  - docs.booking-concurrency.write-path-audit
  - docs.booking-concurrency.fix-order
codeanchors:
  - backend/modules/Booking/
  - backend/modules/Dashboard/
  - backend/modules/Core/
  - backend/tests/Concurrency/
  - frontend/web/dashboard/src/
  - frontend/mobile/packages/core/
---

# Booking concurrency, idempotency and client sync

Routes: [documentation graph](../index.md) · [README](../../README.md) · [backlog](../backlog/index.md) · [backend feature index](../../backend/docs/feature-index.md) · [testing strategy](../architecture/testing-strategy.md)

A read-only, repository-wide audit of how Dorak behaves when many requests touch the same booking data at once: which rows are locked and in what order, where a deadlock can still happen, where the database itself guards against double booking (and where only application code does), which write endpoints need an idempotency key or a unique key per client, which secrets are hashed, and how the dashboard and the three Flutter apps react when the backend answers 409, 429, 503 or 500.

Review date: 19 November 2026, against commit `097741742` (reschedule takes its locks in create's order, BG-9) and the working tree at that time. The audit read code and the existing concurrency tests. It did not run a load test, a MySQL deadlock capture or a security test. Findings are analytical judgments, not requirements; when one turns into work, record it in the [backlog](../backlog/index.md).

## How to read the evidence

| Grade | Meaning |
|---|---|
| Confirmed | The code was read at the cited line and the behaviour follows from it. |
| Reported | A scan reported it with a file and line; not re-opened or reproduced. Treat as a lead, verify before fixing. |
| Unverified | Inferred or not read (the file lists them). Do not fix without checking. |

Paths are relative to `backend/modules/` unless they start with `frontend/`, `backend/` or `docs/`.

## Headline findings

| # | Finding | Severity | Grade | File |
|---|---|---|---|---|
| 1 | Confirm, accept and start paths lock the booking first, then the chair and barber. Create holds the chair and scans into that booking's slot. This is a lock-order inversion that can deadlock. Reschedule had the same inversion, was **reproduced** as a real 1213 deadlock (HTTP 500) and fixed in `097741742`; these paths are not fixed and not yet reproduced. | Major | Confirmed | [01](01-lock-order-and-deadlocks.md) |
| 2 | No transaction retries on a deadlock, and a deadlock or lock-wait timeout is not mapped: the client gets HTTP 500 `SERVER_ERROR`. Data stays correct, the request fails. | Major | Confirmed | [01](01-lock-order-and-deadlocks.md) |
| 3 | `offered_services` rows are locked exclusively on every create. A brand-owned service is one row shared by every branch, so creates for it queue brand-wide. Throughput problem, not integrity. | Major | Confirmed | [01](01-lock-order-and-deadlocks.md) |
| 4 | Overlap protection is application code only (row locks plus a range scan). MySQL has no exclusion constraint and there is no slot table or generated unique key. | Major | Confirmed | [02](02-overlap-guards.md) |
| 5 | The same client can hold overlapping bookings with different barbers: `client_id` is in no overlap query. Open decision BD-10. | Major | Confirmed | [02](02-overlap-guards.md) |
| 6 | No idempotency key on any write endpoint (booking create, walk-in, subscription assign, payouts, uploads, OTP send). A retry after a lost response returns 409 `double_booking`, not the original booking. | Major | Confirmed at audit time; **fixed for booking create** in `dda9ac13c` (header made required in `af8cf0565`); all other endpoints still open (see [03](03-idempotency-and-uniqueness.md)) | [03](03-idempotency-and-uniqueness.md) |
| 7 | Missing uniqueness: `clients.phone`, one live subscription per brand, payouts, barber affiliations, saved filters, bans. | Major | Reported | [03](03-idempotency-and-uniqueness.md) |
| 8 | Password-reset codes (client and staff) and the client email-verify code are stored in plaintext in the cache; the email code is compared with `!==`. Verify-and-consume is not atomic. | Minor | Reported | [04](04-hashing-and-tokens.md) |
| 9 | Slot generation runs one query set per 15-minute candidate: **measured 296 queries (chair only) and 488 (chair and barber)** on an empty branch, behind an IP-keyed throttle (60 per minute). BG-19. | Major | Confirmed (measured) | [05](05-search-and-availability.md) |
| 10 | At audit time no client sent an idempotency key (`client_app` has sent one for booking create since `dda9ac13c`); the dashboard proxy would still drop the header.  Mobile retries PATCH on 5xx and 429. Conflict, 429 and 503 messages are thin, and nothing reloads slots after a 409. | Major | Reported | [06](06-client-sync-and-ux.md) |

## Files

1. [Lock order and deadlocks](01-lock-order-and-deadlocks.md): every lock in create, reschedule, confirm and cancel, the inversions, the retry gap, the `offered_services` bottleneck.
2. [Overlap guards](02-overlap-guards.md): what the database enforces, what only code enforces, the same-client gap, and the options for a real backstop.
3. [Idempotency and uniqueness](03-idempotency-and-uniqueness.md): endpoint-by-endpoint table, missing unique constraints, the proposed design.
4. [Hashing and tokens](04-hashing-and-tokens.md): what is hashed, what is not, atomic verify-and-consume.
5. [Search and availability](05-search-and-availability.md): slot cost, throttles, caching and invalidation.
6. [Client sync and UX](06-client-sync-and-ux.md): dashboard and Flutter behaviour, error mapping, double-submit, retry policy, EN and AR gaps.
7. [Test coverage](07-test-coverage.md): what the existing concurrency suite proves and the cases still missing.
8. [Remediation plan](08-remediation-plan.md): phases, order, decisions, verification, docs to update.
9. [Write paths outside booking](09-write-path-audit.md): findings W1 to W15 for subscriptions, one-time codes, token refresh, defaults, uniqueness, chair writes, ratings, lost updates, retried deletes and scheduling.
10. [Fix order and conventions](10-fix-order.md): shared patterns, four phases, the parallel tests each fix needs, and the open decisions BD-11 and BD-12.

## State on 19 November 2026

Done and committed (BG-9, BG-10, BG-11):

- `097741742`: reschedule locks chair, barber, then booking row; the parallel suite `backend/tests/Concurrency/ConcurrentBookingsTest.php` (same slot, chair versus barber, reschedule versus create). It reproduced the deadlock first. [01](01-lock-order-and-deadlocks.md), [07](07-test-coverage.md).
- `dda9ac13c`: `Idempotency-Key` on `POST /bookings` (`BookingIdempotency`, table `booking_idempotency_keys`, 48 h, daily prune), sent by `client_app`. Committed as optional. [03](03-idempotency-and-uniqueness.md).
- `af8cf0565`: the header is required on `POST /bookings` (the owner confirmed no older build is in production); `TestCase::json()` adds a default key, and the app sends one always.
- `03747a67b`: named throttles on booking and explore routes (BG-10); other public GET routes are BG-16.
- `e78c0e24d`: a booking whose services mix currencies is refused (BG-11, by another session).
- Service-lock tuning (finding 3) was deliberately not done: no throughput evidence ([01](01-lock-order-and-deadlocks.md)); it is now BG-35 in the [fix order](10-fix-order.md).

In the working tree, uncommitted, owned by another session (do not stage from here):

- `Booking/Services/BookingLockOrder.php`, used by the confirm paths (`BookingLifecycleEloquentResolver`) and by reschedule: the fix for finding 1. It has no parallel regression test; see [07](07-test-coverage.md), item 1.

Open (backlog BG-17 for finding 1, BG-18 for finding 2): findings 1 (confirm path), 2 (no deadlock retry or mapping), 3 to 5, 7 to 10; BD-10 is a product decision. Files 05, 06 and 08 are listed above but are not written yet (they have no author yet; do not delete the rows). Non-booking write findings are W1 to W15 in [09](09-write-path-audit.md), ordered in [10](10-fix-order.md).

## Related

- [Backlog](../backlog/index.md): BD-10 (client overlap decision), BG-16 (unthrottled public GET routes), TD-8 (version locking, and idempotency for every endpoint but booking create).
- [Testing strategy](../architecture/testing-strategy.md): the process-based concurrency method.
- `backend/modules/Booking/Services/BookingIdempotency.php` and `backend/docs/feature-index.md` (BG-9 entry) for the shipped idempotency behaviour.
- `backend/docs/13-technical-concepts-part-3.md` (idempotency design sketch), `backend/docs/04-house-rules-part-2.md` (rule E1, no double booking), `backend/docs/08-edge-cases-part-2.md` (shop double booking).
