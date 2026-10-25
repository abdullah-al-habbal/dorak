---
nodeid: docs.decisions
parentnode: docs.todowork
childnodes:
  - docs.todowork
codeanchors:
  - backend/modules/
  - frontend/dashboard/src/
  - frontend/mobile/apps/
---

# Open Product Decisions

Routes: [work tracker](todowork.md) · [task specifications](INDEX.md#document-nodes).

> Generated from every `Decision required` bullet in `tasks/`. Each blocks its task's acceptance criteria. Record the answer in the task spec, then tick it here.

## [Task 01: Fix Barber Affiliation Ownership Authorization](tasks/task-01-affiliation-ownership.md)
- [x] Decision resolved (Task 55): both invite directions exist — a barber inviting a branch/brand (`POST /api/v1/barbers/{barber}/affiliate`) and a branch inviting a barber (`POST /api/v1/branch/affiliations`). The receiving party is whichever side did not initiate: the barber-side accept/reject policy checks `initiated_by_type`/`initiated_by_id` is not the acting barber, and the branch-side accept/reject actions reject (403) a branch trying to accept/reject its own invite.

## [Task 04: Restrict Service Catalog Mutations to Admins](tasks/task-04-service-catalog-authorization.md)
- [ ] Decision required: whether branches may **propose** catalog items for admin approval. If yes, this becomes a separate endpoint and is out of scope here.

## [Task 05: Scope Chair Barber Assignment to Branch Affiliations](tasks/task-05-chair-barber-assignment-scope.md)
- [x] Decision resolved: both branch-managed barbers and barbers with an accepted affiliation to the branch or its brand count as members.

## [Task 06: Move Job Application Decisions to Branch Managers](tasks/task-06-job-application-status-authz.md)
- [x] Decision resolved: no withdrawal status is introduced. Remove the barber decision route; any future withdrawal flow needs a separately specified domain state and workflow.

## [Task 09: Enforce Account Status at Login and Hide Inactive Entities in Explore](tasks/task-09-activation-status-visibility.md)
- [x] Decision resolved: pending or unverified clients may log in only with a verification-only token. That token may access `POST /api/v1/client/email/verify/send`, `POST /api/v1/client/email/verify`, and `POST /api/v1/client/logout`. Email verification upgrades that token to normal client access; disabled clients remain forbidden.

## [Task 12: Enforce Branch Manager Scope and Last-Branch Guard](tasks/task-12-branch-manager-scope.md)
- [x] Decision resolved: block branch deletion with HTTP 409 while future bookings remain; do not cancel bookings or send notifications as part of deletion.

## [Task 13: Fix Booking Completion for Bookings Without a Barber](tasks/task-13-booking-completion-null-barber.md)
- [x] Decision resolved: HIST-1 stores one `client_service_histories` row per booked service.

## [Task 18: Centralize Booking Status Transitions](tasks/task-18-booking-lifecycle-service.md)
- [x] Decision resolved: allow `Confirmed → NoShow` per EC-3, where a no-show is the outcome when the client never arrives. `NoShow` remains allowed from `InProgress` as well.

## [Task 21: Add Slot Availability Endpoint](tasks/task-21-slot-availability-endpoint.md)
- [x] Decision resolved: the minimum lead time for new bookings is 0 minutes (any future instant is bookable), configurable via `booking.slots.min_lead_minutes` (`BOOKING_SLOT_MIN_LEAD_MINUTES`, default `0`). The 2-hour cancellation window is a cancellation rule, not an availability filter.

## [Task 22: Validate Bookings Against Branch Hours and Barber Schedule](tasks/task-22-booking-hours-schedule-validation.md)
- [x] Decision resolved: schedule times are compared in the timestamp's timezone. The API contract is UTC, so schedule checks run against UTC until a barber/branch timezone column exists; no new column is added by this task.
- [x] Decision resolved: a barber with no schedule rows stays bookable (backward compatible). Once any rows exist, only an active row that fully contains the booking interval `[time_slot, ends_at)` on the start weekday is bookable.

## [Task 23: Validate Service Ownership and Resolve Chair Barber on Booking](tasks/task-23-booking-service-ownership.md)
- [x] Decision resolved (EC-9): one barber calendar across all affiliations. The overlap check runs on `bookings.barber_id` regardless of chair or shop, so a barber cannot be double-booked across chairs or shops.
- [x] Decision resolved: a chair-linked barber that differs from an explicit `barber_id` returns 422; with no chair, only services owned by the booked barber are accepted (barber-only/at-home rules are refined in Tasks 24/25).

## [Task 24: Allow Booking a Shop Barber Without Picking a Chair](tasks/task-24-barber-booking-without-chair.md)
- [x] Decision resolved: add a nullable `bookings.branch_id` column (backfilled from chairs). It is set for every in-person booking; branch-scoped queries use `BookingModel::forBranch()`, which also matches legacy rows through the chair. A barber is affiliated if they have an accepted affiliation with the branch or its brand.

## [Task 25: Enforce At-Home Booking Rules](tasks/task-25-at-home-booking-rules.md)
- [x] Decision resolved: affiliated barbers ARE allowed to take at-home bookings, so there is no `is_freelancer` check. The booking must still respect the barber's schedule and the single barber calendar (EC-9 overlap on `bookings.barber_id`), so it cannot conflict with shop bookings.

## [Task 27: Handle Chair Maintenance Conflicts with Existing Bookings](tasks/task-27-chair-maintenance-conflicts.md)
- [x] Decision resolved (EC-2): cancel-and-notify. Moving a chair to maintenance is rejected with 409 `CHAIR_HAS_ACTIVE_BOOKINGS` while reservation-blocking bookings (`pending`/`confirmed`/`in_progress`, ending in the future) exist. With an explicit `force=true`, those bookings are canceled through the lifecycle with `cancellation_reason = chair_maintenance` and each client receives one status notification. Automatic reassignment to another free chair is not done; client rebooking UX is a follow-up.

## [Task 30: Persist Notification Delivery Records](tasks/task-30-notification-delivery-records.md)
- [x] Decision resolved (retention): `notification_deliveries` rows are kept 90 days. `NotificationDeliveryModel` is `MassPrunable` on `attempted_at < now − 90 days`, and `model:prune` runs daily at 03:00. `notifications` (inbox) rows are not pruned; an inbox retention policy is a follow-up if the table grows.
- [x] Decision resolved (admins): the inbox endpoints accept `client`, `barber` and `branch_api` only, as the spec lists. The dashboard bell is hidden for admin sessions (`admin_api`), which receive no notifications today.
- [x] Decision resolved (dashboard test tooling): `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event` and `jsdom` were added as dev dependencies so the bell can have a real component test; Vitest now also picks up `tests/**/*.test.tsx` (per-file `// @vitest-environment jsdom`).


## [Task 32: Add Client Profile Read Endpoint and Session Restore](tasks/task-32-client-profile-endpoint.md)
- [x] Decision resolved: `GET /api/v1/client/profile` returns the exact client payload login, register and social login return (`id`, `name`, `email`, `phone`, `email_verified`), produced by one shared `ClientModel::authPayload()`. It sits behind the normal `auth:client` + active-account middleware, so unverified or disabled clients get 403 `ACCOUNT_NOT_ACTIVE`. On cold start the session restore fetches the profile after the token refresh; a 401/403 from the profile clears the token and falls back to guest, while offline or server errors keep the session authenticated without a client. `preferred_universe`/`avatar` stay with Task 33.

## [Task 33: Complete Auth Payload and Email Re-verification](tasks/task-33-auth-payload-email-reverification.md)
- [x] Decision resolved: one `ClientProfileResource` (`id, name, email, phone, avatar, preferred_universe, email_verified_at, created_at`) is the only client object returned by login, register, social login, `GET` and `PATCH client/profile`. It replaces the interim `email_verified` boolean from Task 32 (mobile derives `ClientDto.emailVerified` from `emailVerifiedAt`); `avatar` is the public URL or null. Changing the email (case-insensitive) sets `email_verified_at = null` and queues `SendEmailVerificationCodeJob`; the client is then verification-only (403 `ACCOUNT_NOT_ACTIVE` elsewhere) until the code is confirmed. Profile edit gains an email field; after an email change the app pushes the verify screen and refreshes the session client from the PATCH response. Follow-up fix: `POST client/refresh-token` and `GET client/profile` now sit in the verification-scope route group, so unverified or email-changed clients can restore their session (the refreshed token carries the `email-verification` ability); disabled clients and all other routes stay blocked.
## [Task 34: Implement Phone OTP Verification](tasks/task-34-phone-otp-verification.md)
- [x] Decision resolved: phone OTP is verification-only for an authenticated, active client (`POST client/phone/otp`, `POST client/phone/verify`); it is not a login method and login stays email/password/social. SMS goes through a new `Modules\Core\Contracts\SmsSender` selected by `services.sms.driver` (`SMS_DRIVER`); the only shipped driver is `log` (no vendor SDK), so a real provider is a follow-up driver behind the same contract. The code is 6 digits, cached hashed with the phone for 10 minutes, with a 5-attempt lockout; `phone_verified_at` is stored and exposed in the client payload (9 keys). `PATCH client/profile` returns 422 for a phone that differs from the stored one and treats an unchanged phone as a no-op. A phone already verified on another client is rejected (422). Registration and walk-in phones stay unverified.

## [Task 35: Verify Password Recovery Code Server-Side](tasks/task-35-password-recovery-code-verification.md)
- [x] Decision resolved (best option, no product decision was open): one `Modules\Client\Services\PasswordResetCodeVerifier` owns the cached reset code (issue, non-consuming verify, consume) so `POST client/forgot-password/verify` and `POST client/reset-password` share a single 5-attempt budget; the fifth wrong guess on either route discards the code and a new `forgot-password` request starts a fresh budget. A rejected code on both routes is 422 `VALIDATION_FAILED` with `errors.code` (the shape the mobile parser already maps to a code-field error), instead of the previous field-less `UNPROCESSABLE_ENTITY`. The verify route has no `exists` rule: an unknown email returns exactly the wrong-code response. `forgot-password` and `reset-password` keep their existing `exists:clients,email` validation (unchanged contract; the app already masks it).

## [Task 36: Enforce Account Deletion Rules and History Anonymization](tasks/task-36-account-deletion-rules.md)
- [x] Decision resolved (best option): keep soft delete + PII scrub. A hard delete would cascade-delete the client's bookings (`bookings.client_id` is `cascadeOnDelete`), destroying branch and barber records, and would leave no row for the FACE-3 30-day face-photo grace period. One `Modules\Client\Services\ClientAccountDeletion` serves both `DELETE client/account` and the admin panel delete action: it returns 409 `ACCOUNT_HAS_ACTIVE_BOOKINGS` while any booking is `pending`/`confirmed`/`in_progress` (`BookingStatus::reservationBlockingValues()`), otherwise (under a row lock) revokes tokens, deletes social accounts, scrubs name/email/phone/verification timestamps/avatar/password, sets status `disabled`, soft-deletes, and removes the avatar file after commit. HIST-2 is applied by a synchronous `ClientModel` `deleted` observer in ClientHistory: `client_id`, `booking_id`, `client_notes` and `barber_notes` become null and history media rows are deleted; service, barber, branch, catalog, rating, metadata and date stay for aggregates. The email becomes `deleted-{id}@deleted.invalid`, so the person can register again. Face-photo purge after the grace period (FACE-3) is not part of this task.

## [Task 37: Implement Barber Self Sign-Up](tasks/task-37-barber-self-signup.md)
- [x] Decision resolved (best option): self-registered barbers start `pending` and need admin activation (the existing `POST /api/v1/admin/barbers/{barber}/activate`). Freelancers appear in Explore and visit clients' homes, so vetting before the first booking is the safer default, and it reuses Task 09's status enforcement. Registration returns 201 with a token so the barber can read the profile and verify the email, but a new `EnsureBarberAccountAccess` middleware limits pending barbers to the `onboarding` routes (profile read, email verification) and blocks self-activation (`approved` scope), so the pending state cannot be bypassed; login of a pending barber stays 403 `ACCOUNT_NOT_ACTIVE`. Email verification mirrors the client flow (hashed 6-digit code, 10 min, 5 attempts) and does not gate approval. Side effect: every operational barber route now checks the current status, so tokens of a later-disabled barber stop working there (self-reactivation of a disabled barber is unchanged pending Task 53's decision).

## [Task 38: Implement Brand Owner Role](tasks/task-38-brand-owner-role.md)
- [x] Decision resolved (best option, [ADR 0001](adr/0001-brand-owner-as-client.md)): the owner is the client referenced by `brands.owner_id`, with a derived dashboard capability (enabled, email-verified, not banned, owns ≥1 brand). `POST dashboard/login` accepts `actor_type = owner` (client credentials); the token is a client Sanctum token with the `dashboard` ability and the claim carries `brand_id` + `brand_ids`. Every dashboard scope check now goes through `DashboardActor::scopedBranchIds()/scopedBrandIds()/canAccessBranch()/canManageBrand()`, so an owner manages all branches, chairs, services, stylists and bookings of owned brands (including branch create/update/delete) and gets 403/404 elsewhere. Rejected: a separate `owner_api` authenticatable (duplicate credentials, verification and ban handling for the same person, and a second source of truth next to `brands.owner_id`). The brand switcher UI is deferred to Task 77; owners see all owned brands' branches at once and the branch form only offers owned brands.

## [Task 39: Resolve Review Subject for Barber and At-Home Bookings](tasks/task-39-review-subject-resolution.md)
- [x] Decision resolved (best option): a chair or in-shop booking with an assigned barber produces **two** published reviews, one for the branch (`rating`) and one for the barber (`barber_rating`, defaulting to `rating`), sharing the comment; an at-home or chairless booking without a branch produces a barber review only (`rating`); a booking with neither branch nor barber returns 422 `no_subject`. This follows the entity model's separate review records, keeps each subject's disputes and aggregates independent, and gives shop barbers real ratings for Task 42. Branch = `bookings.branch_id`, falling back to the chair's branch for legacy rows. A client reviews a booking once (any second submission → 409); the check and inserts run in one transaction with the booking row locked. Review requests are now also sent for barber-only bookings.

## [Task 40: Implement Two-Way Reviews and Client Reputation](tasks/task-40-two-way-reviews-reputation.md)
- [x] Decision resolved (best option): (1) client-subject reviews are **not** visible to the client — they protect other shops (F3) and showing them invites retaliation and disputes; only staff (branch, barber, dashboard) see the client's reputation (published average + count) on booking payloads, and client-facing booking payloads never carry it. (2) Barbers rate clients **only for bookings without a branch** (at-home/freelance), where the barber is the provider side; a booking with a branch is rated by that branch (branch account, or a branch manager/brand owner via `POST dashboard/bookings/{booking}/review`), so a booking carries at most one provider-side client review. The platform admin cannot rate. Uniqueness is enforced by a DB unique index on `(booking_id, author_type, subject_type)`, which also allows the client's branch + barber reviews from Task 39.

## [Task 41: Complete Review Dispute Workflow](tasks/task-41-review-dispute-workflow.md)
- [x] Decision resolved (best option): remove the client-side dispute route. A review's author disputing their own review has no spec basis (PRD/L4: the reviewed shop flags it), the author can already be protected by admin moderation, and no app calls it. Disputes are raised by the reviewed party: `POST /api/v1/branch/reviews/{review}/dispute` for branch-subject reviews and `POST /api/v1/barber/reviews/{review}/dispute` for barber-subject reviews (Task 39). Admins resolve (`published` or `hidden`) at any time while a review is disputed; `reviews:release-expired-disputes` runs hourly and re-publishes disputes older than 48 hours. Disputed and hidden reviews never count towards `rating_min`. Clients cannot dispute shop→client reviews because those are not visible to them (Task 40).

## [Task 43: Add Explore Text Search](tasks/task-43-explore-text-search.md)
- [x] Decision resolved (best option): SQL `LIKE` over every locale of the translatable JSON fields, not a search engine. Discovery is already radius-bounded, so the candidate set per query is small; Scout/Meilisearch would add infrastructure and an indexing pipeline while the DB-engine question (Task 63) is still open. One helper (`Modules\Explore\Support\ExploreTextSearch`) builds `lower(<json path>) like ? escape '!'` per locale so Arabic matches on MySQL and SQLite alike, matching is case-insensitive regardless of JSON collation, and `%`/`_` in user text are literal. Revisit with a search engine if catalog size or ranking-by-relevance needs grow.

## [Task 44: Support Unisex Universe and Barber Universe Filter](tasks/task-44-universe-unisex-and-barber-filter.md)
- [x] Decision resolved (best option): (1) the venue universe moves to the **branch** (A5 and the entity model's Branch "gender category"): new `branches.universe` (`men`/`women`/`unisex`, `Modules\Core\Enums\VenueUniverse`) backfilled from `brands.universe`; the brand value stays only as the default a new branch inherits on every creation path (`BranchModel::creating`). (2) `universe` becomes **optional** per BE-03: an explicit value wins, else the signed-in client's `preferred_universe`; a guest or an `all` preference browses every universe. `universe=men|women` matches that universe plus `unisex` (EC-12). Barbers get `barbers.universe` (default `unisex`, self-editable via `PATCH barber/profile`) and `explore/barbers` accepts the same optional filter. The client preference enum stays men/women(/all).

## [Task 45: Include Freelancers in Search Results](tasks/task-45-freelancers-in-search.md)
- [x] Decision resolved (best option): a unified `GET /api/v1/explore/search` returning typed items `{type: branch|barber, distance, entity}`. Merging two separately paginated endpoints on the client cannot produce a correct global order or page boundaries; the server merges both candidate sets (from the same per-type queries as `explore/branches` / `explore/barbers`, so filters stay identical) nearest first and paginates once. Freelancers without coordinates (EC-11) are included **only in text searches (`q`)**, regardless of radius, after the located results (`distance = null`); a service-area rule needs declared base locations and is deferred. Shop-employed barbers are never standalone results. `explore/branches` and `explore/barbers` stay unchanged for compatibility.

## [Task 46: Apply Composite Ranking Before Pagination](tasks/task-46-composite-ranking-ordering.md)
- [x] Decision resolved (best option): an explicit `face_shape_compatible` **filters** results (REC-1 table: "Filter to catalog items matching the client's face shape analysis"); when the parameter is absent, the signed-in client's latest face analysis (`client_face_analysis_results.detected_face_shape`) is used **only as the γ boost**, so a stored analysis never silently empties discovery. The composite score is computed over the whole candidate set (nearest 500 inside the radius) before pagination, with α redistributed proportionally when the client has no preference vector or the target no embedding.

## [Task 49: Apply Brand Creation Defaults](tasks/task-49-brand-creation-defaults.md)
- [x] Decision resolved (best option): no first-branch field is mandatory at brand creation. An optional `first_branch` object takes `name.en/ar` (default: the brand name), `latitude`/`longitude` (optional, as a pair; set later with the storefront, Task 51) and `email`/`password` (optional, as a pair). Without credentials the branch gets a non-routable placeholder email (`branch-<uuid>@branches.dorak.invalid`) and a random password; it always starts `pending` (not discoverable) until the owner sets credentials, storefront and status from the dashboard `owner` portal (Task 38). This keeps owner onboarding (Flow 4) to one call while honouring A1/A2.

## [Task 50: Implement Brand Feature Flags](tasks/task-50-brand-feature-flags.md)
- [x] Decision resolved (best option, EC-6): extra branches are never destroyed and stay **visible and bookable** (clients and their bookings are unaffected; daily booking operations such as status changes continue), but they become **read-only for configuration** — branch details, chairs, services, stylists, floor plan and managed barbers return 403 `feature_not_enabled` — except for the brand's original (oldest) branch, until `multi_branch` is on again. Adding a branch is refused while the brand already has one and the flag is off.

## [Task 51: Add Branch Storefront Fields and Opening Hours](tasks/task-51-branch-storefront-fields.md)
- [x] Decision resolved (best option): a branch with no hours configured stays always open (as barber schedules, Task 22); a dated override beats the weekly row; times are UTC `H:i` and overnight hours are not supported until a branch timezone exists; storefront tags are free-form strings on the branch, matched by explore search. Branch hours are now enforced for bookings and slots (closes Task 22's pending sub-criterion).

## [Task 52: Expose Settings and Preferences API](tasks/task-52-settings-preferences-api.md)
- [x] Decision resolved (best option): `dashboard/profile/notifications` is kept, unchanged. It models four independent per-channel toggles (`email_enabled`, `push_enabled`, `booking_enabled`, `system_enabled`) on `dashboard_notification_preferences`, a different granularity than Preference's single `notification_enabled` flag; collapsing one into the other would either lose the per-channel UI or force four new Preference columns duplicating a working endpoint. The new `dashboard/settings` endpoint still exposes `notification_enabled` for parity with the client/barber/branch contract, and both read/write the same underlying actor's row independently.

## [Task 53: Complete Activation Management](tasks/task-53-activation-management.md)
- [x] Decision resolved (default, [PENDINGHUMANREVIEW]): a barber's self-deactivation/self-activation stays as-is (self-only, unchanged from Task 09/37). The spec text leans toward owner-only control, but changing self-service access is a product call with no safe default inferable from the code — kept the existing behavior rather than guessing, and flagged for a human decision.
- [x] Decision resolved (default, [PENDINGHUMANREVIEW]): deactivating a branch keeps existing future bookings untouched (no auto-cancel). Auto-cancelling is a destructive, cross-module side effect (would need to fan out through Task 28 notifications) that the spec does not mandate ("must not delete bookings" only rules out deletion); keeping bookings is the reversible, lower-blast-radius default. Flagged for a human decision on whether auto-cancel is actually wanted.

## [Task 54: Add Barber Bio and Self-Service Services API](tasks/task-54-barber-profile-and-services-api.md)
- [x] Decision resolved (D1, user-directed): migrate every branch-owned `offered_services` row to its parent brand (`serviceable_type='branch'` → `'brand'`, `serviceable_id` = the branch's `brand_id`) and remove `branch` from the allowed `serviceable_type` everywhere — dashboard API (`ServiceRequest`, Store/Update/Destroy/List/Show service actions), the Branch Filament panel's own `OfferedServiceResource` (now creates/scopes brand-owned services via `ScopePanelToCurrentUser`), `WalkInBookingScopeResolver`, `OfferedServiceModel::scopeOfferedAtShop`, and every explore/ranking/recommendation code path that read `BranchModel::offeredServices()` (removed; replaced with `whereHas('brand', fn ($b) => $b->whereHas('services', ...))`, since a brand's services are shared by every one of its branches). The data migration is irreversible (`down()` is a no-op) because the original branch ownership can't be reconstructed after the fold. Branch managers keep the ability to create/manage their brand's services (via `DashboardActor::canManageBrandServices()`), matching the pre-existing UX, just reclassified as brand ownership per house rule D1.

## [Task 55: Complete Affiliation Lifecycle](tasks/task-55-affiliation-lifecycle.md)
- [x] Decision resolved (user-directed): on terminate, future bookings are left as-is. Terminating only clears `chairs.barber_id` for the chair the barber held at that branch; it does not cancel or notify (Task 28) about any already-confirmed future bookings, which keeps this task's scope inside the affiliation lifecycle rather than reaching into booking cancellation.
- [x] Decision resolved (user-directed): renamed `accepted` → `active` everywhere — the `AffiliationStatus` enum case/value, every Filament status badge/select/color map, and a data migration (`2026_10_25_000001_rename_affiliation_status_accepted_to_active.php`) backfilling existing `accepted` rows to `active`. The `accepted_at` column and the `accept`/`notification_responded_accepted_body` *action*-oriented translation keys were intentionally left as-is: they name the accept action, not the resulting status value.

## [Task 56: Complete Job Board](tasks/task-56-job-board-completion.md)
- [x] Decision resolved: nullable FK over soft delete. `job_postings.branch_id` is now `nullable()` with `nullOnDelete()` (no soft-delete column added to `branches`/`job_postings`). A `BranchModel::deleting` hook closes the branch's open postings before the delete runs, so `job_applications` rows always survive a branch deletion regardless of FK behavior; the nullable FK only guards against an already-deleted branch leaving a dangling `branch_id`.

## [Task 57: Open Currency Conversion to Clients and Convert Prices](tasks/task-57-currency-client-conversion.md)
- [x] Decision resolved (spec drift): `currency/convert` is now `GET` only (the `POST` route and its admin-namespaced duplicate actions were removed; no alias kept). `GET /api/v1/currency/convert` and `GET /api/v1/exchange-rates` are public and rate-limited (`throttle:60,1`); no admin API write route for rates exists (writes stay Filament-only, unchanged). The spec's Full-Stack Scope already prescribed `GET`, so this resolves by spec text, not guesswork. Record the outcome in Task 87.
- [x] Decision resolved (new, not previously tracked): D5's "owning brand's `price_display_mode`" does not map to the existing `preferences.price_display_mode` enum (`tax_inclusive`/`tax_exclusive` — a tax concern, unrelated to currency display). Added a new boolean `preferences.dual_price_display` column (default `false` = converted-only, matching the house-rules default branch) instead, looked up by `(preferenceable_type, preferenceable_id)` for either a brand- or barber-owned service (D1), via the same polymorphic `Preference` pattern Task 52 already uses. No Filament/dashboard/mobile UI toggle was added for this flag (out of this task's Full-Stack Scope) — follow-up needed wherever brand/barber settings management ships (Task 52/77).

## [Task 58: Complete Client History](tasks/task-58-client-history-completion.md)
- [x] Decision resolved (already implemented, stale evidence): HIST-1's "one row per service" was already the live behavior — `OfferedServiceModel`'s single `offered_service_id` FK column settled this before this task, and `BookingCompletedObserver` already loops `$booking->services` (not `->first()`) and tolerates a null `barber_id` (nullable column + nullable command field, migration `2026_10_13_000001`). No code change was needed; see the existing `tests/Feature/ClientHistory/BookingCompletionHistoryTest.php::'it writes one history row for every booked service'`.
- [x] Decision resolved: HIST-3 barber read qualifies on **any non-canceled booking** between the barber and client (past, active, or upcoming), matched via `booking.barber_id` or `booking.chair.barber_id`. Chosen over "upcoming/active only" because a barber preparing for an upcoming appointment needs to see the client's full grooming history, not just future bookings; `canceled` is excluded because a canceled booking never produced a real client relationship.

## [Task 60: Fix Favorites and Saved Filter Contracts](tasks/task-60-favorites-and-saved-filters-contract.md)
- [ ] Make `POST /api/v1/client/favorites` idempotent: `firstOrCreate`, returning 200 with the existing favorite or 201 when created. Decision required: idempotent add, or true toggle (a second call removes). Idempotent add is recommended because `DELETE /client/favorites/{favorite}` already exists.

## [Task 62: Fix Recommendation Pipeline](tasks/task-62-recommendation-pipeline-fixes.md)
- [ ] `rebuildEdges`: also rebuild `history` edges, and `visited` edges from interaction logs. Decision required: whether `face_matched` and `similar_client` ship now or are deferred (PRD marks some as later).

## [Task 63: Provision pgvector Storage for Preference Vectors](tasks/task-63-pgvector-storage.md)
- [ ] Decision required: target production database. Either:

## [Task 64: Add Status Change Audit Trail](tasks/task-64-status-audit-trail.md)
- [ ] Decision required: retention period for audit rows (indefinite vs. N years).

## [Task 65: Specify and Build Monetization and Analytics APIs](tasks/task-65-monetization-analytics-apis.md)
- [ ] Decision required: payment provider (none, or a named PSP), and whether payments are online at booking time or offline.
- [ ] Decision required: subscription plans and how they map to the brand feature flags from Task 50 (`multi_branch`, `job_board`).
- [ ] Decision required: commission model (percent or fixed; per booking or per period) and payout schedule.
- [ ] `backend/docs/features/BE-20-monetization.md` exists, every "Decision required" above is answered, and it is marked approved by the product owner.

## [Task 67: Conform Modules to Context Namespacing](tasks/task-67-context-namespacing-conformance.md)
- [ ] Decision required: whether Core base classes and middleware are exempt from BE-18. If they are, document the exemption in BE-18.

## [Task 70: Wire Booking Detail Page and Full Status Set](tasks/task-70-booking-detail-and-status.md)
- [ ] Decision required: expose the allowed next statuses per booking in the booking resource (e.g. `allowed_transitions`), or hard-code the transition map in the UI. Recommended: the backend field, so the UI never drifts from the lifecycle.

## [Task 71: Enable List Search and Filters](tasks/task-71-list-search-filters.md)
- [ ] Bookings: keep the existing filters. Add `search` on client name/email only if the product wants it (Decision required).

## [Task 72: Replace Portal Home Placeholders and Fix Overview](tasks/task-72-portal-home-and-overview.md)
- [ ] Decision required: an admin viewing several brands with different base currencies. Either convert to one platform currency (needs Task 57) or return revenue per currency.

## [Task 74: Add Branch Operations BFF and UI](tasks/task-74-branch-operations-bff-ui.md)
- [ ] Decision required: **(a)** proxy `/api/v1/branch/*` directly with the manager's dashboard token (Sanctum, branch provider), or **(b)** add equivalent endpoints to the `Dashboard` module behind `DashboardOperationsAuthorizationMiddleware` so that admins can also use them for any branch. Recommended: (b) for floor plan, profile and reviews, so admin and manager share one contract and one policy. Whichever is chosen, a feature test must prove the token or guard works end to end.
- [ ] Floor-plan payload completeness (`backend/docs/06_entity-model-abstract.md:153-156`): the floor plan must carry a canvas size (width/height/unit) and static decoration components (waiting area, mirror, etc.) alongside chairs. Today `GET /branches/{branch}/floor-plan` returns only preset, zones and chairs. Extend `PATCH branch/floor-plan` to accept `canvas` and `decorations`, and extend the GET response. Decision required: whether these are persisted (e.g. in the branch's floor-plan configuration) or computed. The spec leaves it open.

## [Task 75: Add Branch People BFF and UI (Affiliations, Jobs, Barbers)](tasks/task-75-branch-people-bff-ui.md)
- [ ] Decision required: managed barber creation. Use only the existing dashboard `stylists` create, or keep `POST branch/barbers`, but not both. If `stylists` covers it, `branch/barbers` becomes mobile-only (Task 85).

## [Task 77: Add Brand and Service Catalog Management UI](tasks/task-77-catalog-brand-management-ui.md)
- [ ] Brands: Decision required. Either add admin brand management under `auth:admin_api`, or let the brand owner manage brands through the dashboard once the Brand Owner role exists (Task 38). This UI follows that decision.

## [Task 81: Clean Up Client Auth Flows](tasks/task-81-client-auth-cleanup.md)
- [ ] Social login: add provider buttons in `login_content.widget.dart` behind a config flag. **Decision required:** which providers and SDKs (Google/Apple) ship in v1.

## [Task 83: Build Stylist App Features](tasks/task-83-stylist-app-features.md)
- [ ] **Decision required:** whether barbers may self activate/deactivate (`barbers/{barber}/activate|deactivate`). Task 53 defines the semantics; do not build UI for it until then.

## [Task 86: Clean Up Shared Mobile Packages](tasks/task-86-mobile-shared-packages-cleanup.md)
- [ ] **Decision required:** either (a) move the floor-plan widgets from `client_app` into `feature_floor_plan` so `business_app` can reuse them for floor-plan configuration (Task 85), or (b) delete the package and remove it from the `workspace:` list. Do not leave it empty.
