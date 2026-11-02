---
nodeid: docs.remediation
parentnode: docs.graph
childnodes:
  - docs.remediation.part-2
codeanchors:
  - backend/modules/Booking/
---

# MVP Alignment Policies

> Permanent reference for the in-person payment, authorization, availability, and lifecycle policies decided during MVP remediation. All remediation tasks are complete; use the [documentation graph](index.md) to find current subsystem docs.

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

`GET /branches/{branch}/floor-plan` requires `date` (`Y-m-d`), `starts_at`
(`HH:mm`), and `duration` (minutes). Chair availability is calculated for the
requested half-open interval: a chair is occupied only when a `confirmed` or
`in_progress` booking overlaps it (`booking.start < requested.end` and
`booking.end > requested.start`).

New bookings begin as `pending`. The only permitted lifecycle is `pending` to
`confirmed` or `cancelled`, `confirmed` to `in_progress` or `cancelled`, and
`in_progress` to `completed`, `cancelled`, or `no_show`. Terminal bookings
cannot be changed. Creation and confirmation lock the chair/barber and the
overlapping reservation rows in one database transaction. Pending reservations
also block duplicate creation; only confirmed/in-progress reservations occupy
the client-visible floor plan.

## Continued in

- [Part 2: Phase 5: Stylist lifecycle API](remediation-plan-part-2.md)
