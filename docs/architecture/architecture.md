---
codeanchors:
  - backend/modules/Booking/
  - frontend/web/dashboard/src/
  - frontend/mobile/apps/
---

# Dorak MVP Architecture

Routes: [documentation graph](../index.md) · [deployment guide](../deployment/deployment-guide.md).

## E2E booking flow

```text
Client app -> Laravel API -> transactional booking engine
                         -> barber/branch queue notification
                         -> FCM -> Stylist and Business apps

Stylist app -> barber lifecycle API -> state machine -> FCM -> Client tracker
Next.js dashboard (server side) -> dashboard API -> branch operations
```

Clients create a `pending` booking with a service-derived end time. The backend
locks the selected chair and barber in one transaction and rejects interval
collisions. A barber accepts, starts, completes, cancels, or marks a booking
no-show through the strict booking state machine. The client refreshes its live
tracker from the booking API and receives state-change push payloads.

## Authorization

Mobile bearer APIs use Laravel Sanctum guards: `client`, `barber`, `branch_api`, and `admin_api`. The browser never
calls Laravel: the Next.js dashboard server calls it with the dashboard token and session claim
([ADR 0003](../adr/0003-new-dashboard-foundation.md)). Platform routes are reserved for administrators; manager routes
use branch-manager scope. Server-side authorization remains the source of truth for every mutation.

## Push notifications

Authenticated devices register an FCM token (with app language and version) at
`POST /api/v1/user/device-token` and revoke it at `DELETE` on the same path; a
logout revokes the devices of that sign-in. Queue workers send through the FCM
HTTP v1 API with the service account in `FCM_CREDENTIALS` and the project in
`FCM_PROJECT_ID`; when either is absent, delivery is skipped with one logged
reason and the inbox row is still written, so a booking request never fails.
Contract, configuration and setup:
[push notifications](push-notifications.md).

## Production prerequisites

- Configure a Firebase project for each mobile target. `google-services.json` and `GoogleService-Info.plist` are
  git-ignored and never committed.
- Set the backend push values and run a queue worker ([push notifications](push-notifications.md)).
- Configure the dashboard ([Vercel setup](../deployment/vercel-dashboard.md)) and the backend
  ([deployment guide](../deployment/deployment-guide.md)).
- Run database migrations before deploying API workers or mobile clients that register device tokens.
