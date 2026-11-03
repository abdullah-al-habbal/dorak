---
nodeid: backend.feature-index
parentnode: backend.docs
childnodes:
  - backend.feature-index.part-2
  - backend.feature-index.part-3
  - backend.feature-index.part-4
  - backend.feature-index.part-5
  - backend.feature-index.part-6
  - backend.feature-index.part-7
  - backend.feature-index.part-8
codeanchors:
  - backend/modules/
---

# Feature Index — Dorak Backend

> **Append entry after adding each feature.** This is the chronological map of every feature built.

### Domain-Event Notifications (Task 31)
- Queued jobs (all `afterCommit`, ID-only scalar payloads, stable `dispatchKey`, en+ar copy): `AffiliationInvitedNotification` (`invite`), `AffiliationRespondedNotification` (`invite`), `JobApplicationReceivedNotification` (`application`), `JobApplicationStatusChangedNotification` (`application`), `ReviewRequestNotification` (`review_request`).
- Triggers: `POST /barbers/{barber}/affiliate` (branch targets only), barber `POST /affiliations/{id}/accept|reject` and branch `POST /branch/affiliations/{id}/accept|reject`, `POST /jobs/{job}/apply`, `PATCH /branch/job-postings/{posting}/applications/{application}/status`, and booking completion through `BookingTransitionNotifier::statusChanged` (barber, branch and dashboard routes).
- FCM/inbox `data`: `type` (enum value), `event` (`affiliation_invited|affiliation_responded|application_received|application_status_changed|review_request`) plus IDs (`affiliation_id`, `application_id`, `job_posting_id`, `booking_id`, `status`).
- Not notified: brand-targeted affiliation requests (no notifiable actor), Filament direct edits, review requests for bookings with neither a branch nor a barber to review (Task 39). Tests: `tests/Feature/Notification/DomainEventNotificationTest.php`.

### Notification Inbox & Delivery Records (Task 30)
- Tables `notifications` (uuid, `notifiable` morph using `client`/`barber`/`branch` aliases, `type` `booking_update|invite|application|review_request`, `title`, `body`, `data`, unique `dedupe_key`, `read_at`) and `notification_deliveries` (`notification_id`, nullable `device_token_id` with `nullOnDelete`, `status` `sent|failed`, `provider_message_id`, `error`, `attempted_at`).
- `NotificationWriter` + `FcmNotificationSender::sendTo(..., NotificationTypeEnum $type, ..., ?string $dispatchKey)` — writes one inbox row per recipient (idempotent per dispatch key, so queue retries never duplicate rows or re-push delivered devices), then one delivery row per device attempt; still writes the inbox row when FCM is unconfigured or the recipient has no device.
- `GET /api/v1/notifications` — `auth:client,barber,branch_api`; unread first, newest first; `per_page` 1–100 (default 20); `meta.pagination` + `meta.unread_count`.
- `PATCH /api/v1/notifications/{notification}/read` — idempotent; another actor's ID returns 404 `RESOURCE_NOT_FOUND`.
- `POST /api/v1/notifications/read-all` — `data {updated, unread_count: 0}`.
- `NotificationDeliveryModel` is `MassPrunable` after 90 days; `model:prune` scheduled daily at 03:00 by `ApplicationServiceProvider`.

### Manager & Stylist Mobile Operations
- `PATCH /api/v1/branch/bookings/{booking}/status` — branch-authenticated booking transition to `in_progress`, `completed`, `no_show`, or `cancelled`, scoped to the manager's branch.
- `PATCH /api/v1/branch/chairs/{chair}/status`, `PUT /api/v1/dashboard/chairs/{chair}`, `PATCH /api/v1/chairs/{chair}` — moving a chair to `maintenance` returns 409 `CHAIR_HAS_ACTIVE_BOOKINGS` (`errors.booking_ids`) while future reservation-blocking bookings exist; `force=true` cancels them (`cancellation_reason = chair_maintenance`), notifies each client and lists `meta.cancelled_booking_ids`. Shared `ChairStatusService`.
- `GET /api/v1/branch/chairs` — branch-authenticated chair list, scoped to the manager's branch.
- `GET /api/v1/branch/dashboard` — daily/monthly completed-service revenue, booking/chair metrics, and the authenticated branch switcher payload.
- `GET /api/v1/barber/appointments/today` — barber-authenticated, barber-scoped appointments for today.
- `PATCH /api/v1/barber/workstation-status` — barber-authenticated online/offline workstation presence; persisted as `barbers.is_workstation_online`.
- `POST /api/v1/barber/register` — public, `throttle:5,1`; barber self sign-up (`name`, `email` unique in barbers, `password` + confirmation, optional `is_freelancer` default true, optional `phone`). Creates a `pending` barber with `has_login`, queues the email code, returns 201 `{token, barber}` (`BarberResource`, now incl. `email_verified_at`). Pending barbers cannot log in (403 `ACCOUNT_NOT_ACTIVE`) until an admin activates them (Task 37).
- `POST /api/v1/barber/email/verify/send` (`throttle:3,1`), `POST /api/v1/barber/email/verify` (`code`, `throttle:5,1`) — barber email verification; hashed 6-digit code, 10-minute TTL, 5-attempt lockout; wrong code 422 `VALIDATION_FAILED` + `errors.code`; success returns the barber.
- `EnsureBarberAccountAccess` (Task 37) gates every barber-token route on current status: `onboarding` (pending/enabled: profile read, email verification), `approved` (not pending: self activate/deactivate), default `active` (enabled: all other barber routes, including affiliations and job applications). Otherwise 403 `ACCOUNT_NOT_ACTIVE`.

