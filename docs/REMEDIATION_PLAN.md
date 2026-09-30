# MVP Alignment Remediation Plan

## Phase 2: In-person payment policy

Bookings are reservations paid in person at the salon. The persisted booking
contract records `payment_method=pay_at_salon` and
`payment_status=unpaid_in_person`. The create-booking API does not accept
payment intents, gateway tokens, or caller-selected payment methods.

The client booking flow presents one non-interactive confirmation: payment is
due at the salon. Online-payment choices and checkout copy are removed.

## Phase 3: mutation authorization

Public chair, floor-plan, and service-catalog reads remain available. Mutation
routes authenticate against the branch API guard, the Sanctum-backed admin API
guard, or the client guard. Model policies then grant chair/catalog mutation
only to branch or admin actors. A client bearer token is therefore
authenticated and receives `403 Forbidden`, rather than being able to mutate
the resource.

The service catalog remains a shared catalog. Until per-branch service-offering
write endpoints exist, branch actors are permitted to manage catalog records
under the explicit MVP manager policy. A later multi-tenant catalog design must
add ownership before using this as a platform-wide shared catalog.

## Test environment

The PHPUnit configuration uses SQLite in-memory storage so the backend suite
does not depend on a local MySQL `dorak_test` database.

## Phase 4: Availability and booking lifecycle

`GET /branches/{branch}/floor-plan` requires `date` (`Y-m-d`), `time_slot`
(`HH:mm`), and `duration` (minutes). Chair availability is calculated for the
requested half-open interval: a chair is occupied only when a `confirmed` or
`in_progress` booking overlaps it (`booking.start < requested.end` and
`booking.end > requested.start`).

New bookings begin as `pending`. The only permitted lifecycle is `pending` to
`confirmed` or `canceled`, `confirmed` to `in_progress` or `canceled`, and
`in_progress` to `completed`, `canceled`, or `no_show`. Terminal bookings
cannot be changed. Creation and confirmation lock the chair/barber and the
overlapping reservation rows in one database transaction. Pending reservations
also block duplicate creation; only confirmed/in-progress reservations occupy
the client-visible floor plan.

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
