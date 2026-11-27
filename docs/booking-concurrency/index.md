---
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
| 1 | Confirm paths locked the booking first, then the chair and barber; create holds the chair and scans into that booking's slot, a lock-order inversion that can deadlock. Reschedule and confirm both had it, both were **reproduced** as a real 1213 deadlock (HTTP 500) by a parallel test and are fixed: reschedule in `097741742`, confirm through `BookingLockOrder` (`c386493f2`, proven by `cb57adc6a`). Barber and branch accept routes share the fix but have no test of their own. | Major | Confirmed (reproduced) | [01](01-lock-order-and-deadlocks.md) |
| 2 | No transaction retries on a deadlock, and a deadlock or lock-wait timeout is not mapped: the client gets HTTP 500 `SERVER_ERROR`. Data stays correct, the request fails. | Major | Confirmed | [01](01-lock-order-and-deadlocks.md) |
| 3 | `offered_services` rows are locked exclusively on every create. A brand-owned service is one row shared by every branch, so creates for it queue brand-wide. Throughput problem, not integrity. | Major | Confirmed | [01](01-lock-order-and-deadlocks.md) |
| 4 | Overlap protection is application code only (row locks plus a range scan). MySQL has no exclusion constraint and there is no slot table or generated unique key. | Major | Confirmed | [02](02-overlap-guards.md) |
| 5 | The same client can hold overlapping bookings with different barbers: `client_id` is in no overlap query. Decided 2026-11-26: not allowed (BD-10), not implemented. | Major | Confirmed | [02](02-overlap-guards.md) |
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
8. [Write paths outside booking](09-write-path-audit.md): findings W1 to W15 for subscriptions, one-time codes, token refresh, defaults, uniqueness, chair writes, ratings, lost updates, retried deletes and scheduling.
9. [Fix order and conventions](10-fix-order.md): shared patterns, four phases, the parallel tests each fix needs, and the decisions BD-11 and BD-12.

## Status

The headline table and files 01 to 07 and 09 describe the code as reviewed on 19 November 2026; later notes are dated. What is still open is in the [backlog](../backlog/index.md), and the order of work is in the [wave tracker](../waves/index.md) and [file 10](10-fix-order.md). Fixed since the review: finding 1 (the deadlock, BG-9 and BG-17) and finding 6 for booking create only.

When a fix ships:

- Remove its backlog row and add a line to `backend/docs/feature-index.md`.
- Edit the finding in the file that owns it, so no fixed finding reads as open.
- Add the new case to [test coverage](07-test-coverage.md) and remove it from "Not proven yet".
- Keep the booking-lock paragraph and the "Concurrency" section of `backend/AGENTS.md` true.

## Related

- [Backlog](../backlog/index.md): BD-10 (client overlap, decided and not implemented), BG-16 (unthrottled public GET routes), TD-8 (version locking, and idempotency for every endpoint but booking create).
- [Testing strategy](../architecture/testing-strategy.md): the process-based concurrency method.
- `backend/modules/Booking/Services/BookingIdempotency.php` and `backend/docs/feature-index.md` (BG-9 entry) for the shipped idempotency behaviour.
- `backend/docs/13-technical-concepts-part-3.md` (idempotency design sketch), `backend/docs/04-house-rules-part-2.md` (rule E1, no double booking), `backend/docs/08-edge-cases-part-2.md` (shop double booking).