---

### Core
- `HealthCheckAction` [GET /api/v1/health]
- `ApiResponseBodyValueObject` — standard response shape `{success, statusCode, code, message, timestamp, data, meta?, errors?}`
- `BaseApiAction` + `ApiResponseTrait` — paginated/ok/created/error/validation helpers
- `BaseModuleServiceProvider` — auto-mounts `Routes/Api/V1/*.php` at `/api/v1` with `['api']` middleware
- Auth guards: `client` (sanctum), `barber` (sanctum), `barber_dashboard` (session), `branch` (session), `branch_api` (sanctum), `admin` (session), `admin_api` (sanctum)
- Dashboard brand owner (Task 38, ADR 0001): `POST /api/v1/dashboard/login` with `actor_type = owner` authenticates a client that owns ≥1 brand (enabled, verified, not banned); the client Sanctum token carries the `dashboard` ability and the claim `brand_id` + `brand_ids`. Owners operate on every branch of their brands (branches CRUD, bookings, chairs, services, stylists, overview) via `DashboardActor::scopedBranchIds()/canAccessBranch()/canManageBrand()`; other brands → 404 (reads) / 403 (writes). `GET dashboard/me` exposes `brand_id`/`brand_ids`.
- `FcmNotificationSender` — sends per-device notifications through FCM HTTP v1 using a cached OAuth2 service-account token; prunes unregistered device tokens and retries transient failures; persists inbox and delivery records (Task 30)

## Continued in

- [Part 2: Client](feature-index-part-2.md)
- [Part 3: Review API](feature-index-part-3.md)
- [Part 4: JobPosting API](feature-index-part-4.md)
- [Part 5: Admin Filament Pages (PRD 13 Phase 2)](feature-index-part-5.md)
- [Part 6: Password Change](feature-index-part-6.md)
- [Part 7: PRD Phase 3 — ClientFaceProfile Module (Complete)](feature-index-part-7.md)
- [Part 8: Feature Registry](feature-index-part-8.md)

## Barber history media upload (Gap G1)
`POST /api/v1/barber/history/{history}/media` (`auth:barber`) — the barber assigned to a visit
(`ClientServiceHistoryPolicy::attachMedia`) uploads a before/after/reference photo; any other barber gets 403.
Shares the handler and validation (jpeg/png, ≤5 MB) with the client upload.

## Staff password reset, logout and refresh (Gap G8)
Barber and branch accounts: `POST /api/v1/{barber|branch}/forgot-password` (throttled, never reveals whether an email exists),
`/reset-password` (emailed 6-digit code via `Core\Services\StaffPasswordResetCodes`, scoped per account type, burns after
use or too many attempts; revokes all tokens), `/logout` (current token) and `/refresh-token` (rotates the token; 403 when
the account is deactivated or banned). Managed barbers without a login cannot reset.

## Branch account gating (Gap G7)

- `Modules\Branch\Http\Middleware\EnsureBranchAccountAccess` returns 403 `ACCOUNT_NOT_ACTIVE` when the authenticated branch is not `Enabled`. It is applied to every `auth:branch_api` route (branch, settings, reviews, activation, chairs, notifications, device token) except `POST /branch/logout`, and passes other account types through.
- `EnsureBarberAccountAccess` (default `active` scope) also rejects a barber whose `managed_by_branch_id` branch is `Disabled`.
- Tests: `tests/Feature/Auth/BranchGatingTest.php`.

## Social login email verification (Gap G9)

