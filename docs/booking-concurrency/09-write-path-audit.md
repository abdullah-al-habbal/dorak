---
codeanchors:
  - backend/modules/Subscription/
  - backend/modules/Payment/
  - backend/modules/Client/
  - backend/modules/Barber/
  - backend/modules/Branch/
  - backend/modules/Dashboard/
  - backend/modules/Review/
  - backend/modules/Core/
---

# 9. Write paths outside booking

Routes: [booking concurrency](index.md) · [fix order](10-fix-order.md) · [documentation graph](../index.md) · [backlog](../backlog/index.md)

Files 01 to 04 cover booking create, reschedule, confirm, idempotency and code hashing. This file covers every other backend write path that can race: it adds findings W1 to W15 and points at the earlier files where they already hold a finding. Same grades as the [index](index.md): Confirmed means the code was read this session. Review date 19 November 2026, working tree after `dda9ac13c`. Nothing was run, reproduced or load-tested.

The audit scanned the 127 files under `backend/modules` that write (`create`, `save`, `update`, `delete`, `increment`, `firstOrCreate`, `updateOrCreate`) and have no `lockForUpdate`, `Cache::lock` or `BookingLockOrder`. About 40 were opened. The rest are single-row profile edits or uploads, where last write wins is acceptable until W13 lands.

## Findings

