# Task 22: Validate Bookings Against Branch Hours and Barber Schedule

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 20, Task 21 (branch-hours part is blocked by Task 51) · **Audit source:** Product-spec audit (Booking: "Booking must fall inside branch hours or barber schedule"); `02_prd.md:53` (branch opening/closing hours), `04_house-rules.md:84` (H2 staff schedules), `03_persona-journeys.md:54`

## Overview & Root Cause
Barbers maintain a weekly schedule (`barber_schedules`, exposed at `GET/PATCH /barber/schedule`), but booking creation never reads it. A client can book a barber at 03:00 on their day off. Branches have no opening-hours columns at all (Task 51), so branch hours cannot be enforced yet.

## Evidence
- `backend/modules/Barber/Database/Migrations/0001_01_01_100102_create_barber_schedules_table.php` — `day_of_week`, `start_time`, `end_time`, `is_active`.
- `backend/modules/Barber/Repositories/GetScheduleEloquentResolver.php` — the only reader of `BarberScheduleModel`, outside the factory.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:47-62` — checks the chair (maintenance, overlap) and the barber (overlap) only. No schedule check.
- `backend/modules/Branch/Database/Migrations/` — no opening-hours column (see Task 51).

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add a `BookingWindowValidator` to the Booking module. It rejects a booking interval `[time_slot, ends_at)` that is not fully inside an active `barber_schedules` row for that barber's weekday.
  - **Decision required:** timezone for schedule times. The barber's or branch's local timezone needs a stored timezone; until then, UTC.
- Apply it in client create (`CreateBookingEloquentResolver`), rebook (inherited via Task 19), dashboard reschedule and walk-in, and the Task 21 slot generator.
- **Decision required:** behavior when a barber has no schedule rows. Either treat as always available (backward compatible) or never bookable.
- Branch hours: once Task 51 adds hours, extend the validator to chair bookings. Until then, record this as a pending sub-criterion.
- Error: 422 with code `booking_outside_schedule`.

### Dashboard (BFF / React)
- `frontend/dashboard/src/components/bookings/walk-in-booking-form.tsx` and `booking-actions-dialog.tsx` (reschedule) — show the `booking_outside_schedule` error message.

### Mobile (Flutter / Repositories)
- No new calls. The client app uses Task 21 slots, which already exclude out-of-schedule times. Map the 422 code to a localized message in `frontend/mobile/apps/client_app/lib/src/features/booking/branch_detail.bloc.dart`.

## Acceptance Criteria
- [ ] `POST /api/v1/bookings` with a barber whose schedule for that weekday is 09:00–17:00 and a slot at 18:00 returns 422 `booking_outside_schedule`.
- [ ] The same request at 10:00 returns 201.
- [ ] Dashboard reschedule and walk-in outside the schedule return 422.
- [ ] The Task 21 slot endpoints return no slots outside the barber's schedule (assertion added to `BranchSlotsTest` and `BarberSlotsTest`).
- [ ] The no-schedule decision is recorded here and asserted in the Feature test `BookingScheduleValidationTest`.
- [ ] The branch-hours sub-criterion stays open, tracked against Task 51.
- [ ] `php artisan test` passes. PHPStan max and Pint are clean.

## Out of Scope
- Storing branch hours and "today's hours" (Task 51).
- Barber schedule UI (Task 69 dashboard, Task 83 stylist app).
