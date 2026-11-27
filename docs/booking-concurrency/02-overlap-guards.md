---
nodeid: docs.booking-concurrency.overlap-guards
parentnode: docs.booking-concurrency
childnodes: []
codeanchors:
  - backend/modules/Booking/Database/Migrations/
  - backend/modules/Booking/Queries/
---

# 2. Overlap guards

Routes: [booking concurrency](index.md) · [documentation graph](../index.md)

## What the database enforces

`bookings` (`Booking/Database/Migrations/0001_01_01_200060_create_bookings_table.php`): uuid primary key, foreign keys `client_id` (cascade), `chair_id`, `branch_id`, `barber_id` (null on delete). The only indexes besides those are non-unique: `(chair_id, starts_at, ends_at, booking_status)`, the same for `barber_id`, and `(branch_id, starts_at)`. There is no unique index, generated column or slot table, and no later migration alters `bookings`. `booking_offered_service` has a composite primary key `(booking_id, offered_service_id)`, which only stops a duplicate service on one booking.

## What only application code enforces

| Rule | Mechanism | Where |
|---|---|---|
| One booking per chair and slot | chair row lock plus `lockForUpdate()->exists()` range scan | `CreateBookingEloquentResolver.php:100,177,265` |
| One booking per barber and slot | barber row lock plus the same scan | `:182,196` |
| One booking per client and slot | **nothing**; the client row lock serializes a client's own concurrent creates, but no query compares the client's existing bookings | `:46` |
| No chair or barber chosen | no overlap check runs at all | `:67,75` |
| Business hours, barber schedule, bookable chair, ban, discoverability | application checks | BG-9 in the backlog notes this |

The slot guard is correct only while every writer follows the same lock order and holds the lock until commit. That is why [lock order](01-lock-order-and-deadlocks.md) matters: a path that skips it is a path with no protection.

## Same client, different barbers (BD-10)

A client can create two bookings that overlap in time with two different barbers. Nothing in create, walk-in or reschedule looks at `client_id` in an overlap query. The owner decided on 2026-11-26 that one client may not hold overlapping bookings (backlog BD-10). The check isn't built yet; it belongs next to the client lock.

Proposed shape:

- Inside the existing client lock, scan the client's active bookings with the shared overlap predicate (`BookingAvailability::apply`) and `lockForUpdate()->exists()`, in create, walk-in and reschedule.
- A new `ClientDoubleBookingException` extending `ConflictApiException` (409) with its own stable code (for example `client_overlap`) so the dashboard and apps can show a different message from "that slot is taken".
- An index `(client_id, starts_at, ends_at, booking_status)`, added by editing the original `create_bookings_table` migration (the project is pre-release; `backend/AGENTS.md` forbids `alter_*` fragments).
- Walk-in bookings create or find a client by email (`firstOrCreate`), so the check must run after that client is resolved.

## A real database backstop

MySQL 8 has no exclusion constraint (PostgreSQL's `EXCLUDE USING gist` has no equivalent). Options:

| Option | What it gives | Cost |
|---|---|---|
| Keep locks as the primary guard and add an audit command (`bookings:audit-overlaps`) plus a Pest test that fails on any overlapping active rows per chair, barber and client | Detects a missed path or a manual data edit | Detects, does not prevent |
| Slot-claims table with a unique key per `(resource, slot_start)` at a fixed granularity, written in the same transaction | Prevents a double booking even if a lock is skipped | Heavy: a granularity decision, extra writes per booking, backfill, and reschedule must move the claims |
| Generated "active slot key" column with a unique index | Cheaper than a table | Cannot express a range overlap, only equal starts, so it catches only identical slots |

Recommended default: the first option now, the second only if the audit command ever finds a real violation or the lock discipline proves hard to keep.
