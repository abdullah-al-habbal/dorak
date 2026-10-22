# Task 27: Handle Chair Maintenance Conflicts with Existing Bookings

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 18, Task 28 (notification transport) · **Audit source:** Product-spec audit (Booking: E5 / EC-2 Missing); `04_house-rules.md:59` (E5), `08_edge-cases.md:15` (EC-2)

## Overview & Root Cause
Rule E5 says existing bookings on a chair that goes into maintenance must be "handled, not silently dropped": notify the affected clients and offer a rebooking. The two code paths do different things:
- **Dashboard chair update:** refuses the change while active or future bookings exist.
- **Branch mobile toggle** (`PATCH /branch/chairs/{chair}/status`): sets maintenance unconditionally. Bookings stay attached to a maintenance chair, and nobody is told.

## Evidence
- `backend/modules/Branch/Http/Actions/Branch/ToggleChairStatusAction.php:25-31` — validates `in:available,occupied,maintenance`, calls `$chairModel->update(['status' => $status])`, then broadcasts `ChairStatusUpdated`. No booking check.
- `backend/modules/Dashboard/Eloquent/Resolvers/Chairs/ChairConflictResolver.php:12-16` — throws `ChairHasActiveBookingsException` if reservation-blocking bookings end after now.
- `backend/modules/Dashboard/Handlers/Chairs/UpdateChairHandler.php` — uses `ChairConflictResolver`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- One shared chair-status service, used by both the branch toggle and the dashboard update:
  - Default: reject with 409 `chair_has_active_bookings` when future reservation-blocking bookings exist, matching the dashboard.
  - With an explicit `force=true` (branch or dashboard actor only): set maintenance, then for each affected future booking:
    - transition it to `canceled` through the lifecycle (Task 18), with `cancellation_reason = chair_maintenance`;
    - dispatch the client notification (Task 28).
  - **Decision (EC-2, resolved): cancel-and-notify.** Reassigning to another free chair is not attempted: the client chose a specific chair/time, and silent substitution is the "silently dropped" behaviour rule E5 forbids. Rebooking UX stays a follow-up.
- The response lists the affected booking IDs.

### Implemented contract
- Shared service `Modules\Chair\Services\ChairStatusService::update()`, used by `PATCH /branch/chairs/{chair}/status`, `PUT /dashboard/chairs/{chair}` and `PATCH /chairs/{chair}`. A chair row lock plus booking row locks make the check and the cancellations atomic; notifications and broadcasts are dispatched after commit.
- Affected bookings: `chair_id` = chair, status in `pending|confirmed|in_progress`, `ends_at > now()` (same predicate as the dashboard check). Only transitions *into* `maintenance` are checked; the branch toggle to `occupied`/`available` is unaffected. Dashboard `occupied` and barber reassignment keep the existing non-forceable 409.
- Request: optional boolean `force` (ignored unless status is `maintenance`).
- 409: `code = CHAIR_HAS_ACTIVE_BOOKINGS`, `errors.booking_ids = [...]`; chair and bookings unchanged.
- 200 with `force=true`: `meta.canceled_booking_ids = [...]` (empty array when nothing was affected); each booking is `canceled` with `cancellation_reason = chair_maintenance` and one `SendBookingStatusNotificationJob` is dispatched per booking.
- Dashboard: `ChairMaintenanceConflict` confirmation in `EntityCrudForm`; business app: conflict dialog in `branch_operations.screen.dart` (Task 85 keeps the rest of the business-app work).

### Dashboard (BFF / React)
- Chair edit form (generic entity form under `frontend/dashboard/src/components/entities/`, schema `services/api/dashboard/chair-form.schema.ts`) — on 409, show the conflicting bookings and a "Set maintenance and cancel N bookings" confirmation that resends with `force=true`.

### Mobile (Flutter / Repositories)
- `frontend/mobile/apps/business_app/lib/src/features/operations/branch_operations.screen.dart` — the chair toggle UI is added in Task 85, and must handle the same 409 and confirm flow.
- client_app: the affected client receives the push and sees the booking as canceled (Task 26 Past list).

## Acceptance Criteria
- [x] `PATCH /api/v1/branch/chairs/{chair}/status` `{status: maintenance}` on a chair with a future `confirmed` booking returns 409 (`CHAIR_HAS_ACTIVE_BOOKINGS`; lower-case code in the original draft was normalized to match the dashboard), and the chair status is unchanged.
- [x] The same request with `force=true` returns 200, the chair is `maintenance`, and the booking is `canceled` with reason `chair_maintenance`.
- [x] With `force=true`, one `SendBookingStatusNotificationJob` is dispatched per affected booking (`Queue::fake`).
- [x] The dashboard `PUT /api/v1/dashboard/chairs/{chair}` behaves identically (same code path), asserted in `ChairApiTest`.
- [x] The EC-2 decision is recorded here.
- [x] Feature test `ChairMaintenanceConflictTest` exists and passes.
- [x] `php artisan test` passes. PHPStan max and Pint are clean.

## Out of Scope
- Remaining business app work in Task 85 (the chair toggle and its conflict dialog landed here because the toggle already existed).
- Rebooking UX for the client (follow-up once the EC-2 decision is made).
