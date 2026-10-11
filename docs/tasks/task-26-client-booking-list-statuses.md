# Task 26: Fix Client Booking List Status Buckets

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 18 · **Audit source:** Feature-spec audit (BE-04 / REMEDIATION Ph4: client booking list filters vs new lifecycle)

## Overview & Root Cause
The client booking list was written before the `pending`, `in_progress` and `no_show` statuses existed:
- **Upcoming** returns only `confirmed`.
- **Past** returns only `completed`, plus `confirmed` or `canceled` bookings whose time has passed.

So every newly created booking (`pending` is the default) is invisible in both tabs. Live (`in_progress`) and `no_show` bookings never appear either. The client app mirrors the same assumptions.

## Evidence
- `backend/modules/Booking/Eloquent/Resolvers/Client/ListUserBookingsEloquentResolver.php:27-35` — Upcoming is `whereIn('status', ['confirmed'])`. Past is `completed`, or `confirmed`/`canceled` before now.
- `backend/modules/Booking/Enums/BookingFilterStatus.php` — only `Upcoming` and `Past`.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:69` — new bookings are `Pending`.
- `frontend/mobile/apps/client_app/lib/src/features/booking/bookings.screen.dart:208-264` — cancellation and labels assume `confirmed`. `_statusLabel` has no case for `pending`, `in_progress` or `no_show` beyond the fallback.

## Full-Stack Scope
### Backend (API / DB / Policies)
- **Upcoming:** status in `pending`, `confirmed` or `in_progress`, and `ends_at >= now` (or `in_progress` regardless of time).
- **Past:** status in `completed`, `canceled` or `no_show`, or (`pending`/`confirmed` with `ends_at < now`).
- Use `BookingStatus` enum values, not string literals.
- Sort Upcoming ascending by `time_slot` and Past descending.

### Dashboard (BFF / React)
- None. The dashboard uses `dashboard/bookings` with its own filters (Task 71).

### Mobile (Flutter / Repositories)
- `frontend/mobile/apps/client_app/lib/src/features/booking/bookings.screen.dart`:
  - `_statusLabel` gets localized labels for `pending`, `in_progress` and `no_show`.
  - The cancel action is allowed for `pending` and `confirmed`, outside the 2-hour window.
  - Rateable stays `completed`.
- `frontend/mobile/packages/localization` — add the new status strings (en and ar).

## Acceptance Criteria
- [ ] After `POST /api/v1/bookings` (status `pending`), `GET /api/v1/bookings?filter=upcoming` contains the new booking.
- [ ] An `in_progress` booking is in Upcoming. A `no_show` booking is in Past.
- [ ] A `pending` booking whose `ends_at` has passed is in Past and not in Upcoming.
- [ ] No status value appears in both lists, and every status appears in exactly one (covered by the Feature test `ListUserBookingsFilterTest` with one booking per status).
- [ ] client_app widget test: a `pending` booking shows the localized "Pending" label and a Cancel action.
- [ ] `php artisan test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Realtime updates of the list (Task 29).
- Deep-link crash on booking details (Task 78).
