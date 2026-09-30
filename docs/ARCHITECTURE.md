# Dorak MVP Architecture

## E2E booking flow

```text
Client app -> Laravel API -> transactional booking engine
                         -> barber/branch queue notification
                         -> FCM -> Stylist and Business apps

Stylist app -> barber lifecycle API -> state machine -> FCM -> Client tracker
Branch dashboard / Next.js dashboard -> Sanctum session API -> branch operations
```

Clients create a `pending` booking with a service-derived end time. The backend
locks the selected chair and barber in one transaction and rejects interval
collisions. A barber accepts, starts, completes, cancels, or marks a booking
no-show through the strict booking state machine. The client refreshes its live
tracker from the booking API and receives state-change push payloads.

## Authorization

Mobile bearer APIs use Laravel Sanctum guards: `client`, `barber`, `branch_api`,
and `admin_api`. The dashboard uses credentialed browser requests to Laravel's
Sanctum/session contract. Platform routes are reserved for administrators;
manager routes use branch-manager scope. Server-side authorization remains the
source of truth for every mutation.

## Push notifications

Authenticated devices register or rotate an FCM token at
`POST /api/v1/user/device-token`. The API queues booking notifications after
creation and barber lifecycle changes. Queue workers use `FCM_SERVER_KEY`; if it
is absent, delivery is deliberately disabled without failing a booking request.

## Production prerequisites

- Configure a Firebase project for each mobile target.
- Store `google-services.json` and `GoogleService-Info.plist` in the CI/CD
  secret store and inject them during native builds; never commit them.
- Store `FCM_SERVER_KEY` as a backend deployment secret and run a queue worker.
- Configure dashboard `NEXT_PUBLIC_API_URL`, HTTPS, Sanctum stateful domains,
  CORS origins, and secure session-cookie settings.
- Run database migrations before deploying API workers or mobile clients that
  register device tokens.
