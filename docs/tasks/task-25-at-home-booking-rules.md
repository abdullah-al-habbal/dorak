# Task 25: Enforce At-Home Booking Rules

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 23, Task 24 · **Audit source:** Product-spec audit (Booking: at-home rules Missing; at_home flag via API Partial); `04_house-rules.md:49` (D6), `04_house-rules.md:58` (E4), `02_prd.md:69`

## Overview & Root Cause
At-home bookings only validate the address fields. The resolver does not check that:
- a barber is set;
- the barber is a freelancer offering at-home service;
- each service is flagged `at_home`;
- the client's coordinates fall inside the barber's `travel_radius`.

As a result an at-home booking can be created with no barber at all, which also triggers the Task 13 completion failure. The `at_home` service flag can only be set from Filament, not through the dashboard API.

## Evidence
- `backend/modules/Booking/Http/Requests/Client/CreateBookingRequest.php:17,21-26` — `barber_id` is nullable, and `at_home_location` only requires lat, lng, street, building and unit.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:58-62,78-80` — no at-home checks. The location is stored as given.
- `backend/modules/OfferedService/Database/Migrations/0001_01_01_200040_create_offered_services_table.php:23` — `at_home` boolean exists.
- `backend/modules/Barber/Database/Migrations/0001_01_01_100100_add_travel_radius_to_barbers_table.php:14` — `travel_radius`. `backend/modules/Barber/Database/Migrations/0001_01_01_000000_create_barbers_table.php:20` — `is_freelancer`.
- `backend/modules/Dashboard/Http/Requests/ServiceRequest.php:14` — no `at_home` field.

## Full-Stack Scope
### Backend (API / DB / Policies)
- When `at_home_location` is present, the request must satisfy all of the following, else 422 with a distinct code per rule:
  - `barber_id` is present;
  - the barber has `is_freelancer = true` (**Decision required:** whether affiliated barbers may also do at-home);
  - every service is `at_home = true` and owned by that barber;
  - the Haversine distance from the barber's coordinates to the client's is at most `travel_radius` km. A null radius means the barber does not offer at-home.
- Add `at_home` (boolean) to `Dashboard/Http/Requests/ServiceRequest.php` and its payload mapping.
- The Task 21 barber slot endpoint must also apply these rules when an `at_home` flag is passed.

### Dashboard (BFF / React)
- `frontend/dashboard/new/src/services/api/dashboard/service-form.schema.ts` and the service form component — add an "Available at home" toggle that maps to `at_home`.

### Mobile (Flutter / Repositories)
- `frontend/mobile/apps/client_app/lib/src/features/booking/branch_detail.state.dart:52-60` — at-home submit requires a selected barber and at-home services.
- `branch_detail.bloc.dart` — map the at-home 422 codes to localized messages.

## Acceptance Criteria
- [ ] `POST /api/v1/bookings` with `at_home_location` and no `barber_id` returns 422.
- [ ] With a non-freelancer barber (if the decision keeps that rule), it returns 422.
- [ ] With a service where `at_home = false`, it returns 422.
- [ ] With client coordinates outside `travel_radius`, it returns 422. Inside the radius with valid services, it returns 201.
- [ ] `POST /api/v1/dashboard/services` accepts and persists `at_home: true`, and the response includes it.
- [ ] Feature test `AtHomeBookingRulesTest` covers each rule. `ServiceApiTest` covers `at_home`.
- [ ] Client bloc test: at-home submit is disabled without a barber.
- [ ] `php artisan test`, `npm run test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Barber self-service of services (Task 54).
- Travel-radius editing UI (Tasks 69 and 83).
