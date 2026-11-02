---
nodeid: docs.remediation.part-2
parentnode: docs.remediation
childnodes: []
codeanchors:
  - backend/modules/Booking/
---

Part 2 of 2 · [MVP Alignment Policies](remediation-plan.md) · [Previous](remediation-plan.md)

## Phase 5: Stylist lifecycle API

Authenticated barber endpoints are `PATCH /barber/bookings/{id}/accept`,
`/start`, `/complete`, and `/no-show`. A barber may operate only on a booking
directly assigned to them or on a booking assigned to their chair. The stylist
app sends its isolated `dorak_barber_token` bearer token and updates its live
appointment list from each endpoint response.

## Phase 6: Push notification workflow

The API accepts authenticated FCM token registration at `POST /api/v1/user/device-token`.
Tokens are rotated by their unique value and associated with the authenticated actor type.
Booking creation queues alerts for the assigned barber and branch; barber lifecycle changes
queue a client alert. `FCM_SERVER_KEY` is required by the queue worker in each deployed
environment and Firebase native configuration files remain deployment secrets.

## Phase 7: Dashboard scaffold

`frontend/dashboard` contains a Next.js App Router scaffold with separate authentication,
platform-admin, and branch-manager route groups. Its API client uses credentialed requests
for the existing Sanctum/session contract and TanStack Query is provided at the app root.

## Final verification gate

The workspace root tracks unified documentation and the dashboard scaffold;
`backend` and `frontend/mobile` retain their own committed Git histories. The
release gate is a full Laravel test run, mobile analysis/tests, and a production
dashboard build after installing its npm dependencies.