- `SocialLoginHandler` requires the provider's verified-email flag (`email_verified` / `verified_email`, bool or string) before linking an existing client by email or creating a new one. Failure returns 403 `SOCIAL_EMAIL_NOT_VERIFIED` (`core::messages.social_email_not_verified`, EN+AR). Providers already linked by id are unaffected.
- Tests: `tests/Feature/Client/Http/Actions/SocialLoginActionTest.php`.

## Brand approval (Gap G2)

- `brands.status` (`Modules\Brand\Enums\BrandStatusEnum`: `pending`, `active`; migration backfills existing rows to `active`). Brands created via `POST /brands` or `POST /dashboard/brands` start `pending`; factories, the seeder and brands created in the Filament admin panel are `active`.
- `POST /admin/brands/{brand}/approve` (`auth:admin_api`) and `PATCH /dashboard/admin/brands/{brand}/approve` (admin actor) set `active` (idempotent); Filament table has an Approve action and status badge.
- Gate: public `GET /brands` and `/brands/{id}` list active brands only; `BranchModel::isOperational()` (enabled branch + active brand) backs branch login, refresh, `EnsureBranchAccountAccess` and `scopeDiscoverable`.
- API resource `status` field; dashboard Brands page shows the status badge and an Approve button for admins; mobile `BrandDto.status`.
- Tests: `tests/Feature/Brand/BrandApprovalTest.php`.

## Role-based earnings, plan and payout visibility (Gap G4)

Read-only dashboard endpoints (outside the admin group), scoped by `DashboardActor`:

- `GET /dashboard/earnings?from=&to=` (owner, branch manager, stylist; admin 403): completed bookings grouped per currency. Owner = all owned brands, manager = own branch → `gross_minor`, `commission_minor` (platform commission from `commission_entries`), `net_minor`, `completed_bookings_count`. Stylist = own `barber_id` bookings → `gross_minor` and `net_minor`, which is gross less the affiliation `commission_percent` and is `null` unless every booking in that currency falls under an active branch/brand affiliation with a percent.
- `GET /dashboard/subscription` (owner only): latest subscription of each owned brand with plan price, interval, feature keys, effective Pennant flags and `grace_ends_at`.
- `GET /dashboard/payouts` (owner only): own brands' non-draft payouts, paginated, `?status=`; no admin notes.

Authorization via `DashboardEarningsAuthorizationMiddleware` / `DashboardOwnerAuthorizationMiddleware`; brand and branch scope comes from the actor, never from the request. Dashboard pages: `/owner|manager|barber/earnings`, `/owner/subscription`, `/owner/payouts`. Mobile screens are deferred to G10/G11.

## Owner override of barber price and duration (Gap G6)

- `barber_service_overrides` (`offered_service_id`, `brand_id`, nullable `price_amount_minor`, nullable `duration_minutes`; unique per service and brand): a brand's own terms for a barber-owned service. A null column, or no row, falls back to the barber's default on `offered_services`. Overrides never cross brands.
- `PUT /dashboard/barbers/{barber}/services/{service}/override` (`brand_id`, `price_amount_minor`, `duration_minutes`; at least one of price or duration), `DELETE` the same path with `?brand_id=`, and `GET /dashboard/barbers/{barber}/services?brand_id=` (each service with `is_overridden` and `default_*` fields). Platform admins and brand owners only (`DashboardBrandAuthorizationMiddleware`); `BarberServiceOverridePolicy` (via `Gate::forUser($actor)`, `DashboardActor` implements `Authorizable`) additionally requires the owner to own `brand_id` and the barber to work for it (`BarberBranchMembership::belongsToBrand`: managed by one of its branches or an Active affiliation). Foreign owners, branch managers and barbers get 403; a service the barber does not own is 404.
- `EffectiveServiceTerms` resolves override-then-default for booking duration (`CreateBookingEloquentResolver`, `ListSlotsEloquentResolver`), `ServiceResource` (booking payloads, branch detail, floor plan, and `GET /barbers/{barber}/services?branch_id=`, which adds `is_overridden`, `default_price_amount_minor`, `default_duration_minutes`), `CommissionRecorder`, and the owner/stylist earnings, overview and branch dashboard revenue (`BookingServicePricing`). Without a branch context the public barber list still shows the barber's own values; explore price filters and sorting keep using the default.
- Dashboard: `/owner|admin/stylists/{id}/pricing`.

- Form Request validation bounds (Gap G17): `Modules\Core\Constants\ValidationLimitConstants` holds the shared limits and ready-made `RULE_*` strings (name 100, title 150, description 2000, short text/password 255, id 36, token 2048, lists 50, chair layout, radius, price). Password fields get a maximum only. Locale maps use `array:en,ar`. Regression tests: `tests/Feature/Core/FormRequestBoundsTest.php`.
