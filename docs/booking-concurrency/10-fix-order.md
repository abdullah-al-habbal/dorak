---
nodeid: docs.booking-concurrency.fix-order
parentnode: docs.booking-concurrency
childnodes: []
codeanchors:
  - backend/modules/Core/
  - backend/modules/Subscription/
  - backend/modules/Client/
  - backend/tests/Concurrency/
---

# 10. Fix order and conventions for non-booking writes

Routes: [booking concurrency](index.md) · [write-path audit](09-write-path-audit.md) · [documentation graph](../index.md) · [backlog](../backlog/index.md)

How to fix the findings W1 to W15 in [file 09](09-write-path-audit.md), in which order, and with which shared patterns. The work items are in the [backlog](../backlog/index.md) (BG-27 to BG-36, TD-8, TS-8, BD-11, BD-12). Backend only: the dashboard and the apps need no change except where a phase says so. Every item follows the task executor: Pest tests first, gates, one local commit, no push.

## Conventions to adopt (new code and every fix below)

1. **Lock order.** Parent before child, and rows of one table in ascending id. Booking resources keep the order in [file 01](01-lock-order-and-deadlocks.md) (client, chair, barber, bookings, services). Any new path that writes a chair, barber or booking takes its locks through `BookingLockOrder`, never by hand.
2. **A set invariant needs one serialisation row.** "Exactly one default", "never zero active", "one live subscription per brand": lock the owning row (the brand) or, for a global set, all rows of the table in id order inside the transaction, then check, then write. Where MySQL can express it, add a database backstop as well (a generated column with a unique index).
3. **Unique index first, helper second.** The index is the guarantee; the code catches `UniqueConstraintViolationException` and re-reads. One shared helper in `Core` (around `createOrFirst`) replaces ad hoc `firstOrCreate` on racy keys. New indexes go into the original `create_*_table` migration with `// @contract-migration: ...` (the dev rule in `backend/AGENTS.md`); a new table gets a new file.
4. **One-time codes are consumed once.** A single `Core` service takes the attempt increment first and atomically, rejects over the limit, compares in constant time, and consumes on success with `Cache::pull`. All six verifiers use it. It needs a shared cache store (Redis or database); with the `file` driver the guarantee is per server only.
5. **Rotation deletes first and checks the count.** A refresh proceeds only when its delete removed exactly one row; otherwise it answers 401.
6. **Retries.** Lock-heavy transactions pass an attempts argument to `DB::transaction`, and a deadlock or lock-wait timeout that still escapes is mapped to a retryable 409 or 503, never a bare 500 ([01](01-lock-order-and-deadlocks.md)).
7. **Deletes are idempotent.** A `DELETE` of something already gone answers success (the mobile client retries `DELETE`); a missing row is a 404 only when it never belonged to the caller.
8. **Lost updates.** Writes that two staff can make at once take `expected_version` (the row's `updated_at`) and run as a conditional update; zero rows changed is 409 through `ConflictApiException` (TD-8).

## Order

| Phase | Items | Why here |
|---|---|---|
| 1. Wrong or insecure data, no decision needed | BG-27 subscription assign and plan delete (W1); BG-28 atomic code verification, plus hashing the plaintext codes from [04](04-hashing-and-tokens.md) (W2); BG-29 atomic refresh rotation for Client, Barber and Branch (W3); BG-30 purger rechecks under the lock (W4); BG-31 default and last-active invariants for gateways, currencies and languages (W5) | These can lose a verified account, double a subscription, reuse a code or token, or leave the platform with no payment gateway. Each is small and independent, so they can ship one at a time |
| 2. Backstops | BG-32 unique indexes (`preferences`, verified phone, `recommendation_edges`, the [03](03-idempotency-and-uniqueness.md) gaps) and the shared create-or-first helper, applied to social login, walk-in, favorites, device token, service override and registration (W6, W7, W8, W12) | A unique index makes every later fix safe to retry. Needs BD-12 (what "unique phone" means) first |
| 3. Lock coverage | BG-33 dashboard chair writes through `BookingLockOrder` (W9, needs BD-11; `BookingLockOrder` is already committed (`c386493f2`, proven by `cb57adc6a`); the order of the chair write is checked under the lock, not before it); BG-34 barber row lock for portfolio order and schedule replace, review dispute and rating refresh under a lock (W10, W11) | Lower impact than phase 1, higher blast radius per change; each touches code that has its own regression tests |
| 4. Platform | BG-35 service locks shared and ordered ([01](01-lock-order-and-deadlocks.md)), `onOneServer()` on the schedules, unique jobs (W15); the deadlock retry and error mapping is BG-18, owned by the booking remediation; BG-36 idempotent deletes and a generic idempotency middleware for the other creating POSTs ([03](03-idempotency-and-uniqueness.md), W14); TD-8 version locking, starting with chairs, services, branch floor plan and platform settings (W13) | Cross-cutting. Version locking changes the API contract (the dashboard and apps must send `expected_version`), so it ships last and backward compatible: absent means no check, then required |

Phase 1 and 2 items do not change an API response shape, so mobile needs no release. BG-36 and TD-8 do: record the contract in the module docs and sync the dashboard proxy and the apps in the same task (backend contract policy in `AGENTS.md`).

## Tests (TS-8)

Each item adds a test in `backend/tests/Concurrency/`, next to `ConcurrentBookingsTest.php`, that runs the competing requests in parallel against MySQL (`composer test:concurrency`) and asserts the end state, not just the status codes:

- two assigns for one brand leave one active subscription; delete-plan versus assign never leaves an active subscription on a deleted plan;
- one code used twice succeeds once; N parallel wrong guesses leave at most the allowed attempts;
- two refreshes with one token: one 200, one 401, one live token;
- verify versus purge: a verified client survives;
- two gateway promotions leave one default; two different disables leave one active;
- duplicate social login, walk-in and favorite requests answer 200 or 409, never 500, and create one row;
- chair delete versus booking create: either the booking exists and the delete is refused, or the chair is gone and the booking is refused.

Single-process Pest tests cannot show a race; a test that only calls the handler twice in a row does not count. This is the same bar as backlog TS-5.

## Docs to update when each item ships

- Remove the backlog item and add a line to `backend/docs/feature-index.md`.
- Add the rule to [file 01](01-lock-order-and-deadlocks.md) (lock order), [03](03-idempotency-and-uniqueness.md) (uniqueness) or [04](04-hashing-and-tokens.md) (codes) instead of repeating it here, and delete the matching row in [09](09-write-path-audit.md).
- Update `backend/docs/13-technical-concepts-part-2.md` (version locking) when TD-8 starts: it describes a `version` column that does not exist.
- Keep the one-paragraph rules in `backend/AGENTS.md` ("Concurrency") and [testing strategy](../architecture/testing-strategy.md) current.

## Decisions needed

- **BD-11:** may one barber sit at several chairs? If not, add a unique index on `chairs.barber_id` and a clear error. If yes, nothing changes in W9 beyond the locks.
- **BD-12:** is phone uniqueness about verified numbers only (recommended: unverified numbers may repeat, since nobody has proved ownership), or every stored number?
