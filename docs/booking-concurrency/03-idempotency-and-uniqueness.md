---
codeanchors:
  - backend/modules/Booking/
  - backend/modules/Core/Http/Middleware/
  - backend/modules/Subscription/
  - backend/modules/Payout/
---

# 3. Idempotency and uniqueness

Routes: [booking concurrency](index.md) · [documentation graph](../index.md)

Route files live at `modules/*/Routes/Api/V1/*.php`.

## State at audit time

No idempotency infrastructure existed: no middleware, table or header read. `Core/Http/Middleware/AssignRequestUuidMiddleware.php:17` reads `X-Request-ID`, which is a tracing id and is never used for deduplication. The only idempotent behaviour was natural: `NotificationWriter` dedupes on `dedupe_key`, `CommissionRecorder` uses `firstOrCreate` on a unique `booking_id`, favorites use `firstOrCreate`, job apply catches `UniqueConstraintViolationException`, mark-seen returns `updated: 0` on a repeat.

## Shipped for booking create (BG-9, 19 November 2026)

`POST /api/v1/bookings` has idempotency. The audit's design below was a general middleware; the shipped design is booking-specific, and the differences are deliberate:

| Point | Audit sketch | Shipped |
|---|---|---|
| Where | `Core` middleware, one `idempotency_keys` table for every endpoint | `Booking/Services/BookingIdempotency`, called by `CreateBookingHandler` inside the create transaction; table `booking_idempotency_keys` |
| Claim | insert first, `idempotency_in_flight` 409 for a concurrent twin | the `clients` row lock the create already takes serializes requests of one client, so the twin waits and then replays. No in-flight state exists |
| Stored | status and response body | only the booking reference; a replay re-reads the booking and renders it with the normal resource, so a replay is never stale or a stored 4xx |
| Key | unique `(user_type, user_id, key)` | unique `(client_id, key)`; 8 to 64 characters of `[A-Za-z0-9._:-]`; read from the `Idempotency-Key` header only, a body field is ignored |
| Same key, other body | 422 | 422 `idempotency_key_reused` (sha256 request hash over chair, barber, branch, start time in UTC, the sorted service ids and the at-home address, compared with `hash_equals`; `CreateBookingCommand::requestHash`) |
| Replay | stored response and `Idempotency-Replayed: true` | the original booking, HTTP 201, header `Idempotency-Replayed: true`, no second event or push |
| Failures | never cache 5xx | a failed attempt rolls back and stores nothing, so the same key can be retried |
| Expiry | `expires_at` | 48 hours (`BookingConstants`), expired key deleted on the next use, `model:prune` daily at 03:30 |

Whether the header is optional: commit `dda9ac13c` made it optional (shipped builds send none). `af8cf0565` made it required (422 `idempotency_key` when missing or malformed), because the owner confirmed no older app build is in production; see the backlog and `backend/docs/feature-index.md` (BG-9). Walk-in and rebook call the handler directly with a null key.

Client app: `BranchDetailBloc` keeps one `Random.secure` UUID v4 per submission (`IdempotencyKey.generate`), reuses it only for an identical request (so a lost response retries safely), replaces it when the booking details change and clears it after success. `ApiClient.post` takes a per-call `headers` map.

What the first audit claim got wrong: it said a retry "returns 409 `double_booking`". True, but it is the whole harm. A retry never created a second booking, because the overlap check refuses it; the client got a false conflict for a booking that existed. The key fixes that error, not a duplicate-row problem.

A key does not stop one client holding overlapping bookings; that is BD-10 (decided 2026-11-26, not built).

Not yet covered by keys: walk-in, reschedule, cancel, subscription assign, payouts, saved filters, uploads, OTP send (TD-8). The proposal below still applies to them; if a second endpoint needs a key, extract the shared part of `BookingIdempotency` rather than adding another table per endpoint.

## Endpoint table

