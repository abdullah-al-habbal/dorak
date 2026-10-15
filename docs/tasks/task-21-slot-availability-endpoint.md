# Task 21: Add Slot Availability Endpoint

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 20 · **Audit source:** Known gap (no slot endpoint), re-confirmed by both spec audits; mobile audit (slot is a free date/time picker); `02_prd.md:138`, `04_house-rules.md:115` (L2), `07_user-flows.md:16`

## Overview & Root Cause
The spec says slots are derived from total service duration (L2), and the user flow checks a slot before booking. No route lists bookable slots. The client app gives a free date and time picker and only learns about a conflict from the floor plan, or from a 409 on submit.

## Evidence
- Route list (`php artisan route:list --path=api`) — no `slots` or `availability` route exists.
- `frontend/mobile/apps/client_app/lib/src/features/booking/widgets/branch_detail_body.widget.dart:95-110` — `showDatePicker` and `showTimePicker` with any time accepted.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:25-47` — total duration is the sum of the services' `duration`, which is the same rule the slot generator needs.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `GET /api/v1/branches/{branch}/slots?date=YYYY-MM-DD&service_ids[]=…&chair_id=|barber_id=`. It is public, like the floor plan.
- Add `GET /api/v1/barbers/{barber}/slots?date=…&service_ids[]=…` for freelancer and at-home bookings.
- Response: a list of UTC `starts_at` and `ends_at` values. Step size comes from config, default 15 minutes.
  - Excludes overlaps, using the Task 20 helper.
  - Excludes past times.
  - Excludes times inside the 2-hour cancellation window only if product requires it. **Decision resolved:** the minimum lead time for new bookings is **0 minutes** (any future instant is bookable), configurable through `booking.slots.min_lead_minutes` (`BOOKING_SLOT_MIN_LEAD_MINUTES`, default `0`). The 2-hour cancellation window is not used to hide times.
- Validation: services must be active and must match the subject (enforced fully in Task 23). An empty `service_ids` returns 422.
- Must reuse the hours and schedule validator from Task 22 once it lands; Task 22's acceptance re-checks this.

### Dashboard (BFF / React)
- Optional: `walk-in-booking-form.tsx` may call the branch slots endpoint through the dashboard proxy. Not required for this task.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/endpoints/` — add slot endpoints, a `SlotDto`, and a repository method in `branch.repository.dart` (branch slots) and `explore.repository.dart` or `booking.repository.dart` (barber slots).
- `frontend/mobile/apps/client_app/lib/src/features/booking/branch_detail.bloc.dart` and `widgets/branch_detail_body.widget.dart` — replace the free time picker with a slot list loaded after services are selected.

## Acceptance Criteria
- [x] `GET /api/v1/branches/{branch}/slots` with valid params returns 200 and a list of UTC ISO-8601 slots, each with `starts_at` and `ends_at`.
- [x] A slot overlapping an existing `pending` booking on the requested chair is not returned.
- [x] Missing or empty `service_ids` returns 422. An unknown branch returns 404.
- [x] For each returned slot, `POST /api/v1/bookings` with the same chair, services and `starts_at` returns 201, asserted for at least one slot in the Feature test `BranchSlotsTest`.
- [x] `BarberSlotsTest` covers the barber endpoint.
- [x] The client app can no longer submit a time that was not offered by the slot list (bloc test).
- [x] `php artisan test` (696 passed) and `melos run test`/`melos run verify` pass. Pint is clean. PHPStan at level max is clean on every touched and new production path (`vendor/bin/phpstan analyse` over the ten Booking files: no errors). The repository-wide run is not clean independent of this change: a stale `phpstan-baseline.neon` plus larastan/phpstan version drift report ~141 pre-existing errors and ~86 unmatched-baseline notices across unrelated modules (`Ban`, `Barber`, …). The new `modules/Booking/Config` and `modules/Dashboard/Config` entries in `phpstan.neon` `configDirectories` additionally removed five pre-existing `noEnvCallsOutsideOfConfig` errors.

## Decision Record
- **Minimum lead time:** 0 minutes, configurable (`booking.slots.min_lead_minutes`). Chosen so the slot list matches the existing booking-create behavior, which enforces no lead time; the 2-hour cancellation window stays a cancellation rule, not an availability filter. Recorded in `docs/decisions-required.md`.

## Out of Scope
- Branch opening hours storage (Task 51).
- Schedule enforcement (Task 22).
