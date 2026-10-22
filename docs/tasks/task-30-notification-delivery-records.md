# Task 30: Persist Notification Delivery Records

**Phase:** Notifications & Realtime · **Priority:** P2 · **Depends on:** Task 16, Task 28 · **Audit source:** Feature-spec audit (mvp-gap: notification delivery records Missing); `06_entity-model-abstract.md:210` (Notification entity: type invite / application / booking update)

## Overview & Root Cause
The entity model defines a Notification record with a type (invite, application, booking update, and so on). The backend sends FCM pushes fire-and-forget and stores nothing. That means:
- no in-app notification inbox;
- no read or unread state;
- no audit of whether a push was attempted or failed;
- no way to retry.

## Evidence
- `backend/modules/Core/Services/FcmNotificationSender.php` — posts to FCM and persists nothing.
- `backend/modules/Booking/Jobs/SendBookingStatusNotificationJob.php` — the only caller.
- `backend/modules/Core/Database/Migrations/2026_09_30_000010_create_device_tokens_table.php` — device tokens are the only notification-related table. A grep for a `notifications` or `notification_deliveries` table in `backend/modules` found none.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Migration: `notifications` table. Columns: uuid, polymorphic `notifiable`, `type` (enum: `booking_update`, `invite`, `application`, `review_request`), `title`, `body`, `data` (JSON), `read_at`, timestamps. Add a `notification_deliveries` child table: device token ID, `status` (sent/failed), provider message ID, error, `attempted_at`.
- `FcmNotificationSender` (after Task 16) writes one notification row and one delivery row per token.
- Endpoints for each authenticated actor (client, barber, branch_api):
  - `GET /api/v1/notifications` (paginated, unread first);
  - `PATCH /api/v1/notifications/{id}/read`;
  - `POST /api/v1/notifications/read-all`.
- Scope every query to the authenticated notifiable. Access to another actor's notification returns 404.
- **Decision (retention, resolved): delivery rows are pruned after 90 days; inbox rows are kept.** Delivery rows are an audit trail for push attempts, which loses value quickly, while the inbox is user-facing history. `MassPrunable` + a daily `model:prune` keeps it in the framework's own mechanism. Inbox retention is a follow-up.
  - **Decision (admins, resolved): endpoints stay `client,barber,branch_api`; the dashboard bell is hidden for admin sessions.**
  - **Decision (bell test tooling, resolved): add Testing Library + jsdom dev dependencies** so the bell acceptance criterion is a real component test.

### Dashboard (BFF / React)
- Add `GET /api/notifications` and the read endpoints to the dashboard proxy allowlist (Task 11 rules).
- Add a header bell component with an unread count. Query key `["notifications"]`, invalidated on the read mutations and on realtime booking events.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/endpoints/` — add `notification.endpoints.dart`, a `NotificationDto`, and a `notification.repository.dart`.
- client_app — inbox screen registered in `app.router.dart`. stylist_app and business_app can reuse it after their shells exist (Tasks 82 and 84).

### Implemented contract
- Shared code path: `FcmNotificationSender::sendTo()` → `NotificationWriter::record()` / `recordDelivery()`, used by every `SendBookingStatusNotificationJob` branch (created, client-acted, rescheduled, status). Task 31 jobs reuse the same writer.
- Scope: one `notifications` row per recipient per dispatch (`type = booking_update` for booking jobs); one `notification_deliveries` row per device attempt. The job carries a `dispatchKey` generated at dispatch, stored as `dedupe_key = {dispatchKey}:{alias}:{id}`, so queue retries (`#[Tries(4)]`) reuse the row and skip devices that already have a `sent` delivery. The inbox row is written even when FCM is unconfigured or the recipient has no device.
- Delivery outcomes: success → `sent` + `provider_message_id` (FCM `name`); any non-2xx → `failed` + `error` (`HTTP {status} {error.status}: {error.message}`); invalid/unregistered token → `failed`, then the token row is deleted and `device_token_id` becomes null (`nullOnDelete`); 429/5xx → `failed`, then rethrown so the queue retries. The booking transition commits before the job runs (`afterCommit`), so push failures never roll it back.
- Morph types: rows use the enforced morph aliases (`client`, `barber`, `branch`); `device_tokens.user_type` still stores class names, so the sender matches both forms.
- `GET /api/v1/notifications` (`auth:client,barber,branch_api` + `EnsureClientAccountAccess`): `per_page` 1–100 (default 20); order unread first, then `created_at desc` (portable `CASE` so MySQL and PostgreSQL agree); `meta.pagination` + `meta.unread_count` (`ApiResponseTrait::paginated()` gained an optional `$meta`).
- `PATCH /api/v1/notifications/{notification}/read` (UUID-constrained): 200 with the notification; `read_at` is set once and unchanged by repeat calls; another actor's or an unknown ID → 404 `RESOURCE_NOT_FOUND`.
- `POST /api/v1/notifications/read-all`: 200 `data {updated, unread_count: 0}`, caller's rows only.
- Retention: `NotificationDeliveryModel` `MassPrunable` (90 days), `model:prune` scheduled daily at 03:00 in `ApplicationServiceProvider`.
- Dashboard: BFF `src/app/api/notifications/[[...path]]/route.ts` with its own method+path allowlist (`GET ""`, `POST read-all`, `PATCH <uuid>/read`) forwarding to `/api/v1/notifications`, folding `meta` into `data {items, unreadCount, total}`; `NotificationBell` in `portal-header.tsx` (hidden for admins), query `["notifications"]` (60 s poll as a safety net because the row is written by a queued job after the broadcast), mark-read/mark-all mutations invalidate it; `use-branch-channel.ts` and `use-barber-channel.ts` invalidate it on booking events; en + ar copy.
- Mobile: core `NotificationEndpoints`, `NotificationDto`, `NotificationRepository`; client_app `NotificationsBloc` + `NotificationsScreen` at `/profile/notifications` (Profile button), ARB keys en + ar.
- Docs: this spec, `docs/decisions-required.md`, `docs/todowork.md`, `backend/docs/feature-index.md`, `frontend/mobile/docs/feature-index.md`, `frontend/mobile/apps/client_app/docs/feature-index.md`, mobile `AGENTS.md` files, Task 31 evidence note.
- Deviations from the original spec text: Task 31's claim that `ToggleActivationAction` calls the sender is stale (the booking job is the only caller). Stored `title`/`body` are rendered in the dispatcher's locale (pre-existing job behaviour); per-recipient localisation is a follow-up. Push-tap routing to the inbox is Task 78; stylist/business inboxes are Tasks 82/84.

## Acceptance Criteria
- [x] A booking transition creates exactly one `notifications` row for the recipient, plus one `notification_deliveries` row per registered device token.
- [x] An FCM failure records `status = failed` with the error, and the booking transition still succeeds.
- [x] `GET /api/v1/notifications` returns only the caller's notifications. Reading another actor's ID returns 404.
- [x] `PATCH /api/v1/notifications/{id}/read` sets `read_at`. A second call is idempotent (200).
- [x] Feature tests `NotificationInboxTest` and `NotificationDeliveryRecordTest` exist and pass.
- [x] Dashboard: the bell count decrements after mark-read (component test).
- [x] `php artisan test`, `npm run test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Transport migration (Task 16).
- Which events notify (Tasks 28 and 31).
