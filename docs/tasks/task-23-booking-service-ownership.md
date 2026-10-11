# Task 23: Validate Service Ownership and Resolve Chair Barber on Booking

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 20 · **Audit source:** Product-spec audit (Booking: services must belong to brand/barber; chair's linked barber overlap); `04_house-rules.md:24-25` (B4/B5), `08_edge-cases.md:23` (EC-4), `08_edge-cases.md:51` (EC-9)

## Overview & Root Cause
Booking creation only checks that each `service_id` exists and is active. A client can book Shop A's chair with Shop B's services, or with another barber's private services.

When a client books a chair that has a linked barber without sending `barber_id`, `bookings.barber_id` stays null. That causes three problems:
- The barber's overlap check is skipped, so the same barber can be double-booked across chairs or shops.
- The booking follows the chair instead of the barber (EC-4).
- Completion hits the null-barber failure (Task 13).

## Evidence
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:25-33` — `whereIn('id', serviceIds)->where('active', true)`. No owner check.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:58-61` — the barber overlap check runs only `if ($command->barberId !== null)`. The chair's barber is never resolved.
- `backend/modules/Booking/Http/Requests/Client/CreateBookingRequest.php:17` — `barber_id` is optional.
- `backend/modules/Booking/Database/Migrations/0001_01_01_200060_create_bookings_table.php:18` — `barber_id` is nullable.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Service ownership rule. Each service's `serviceable` must be one of:
  - (a) the chair's branch or its brand;
  - (b) the booked barber (chair barber or explicit `barber_id`).
  - Otherwise return 422 `InvalidBookingServicesException`.
- Barber resolution: if `chair_id` is given and `barber_id` is not, set `barber_id` to the chair's current barber (if any) and run the barber overlap check.
  - If both are given and the chair has a different linked barber, return 422.
  - **Decision required (EC-9):** enforce one barber calendar across all affiliations, or per shop. Default: across all affiliations, matching the current overlap query on `barber_id`.
- Apply the same rules to dashboard walk-in and reschedule.

### Dashboard (BFF / React)
- `frontend/dashboard/new/src/components/bookings/walk-in-booking-form.tsx` — limit the service picker to the selected chair's branch/brand and barber services. Show the 422 error.

### Mobile (Flutter / Repositories)
- `frontend/mobile/apps/client_app/lib/src/features/booking/branch_detail.bloc.dart` — offer only services returned for the selected chair or barber (branch detail payload, completed in Task 48). Map the 422 to a message.

## Acceptance Criteria
- [ ] `POST /api/v1/bookings` with a chair from branch A and a service owned by an unrelated brand returns 422, and no booking row is created.
- [ ] `POST /api/v1/bookings` with a chair whose linked barber is X, without `barber_id`, stores `barber_id = X`.
- [ ] A second booking for barber X at an overlapping time on a different chair returns 409.
- [ ] A chair linked to barber X with `barber_id = Y` returns 422.
- [ ] Feature test `BookingServiceOwnershipTest` covers brand services, barber services, foreign services, and chair-barber resolution.
- [ ] The EC-9 decision is recorded here.
- [ ] `php artisan test` passes. PHPStan max and Pint are clean.

## Out of Scope
- Booking a barber with no chair (Task 24).
- At-home rules (Task 25).
- Brand-owned menu in branch detail (Task 48).
