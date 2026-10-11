# Task 16: Migrate Push Delivery to FCM HTTP v1

**Phase:** 2 — Data Integrity & Broken Pipelines · **Priority:** P0 · **Depends on:** None · **Audit source:** Feature audit, REMEDIATION Ph6 (FCM delivery); verified in code by the parent session

## Overview & Root Cause
`FcmNotificationSender` posts to the legacy `https://fcm.googleapis.com/fcm/send` endpoint with a server key. Google shut down the legacy FCM HTTP API, so push delivery very likely fails in production. Three further problems:
- `->throw()` on every token turns a single bad token into a failed job.
- Invalid or unregistered tokens are never pruned.
- An empty server key silently disables push, with no log entry.

## Evidence
- `backend/modules/Core/Services/FcmNotificationSender.php:14-18`: reads `services.fcm.server_key` and returns silently if it is empty.
- `backend/modules/Core/Services/FcmNotificationSender.php:24-28`: `Http::withToken($serverKey)->post('https://fcm.googleapis.com/fcm/send', ...)->throw()`.
- `backend/modules/Core/Config/services.php:23`: `'fcm' => ['server_key' => env('FCM_SERVER_KEY')]`.
- `backend/modules/Booking/Jobs/SendBookingStatusNotificationJob.php`: the only consumer.
- `backend/modules/Core/Models/DeviceTokenModel.php` and `backend/modules/Core/Http/Actions/Shared/RegisterDeviceTokenAction.php`: token storage and registration.
- `frontend/mobile/packages/core/lib/src/notifications/push_notification.client.dart`: mobile token registration.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Switch to `POST https://fcm.googleapis.com/v1/projects/{project_id}/messages:send`, using an OAuth2 access token from a service-account JSON. Cache the token until expiry.
- Config: replace `FCM_SERVER_KEY` with `FCM_PROJECT_ID` and `FCM_CREDENTIALS` (a path or JSON). Update `backend/.env.example`.
- Send to each token independently. Catch per-token errors instead of throwing.
- On `UNREGISTERED` or `INVALID_ARGUMENT` (token-related) responses, delete that `DeviceTokenModel` row.
- Missing credentials: log a warning once per job, and do not throw.
- Retry 5xx and 429 responses with backoff; do not retry 4xx.

### Dashboard (BFF / React)
- None.

### Mobile (Flutter / Repositories)
- None for the contract. `push_notification.client.dart` must re-register its token on refresh (verify that the `onTokenRefresh` handler calls `POST /user/device-token`).

## Acceptance Criteria
- [ ] With `Http::fake()`, sending to 2 tokens issues 2 requests to `.../v1/projects/{id}/messages:send` with a `Bearer` OAuth token. No request goes to `/fcm/send`.
- [ ] A faked `404 UNREGISTERED` response for one token deletes that token row. The other token is still sent, and the job completes without an exception.
- [ ] Missing credentials: the job completes, nothing is sent, and a warning is logged.
- [ ] A faked 503 is retried (the job is released or retried; covered by the test).
- [ ] Unit test `tests/Unit/Core/Services/FcmNotificationSenderTest.php` covers each case above.
- [ ] `php artisan test` passes; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Sending notifications on all booking transitions: Task 28.
- Delivery records: Task 30.