| Endpoint | Key or dedupe today | What a replay does |
|---|---|---|
| Booking create `bookings.php:15` (throttle 10 per minute per client) | `Idempotency-Key` header, table `booking_idempotency_keys` (shipped 19 November 2026; before: none) | the original booking, 201 with `Idempotency-Replayed: true`. Before the fix: 409 `DoubleBookingException`, and the client never got the original |
| Walk-in `dashboard-operations.php:72` (no throttle) | none | same 409; `findOrCreateClient` uses `firstOrCreate` on email, so a unique race is a 500 |
| Reschedule `dashboard-operations.php:77` (PATCH, dashboard only; no client reschedule route exists) | none | passes (self-overlap excluded) but re-fires `BookingRescheduledEvent` and the notification (`RescheduleBookingEloquentResolver.php:58`) |
| Cancel (client `bookings.php:16`, barber `barber.php:72`, dashboard `dashboard-operations.php:76`) | none | error result (`invalidStatus`) instead of the original success |
| Accept, start, complete, no-show (`barber.php:68-71`, `branch.php:65`, `dashboard-operations.php:75`; no throttle) | none | 409 or 422 via `canTransitionTo` |
| Review submit `reviews.php:18,21,23` | none | `alreadyReviewed` |
| Payout generate, approve, mark-paid, cancel `dashboard-admin.php:210-215` | none | generate is a natural no-op (only `payout_id IS NULL` entries); the others return null on a repeat |
| Subscription assign `dashboard-admin.php:191-192` | none | **not idempotent**: each call cancels live subscriptions and creates a new row (`AssignSubscriptionHandler.php:26-38`) |
| Payments | no capture route exists | bookings are pay-at-salon only |
| Phone OTP send `client.php:49` (3 per minute) | none | overwrites the cached code and sends a new SMS (`RequestPhoneOtpHandler.php:88-97`) |
| Device token `api_v1_routes.php:17` (no throttle) | unique `token`, `updateOrCreate` | idempotent |
| Favorites `client-interaction.php:20` | unique `(client_id, favorited_id, favorited_type)`, `firstOrCreate` | 200 on repeat |
| Saved filters `client-interaction.php:24` | none | creates a duplicate (`CreateSavedFilterEloquentResolver.php:14`) |
| Uploads (client, barber, face profile, history, admin, owner) | none | each retry stores a new file |
| Waitlist | not implemented | n/a |

## Missing uniqueness and double-submit risks

Well protected: reviews (unique `(booking_id, author_type, subject_type)`, booking row lock), job applications (unique `(job_posting_id, barber_id)`, posting lock, catches `UniqueConstraintViolationException` at `ApplyForJobEloquentResolver.php:25-28`: the pattern to copy), commission entries (unique `booking_id`), dashboard refresh tokens (unique `token_hash`, `rotate()` locks), notifications (`dedupe_key`).

Gaps (Reported unless noted):

1. Booking double booking has no DB constraint ([file 02](02-overlap-guards.md)); booking create has no replay protection.
2. Subscription: `AssignSubscriptionHandler.php:23-38` does not lock the brand and `brand_subscriptions` has only an index on `(brand_id, status)`. Two concurrent assigns can both insert `active` rows.
3. Payout: `GeneratePayoutsHandler.php:25` locks unattached entries, which protects against double inclusion, but `payouts` has no unique on `(brand_id, currency_code, period)` and `external_reference` is not unique, so one transfer reference can be entered on two payouts.
4. `clients.phone` is nullable and not unique (`barbers.phone` is unique). `PhoneOtpEloquentResolver::markPhoneVerified` locks only the caller's client row, so two clients verifying the same phone can both pass `phoneVerifiedByAnotherClient`.
5. Registration and social login check by email with `first()` then `create` and do not catch the unique violation, so a concurrent duplicate is a 500 (`RegisterHandler.php:181`, `SocialLoginEloquentResolver.php:230`).
6. Barber affiliations: duplicates are checked under a barber row lock, but the table has no unique and no index on `(barber_id, affiliable_id, affiliable_type, status)`.
7. Device token: column is `varchar(255)` unique but the request allows `max:4096`; no throttle; concurrent first inserts can raise a unique violation.
8. Saved filters, bans and exchange rates have no unique indexes.
9. Face profile: no unique on `(client_id, image_hash)`; the photo limit check can race. The hash is md5 (see [file 04](04-hashing-and-tokens.md)).
10. Booking double accept is safe (booking lock plus `canTransitionTo`), but the second caller gets an error, not the first result.

## Proposed design

- A `Core` middleware backed by an `idempotency_keys` table (a new table, so a new migration file is allowed): unique `(user_type, user_id, key)`, `request_hash` (sha256 of method, path and canonical body, compared with `hash_equals`), `response_status`, `response_body`, `locked_until`, `expires_at`.
- Claim the row first with an insert so two concurrent requests with the same key cannot both run: the second gets 409 `idempotency_in_flight`. Same key with a different hash is 422. A completed key replays the stored response with an `Idempotency-Replayed: true` header.
- Store only deterministic results (2xx and business 4xx); never 5xx or 503.
- The sketch in `backend/docs/13-technical-concepts-part-3.md:26-70` caches only after a response below 400 and has no in-flight lock; do not copy it as is.
- Apply to booking create, walk-in, subscription assign, payout generate and mark-paid, saved filters; optional on cancel and reschedule (and dedupe the reschedule event when start and end are unchanged).
- Make the key optional first (shipped mobile builds send none), required later. **Done for `POST /bookings` (2026-11-19):** no older build is in production, so the header is required there from the start of release; the other endpoints in the list above are still open.
- Keep one mechanism for all endpoints: extend the shipped booking one instead of adding a table per endpoint, or record why not.

## Natural unique-violation handling

Wherever a unique index is the real backstop, catch `UniqueConstraintViolationException` and answer 409, as `ApplyForJobEloquentResolver` does. Favorites should use `createOrFirst` rather than `firstOrCreate`.