| ID | Finding | Severity | Grade |
|---|---|---|---|
| W1 | `AssignSubscriptionHandler` does not lock the brand: two concurrent assigns each cancel "live" rows, then each insert an `active` one, leaving two active subscriptions. `DeletePlanHandler` checks for live subscriptions and then deletes, so an assign can slip in between. `brand_subscriptions` has only a plain index on `(brand_id, status)`. | Major | Confirmed |
| W2 | Every one-time-code check is read, compare, then consume or count: client email verify, phone OTP (`VerifyPhoneOtpHandler.php:23-38`), client and staff password reset, barber email verify, dashboard email change. Parallel requests with the right code can both succeed, and parallel wrong guesses all pass the attempt check before the counter trips, so concurrency speeds up brute force of a 6-digit code. The `Cache::increment` then `Cache::add` start of the counter can also undercount. Extends [04](04-hashing-and-tokens.md) gaps 3 and 4 to all six sites. | Major | Confirmed |
| W3 | Token refresh for Client, Barber and Branch is `currentAccessToken()->delete()` then `createToken()`, with no check that the delete removed a row. Two parallel refreshes with one token both succeed and leave two live tokens. The dashboard's `DashboardRefreshTokenResolver::rotate` already does this correctly (single use, row lock). | Major | Confirmed |
| W4 | `UnverifiedSignupPurger::removeOne` decides on a stale model (unverified, pending, no bookings), then deletes in a transaction. A client who verifies their email between the check and the delete loses a verified account. `ClientAccountDeletion::delete` locks the client row but rechecks only blocking bookings, not verification or status, so the lock does not close the gap. | Major | Confirmed |
| W5 | "Exactly one default" and "never zero active" are checked without a lock. `SavePaymentGatewayHandler` can leave two defaults on concurrent promotion. `SetPaymentGatewayActiveHandler` can leave zero active gateways when two different gateways are disabled at once. `SetCurrencyActiveAction` and `SetLanguageActiveAction` check `is_default` on an unlocked row, so a default change racing a deactivate can retire the default. | Major | Confirmed |
| W6 | `clients.phone` is not unique and `markPhoneVerified` locks only the caller's row, so two clients can verify the same phone. Already [03](03-idempotency-and-uniqueness.md) gap 4; the fix is in [10](10-fix-order.md). | Major | Confirmed |
| W7 | `preferences` has no unique index on `(preferenceable_type, preferenceable_id)`, yet `GetOrCreateSettingsEloquentResolver` uses `firstOrCreate` and `RegisterOwnerHandler` uses `updateOrCreate` on that pair. Concurrent calls can create duplicate rows. A grep of every `unique(` in the migrations finds none for this table. | Major | Confirmed |
| W8 | Find-then-create where a unique index exists but the violation is not caught, so the loser gets HTTP 500: social login (client created, then social account, as two steps), walk-in `findOrCreateClient` (`firstOrCreate` on email), favorites, device token, service override upsert, client registration. Extends [03](03-idempotency-and-uniqueness.md) gap 5. `ApplyForJobEloquentResolver` is the pattern to copy. | Minor | Confirmed |
| W9 | The dashboard chair paths check, then act, with no lock between. `DestroyChairHandler` runs `ChairConflictResolver::ensureNoBlockingBookings` (a plain `exists()`) and then `DestroyChairEloquentResolver` deletes the chair with no transaction, so a booking created in between ends up on a deleted chair. `UpdateChairHandler` makes the same unlocked check before `ChairStatusService::update`, which locks only afterwards, so a barber reassignment can race a booking create. `StoreStylistEloquentResolver` sets `chairs.barber_id` with a plain update. `chairs.barber_id` is not unique, so one barber can sit at several chairs. The rule, decided 2026-11-26, is at most one chair per branch (BD-11). | Major | Confirmed |
| W10 | `UploadPortfolioEloquentResolver` computes `max(sort_order)+1` without a lock (duplicate order). `UpdateScheduleEloquentResolver` deletes and re-inserts a barber's week in a transaction that takes no row lock; two parallel PUTs hit the `(barber_id, day_of_week)` unique index or a deadlock, and nothing retries it (see [01](01-lock-order-and-deadlocks.md)). | Minor | Confirmed (code); the deadlock is analytical |
| W11 | `ResolveReviewDisputeHandler` reads the review without a lock before checking its status. `SubjectRatingRefresher::refresh` reads count and average, then writes, with no lock on the subject, so two refreshes can write the older value last. `ReleaseExpiredReviewDisputesCommand` reads its subject list, then updates, as separate steps. | Minor | Confirmed |
| W12 | `ClientRecommendationEdgeRebuilder` rebuilds edges with `updateOrCreate`, and `recommendation_edges` has a primary key and two non-unique indexes (no unique on source, target and type). The rebuild runs from an after-commit observer and from a daily command, so two runs for one client can create duplicate edges. | Minor | Confirmed |
| W13 | No resource has a version check, so two managers editing the same chair, service, branch or floor plan, job posting, commission rule, plan, gateway, marketing page or platform setting means last write wins. This is backlog TD-8. | Major | Confirmed |
| W14 | The mobile retry interceptor retries `GET`, `PUT`, `PATCH` and `DELETE` on timeout, 5xx and 429 (not `POST`). A retried `DELETE` of a favorite returns 404 (`RemoveFavoriteEloquentResolver` uses `firstOrFail`) after the first call already succeeded. `DeleteSavedFilter` is already safe. | Minor | Confirmed |
| W15 | Seven scheduled commands (Booking, ClientFaceProfile, ClientRecommendation, Core, Dashboard, Review, Subscription) use `withoutOverlapping()` and none uses `onOneServer()`; no job implements `ShouldBeUnique`, so with more than one app instance each instance runs the job. `RecordClientInteractionJob` and similar jobs have no `ShouldBeUnique`. Booking notification jobs already dispatch `afterCommit`; that is correct and stays. | Minor | Confirmed (schedules); Unverified (queue and cache configuration, `config/queue.php` was not found at the expected path) |

## Already sound

- Booking create, reschedule and confirm follow one lock order through `BookingLockOrder` (committed in `c386493f2`; its parallel confirm-versus-create test is `cb57adc6a`, BG-17; see the [index](index.md)). Cancel paths lock only the booking row, so they cannot invert against create. `ChairStatusService` locks chair, then bookings, matching create.
- Row locks plus checks already protect: affiliations, payout generation and transitions, review submit, job apply and status, branch and brand lifecycle, account bans and deletion, admin deactivation, dashboard refresh rotation, and the booking idempotency key.
- Unique indexes already exist for commission per booking, reviews, favorites, notification `dedupe_key`, device tokens, service overrides, job applications, social accounts and barber schedules.

## Not examined

The `Explore` module, the Client and Barber ban observers, the `ClientFaceProfile` jobs, the `Marketing` and `Onboarding` admin writes beyond the page-level lock, `SettingsService` cache stampede, and the cache driver actually used in production. Findings W2 and W15 assume a shared cache (Redis or database), not the `file` driver.
