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
- **Decision required:** retention period for delivery rows.

### Dashboard (BFF / React)
- Add `GET /api/notifications` and the read endpoints to the dashboard proxy allowlist (Task 11 rules).
- Add a header bell component with an unread count. Query key `["notifications"]`, invalidated on the read mutations and on realtime booking events.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/endpoints/` — add `notification.endpoints.dart`, a `NotificationDto`, and a `notification.repository.dart`.
- client_app — inbox screen registered in `app.router.dart`. stylist_app and business_app can reuse it after their shells exist (Tasks 82 and 84).

## Acceptance Criteria
- [ ] A booking transition creates exactly one `notifications` row for the recipient, plus one `notification_deliveries` row per registered device token.
- [ ] An FCM failure records `status = failed` with the error, and the booking transition still succeeds.
- [ ] `GET /api/v1/notifications` returns only the caller's notifications. Reading another actor's ID returns 404.
- [ ] `PATCH /api/v1/notifications/{id}/read` sets `read_at`. A second call is idempotent (200).
- [ ] Feature tests `NotificationInboxTest` and `NotificationDeliveryRecordTest` exist and pass.
- [ ] Dashboard: the bell count decrements after mark-read (component test).
- [ ] `php artisan test`, `npm run test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Transport migration (Task 16).
- Which events notify (Tasks 28 and 31).
