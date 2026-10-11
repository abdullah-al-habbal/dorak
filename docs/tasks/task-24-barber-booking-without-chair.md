# Task 24: Allow Booking a Shop Barber Without Picking a Chair

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 23 · **Audit source:** Product-spec audit (Booking: E3 / Flow 2 Partial); `04_house-rules.md:57` (E3), `08_edge-cases.md:23` (EC-4), `07_user-flows.md:42-44`

## Overview & Root Cause
Rule E3 lets a client book "by the barber" instead of by the chair, and EC-4 says the booking follows the barber when they change station. The request validator requires `chair_id` unless the booking is at-home. So a shop-barber booking must pin a chair, and the client app has no "book this barber" path.

## Evidence
- `backend/modules/Booking/Http/Requests/Client/CreateBookingRequest.php:16` — `chair_id`: `required_without:at_home_location`.
- `backend/modules/Booking/Http/Requests/Client/CreateBookingRequest.php:21` — `at_home_location`: `required_without:chair_id`.
- `frontend/mobile/apps/client_app/lib/src/features/stylist/stylist_profile.screen.dart` — no booking entry point (see Task 79).

## Full-Stack Scope
### Backend (API / DB / Policies)
- Allow exactly one of three booking modes:
  - (a) `chair_id`, with an optional `barber_id`, as in Task 23;
  - (b) `barber_id` plus a `branch_id` where the barber has an accepted affiliation, with no chair;
  - (c) `at_home_location` plus `barber_id`, per Task 25.
- For mode (b): run the barber overlap check, leave `chair_id` null, and record `branch_id` on the booking so the branch dashboard and channels see it.
  - **Decision required:** add a `bookings.branch_id` column, or resolve the branch through the barber's chair at check-in.
- Make sure branch-scoped lists (`branch/bookings`, `dashboard/bookings`) and the branch broadcast channel include mode (b) bookings.

### Dashboard (BFF / React)
- `frontend/dashboard/src/services/api/dashboard/ibooking.types.ts` — `chair` becomes nullable for mode (b). Booking list and detail components must render "No chair assigned".

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/booking.repository.dart` — let `createBooking` take a barber-only payload.
- `frontend/mobile/packages/core/lib/src/network/dto/booking.dto.dart` — tolerate a null chair.
- The entry UI belongs to Task 79.

## Acceptance Criteria
- [ ] `POST /api/v1/bookings` with `barber_id` and `branch_id` (affiliated), services and a slot, without `chair_id`, returns 201 with `chair = null`.
- [ ] The same request with a branch where the barber has no accepted affiliation returns 422.
- [ ] A request with none of chair, barber+branch, or at-home returns 422.
- [ ] A request with both `chair_id` and `at_home_location` still returns 422.
- [ ] A mode (b) booking appears in `GET /api/v1/branch/bookings` for that branch.
- [ ] Feature test `BarberOnlyBookingTest` covers the above.
- [ ] Client `booking.dto.dart` parses a booking with a null chair (unit test).
- [ ] `php artisan test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- UI entry from the stylist profile (Task 79).
- Notifications (Task 28).
