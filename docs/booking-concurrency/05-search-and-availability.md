---
nodeid: docs.booking-concurrency.search-and-availability
parentnode: docs.booking-concurrency
childnodes: []
codeanchors:
  - backend/modules/Booking/Eloquent/Resolvers/Shared/ListSlotsEloquentResolver.php
  - backend/modules/Booking/Queries/
  - backend/modules/Branch/Services/BranchHours.php
  - backend/modules/Booking/Routes/Api/V1/slots.php
---

# 5. Search and availability

Routes: [booking concurrency](index.md) · [documentation graph](../index.md) · [lock order](01-lock-order-and-deadlocks.md) · [remediation plan](08-remediation-plan.md)

How the slot endpoints (`GET /branches/{branch}/slots`, `GET /barbers/{barber}/slots`) compute availability, what that costs, and what protects it. Slots are advisory: a slot the API returns can be taken before the client submits, and the create path (file 01) is what decides. Evidence grades are in the [index](index.md#how-to-read-the-evidence).

## How a slot list is built (Confirmed)

`ListSlotsEloquentResolver::resolve` (`Booking/Eloquent/Resolvers/Shared/ListSlotsEloquentResolver.php`) validates the services, the chair and the barber once, then walks the whole UTC day in steps of `booking.slots.step_minutes` (default 15, so 96 candidates) and calls `isFree` plus `BranchHours::covers` for each candidate. The cheap tests run first (end of day, minimum lead time) and short-circuit the expensive ones. For every remaining candidate:

| Check | Queries per candidate | Where |
|---|---|---|
| Chair overlap (`exists` on `bookings`) | 1 | `overlaps()` |
| Barber overlap | 1 | `overlaps()` |
| Barber schedule | 1 or 2 (`hasSchedule`, then the covering row) | `Booking/Queries/BarberScheduleAvailability.php` |
| Branch hours | up to 4 (`opening hours exists`, `override exists`, `forDate` override, `forDate` weekly) | `Branch/Services/BranchHours.php` `covers`, `forDate` |

Nothing is loaded once and reused: no bulk read of the day's bookings, no memoized hours, and no cache in the Booking module (`Cache::` and `remember` do not appear under `modules/Booking`).

## Measured cost (19 November 2026)

A throwaway Pest test counted queries with `DB::enableQueryLog()` against a fresh branch, one chair, no bookings, no opening hours and no barber schedule (so the cheapest shape), for tomorrow:

| Request | Slots returned | Queries |
|---|---|---|
| `chair_id` only | 95 | **296** |
| `chair_id` and `barber_id` | 95 | **488** |

The audit's earlier figure ("about 200") was low. A branch with opening hours and a barber with a schedule adds the 3 to 4 hours queries and the schedule queries per candidate, so a real request is above these numbers; that case was not measured. The test was deleted after measuring; the bar to keep is the one in the plan below.

The slots routes are throttled at 60 per minute per IP (`BOOKING_SLOTS_LIMITER`, BG-10). One IP can therefore cost the database roughly 18,000 to 29,000 queries per minute on a tiny branch, and clients behind one shared address (a salon's Wi-Fi) share that budget. The throttle protects the database from a flood, not from ordinary use.

## What is not protected

- **No cache and no invalidation.** Every call recomputes. This is fine for correctness: nothing is stale. It means cost grows with every client who opens the booking screen and changes the date or a service.
- **Advisory result.** The list is read without locks. Between listing and submitting, another client can take the slot; the create answers 409 and the app shows a generic conflict message, without reloading the list ([file 06](06-client-sync-and-ux.md)).
- **UTC day.** `date` is parsed as a UTC day and `starts_at` is compared with branch hours through `$startsAt->format('H:i')`. Whether that matches a branch's local opening hours is **Unverified**: the branch time-zone handling was not read. Check `BranchHours` and the stored hour columns before changing anything here.

## Options

| Option | Effect | Risk |
|---|---|---|
| Load the day once: the chair's and barber's active bookings for the day (one query each), the barber's schedule rows, and the branch hours for that date, then compute every candidate in memory | From about 300 to 500 queries to about 6 to 10, no cache needed | Must reuse the exact overlap predicate (`BookingAvailability`), or the list and the create disagree. Keep one definition and test list-versus-create agreement |
| Memoize `BranchHours::forDate` for the request | Removes the hours queries only | Small, safe, but leaves the overlap and schedule queries |
| Cache the free-slot list for a few seconds per (resource, date, services) | Cuts load under repeated reads | Needs invalidation on every booking write, or a client is offered taken slots longer. Not worth it before the first option |
| Raise or per-user the slot throttle | Fits shared Wi-Fi | Treats a symptom; do it with BG-16, not before |

Recommended: the first option, behind a query-count assertion in the existing `BranchSlotsTest` and `BarberSlotsTest` (assert an upper bound, so a regression fails), and a test that every slot the list returns can be booked and every slot it omits is refused. Item: backlog BG-19.
