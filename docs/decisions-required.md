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
- [ ] Decision required: which party is the "receiving party" depends on the invite direction designed in Task 55. Until then, a barber may accept or reject only affiliations whose `barber_id` is their own **and** that were not initiated by them. If no initiator column exists, add `initiated_by_type` and `initiated_by_id`.

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

## [Task 36: Enforce Account Deletion Rules and History Anonymization](tasks/task-36-account-deletion-rules.md)
- [ ] Decision required: keep soft delete + PII scrub, or hard delete with history `client_id` set to NULL.

## [Task 37: Implement Barber Self Sign-Up](tasks/task-37-barber-self-signup.md)
- [ ] Decision required: should self-registered barbers start `pending` until admin activation (ties to Task 53) or active immediately?

## [Task 38: Implement Brand Owner Role](tasks/task-38-brand-owner-role.md)
- [ ] Decision required: model the owner as a new authenticatable (own guard, e.g. `owner_api`) or as a client with an owner capability that can obtain a dashboard session. Record the decision in an ADR.

## [Task 39: Resolve Review Subject for Barber and At-Home Bookings](tasks/task-39-review-subject-resolution.md)
- [ ] Decision required: should a chair booking with an assigned barber produce a review for the branch only, the barber only, or both (a rating for each)? The entity model (`backend/docs/06_entity-model-abstract.md:182-186`) suggests separate review records.

## [Task 40: Implement Two-Way Reviews and Client Reputation](tasks/task-40-two-way-reviews-reputation.md)
- [ ] Decision required: are client-subject reviews visible to the client, and can barbers (not just branches) rate clients?

## [Task 41: Complete Review Dispute Workflow](tasks/task-41-review-dispute-workflow.md)
- [ ] Decision required: keep or remove the client-side dispute route (client disputing their own review has no spec basis).

## [Task 43: Add Explore Text Search](tasks/task-43-explore-text-search.md)
- [ ] Decision required: SQL `LIKE` across translatable JSON columns vs a search engine (Scout/Meilisearch); the DB engine question in Task 63 affects this.

## [Task 44: Support Unisex Universe and Barber Universe Filter](tasks/task-44-universe-unisex-and-barber-filter.md)
- [ ] Decision required: universe stays on the brand or moves to the branch (A5 says branch); also whether `universe` becomes optional per BE-03 (default to the client's `preferred_universe`).

## [Task 45: Include Freelancers in Search Results](tasks/task-45-freelancers-in-search.md)
- [ ] Decision required: a unified `GET explore/search` returning typed items (`branch` | `barber`), or keep two endpoints and have the client merge them. Record the decision.

## [Task 46: Apply Composite Ranking Before Pagination](tasks/task-46-composite-ranking-ordering.md)
- [ ] Decision required: should `face_shape_compatible` filter results (PRD §5) or only boost; and should it default to the authenticated client's latest face analysis.

## [Task 49: Apply Brand Creation Defaults](tasks/task-49-brand-creation-defaults.md)
- [ ] Decision required: which first-branch fields are mandatory at brand creation (address/coordinates now or later via Task 51).

## [Task 50: Implement Brand Feature Flags](tasks/task-50-brand-feature-flags.md)
- [ ] Downgrade (I3/EC‑6): when `multi_branch` is turned off and the brand has more than one branch, keep existing branches, but block creating new ones. Decision required: whether extra branches become read-only or stay operational.

## [Task 52: Expose Settings and Preferences API](tasks/task-52-settings-preferences-api.md)
- [ ] Decision required: whether `dashboard/profile/notifications` is replaced by Preference or kept as an alias.

## [Task 53: Complete Activation Management](tasks/task-53-activation-management.md)
- [ ] Decision required: whether a barber's self-deactivation should remain (the spec text implies the owner controls activation). Keep the current behavior until decided.
- [ ] Deactivating a branch must not delete bookings. Decision required: whether future bookings are auto-cancelled (and notified via Task 28) or kept.

## [Task 54: Add Barber Bio and Self-Service Services API](tasks/task-54-barber-profile-and-services-api.md)
- [ ] D1: remove `branch` from the allowed `serviceable_type`. Decision required: migrate any existing branch-owned `offered_services` rows to the parent brand, or block the change until data is cleaned up.

## [Task 55: Complete Affiliation Lifecycle](tasks/task-55-affiliation-lifecycle.md)
- [ ] On terminate, unassign the barber from the branch's chairs (`chairs.barber_id = null`). For future bookings, decision required: cancel and notify via Task 28, or keep them.
- [ ] Decision required: rename `accepted` to `active`, or update the spec (record the outcome in Task 87).

## [Task 56: Complete Job Board](tasks/task-56-job-board-completion.md)
- [ ] EC‑20: change the FKs to `nullOnDelete` or soft-delete branches/postings. On branch removal, set open postings to `closed` and keep the applications. Decision required: soft delete vs nullable FK.

## [Task 57: Open Currency Conversion to Clients and Convert Prices](tasks/task-57-currency-client-conversion.md)
- [ ] Decision required: keep `POST /currency/convert` (and update the spec) or add a `GET` alias. Record the outcome in Task 87.

## [Task 58: Complete Client History](tasks/task-58-client-history-completion.md)
- [ ] HIST-1: record all booking services. Decision required: one history row per service, or one row with an `offered_service_ids` JSON/pivot. The observer must not fail when `barber_id` is null (Task 13).
- [ ] HIST-3 barber read: add `GET /api/v1/barber/clients/{client}/history` (auth:barber). Allow only if the client has a booking with this barber (Decision required: any past booking, or an upcoming/active one only).

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
