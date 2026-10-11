# Task 78: Fix Client Booking Flow Defects

**Phase:** Phase 14 — Mobile · **Priority:** P1 · **Depends on:** Task 20 (UTC time contract), Task 21 (slot availability, optional for this task) · **Audit source:** Mobile audit — booking flow gaps; spec `backend/docs/07_user-flows.md` (booking flow)

## Overview & Root Cause
The client booking flow has three defects. First, the submit gate does not require a service, so the bloc can send no `service_ids` and the backend rejects the request with 422 (`service_ids` is `required|array|min:1`). Second, the floor-plan availability check sends local `date`/`time_slot` while booking creation sends `timeSlot.toUtc()`, so the slot that was checked can differ from the slot that gets booked. Third, the booking tracker and details routes build their screens from `state.extra! as BookingDto` and ignore the `:bookingId` path parameter, so a deep link or a restored route crashes.

## Evidence
- `frontend/mobile/apps/client_app/lib/src/features/booking/branch_detail.state.dart:52` — `canSubmit` checks the time, chair and at-home address but not the selected services.
- `backend/modules/Booking/Http/Requests/Client/CreateBookingRequest.php:19` — `'service_ids' => ['required', 'array', 'min:1']`.
- `frontend/mobile/packages/core/lib/src/network/repositories/booking.repository.dart:81` — `final slot = timeSlot.toUtc();`, while line 91 sends `service_ids` only when present (`?serviceIds`).
- `frontend/mobile/packages/core/lib/src/network/repositories/branch.repository.dart:25-27` — floor-plan query sends `date` / `time_slot` built from the local time.
- `frontend/mobile/apps/client_app/lib/src/core/navigation/app.router.dart:517` and `:524` — `booking: state.extra! as BookingDto` on the tracker and details routes.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None for the 422 fix: the contract is already correct.
- The time-zone contract (whether floor-plan `date`/`time_slot` are interpreted as UTC or branch-local) is defined by Task 20. This task only adopts it.

### Dashboard (BFF / React)
- None — client-mobile-only flow.

### Mobile (Flutter / Repositories)
- `branch_detail.state.dart`: `canSubmit` additionally requires `selectedServiceIds.isNotEmpty` (use the existing field name). The submit CTA shows a "select a service" hint while it is disabled.
- `branch_detail.bloc.dart` (`_onSubmitted`): never dispatch create-booking with an empty or null service list.
- `branch.repository.dart` and `booking.repository.dart`: build the floor-plan `date`/`time_slot` and the booking `time_slot` from the same instant, using the single convention fixed by Task 20.
- `app.router.dart` tracker and details routes: read `state.pathParameters['bookingId']`. When `extra` is absent or not a `BookingDto`, load the booking via `GET /bookings/{booking}` (the existing `ShowBookingAction` route) through the booking repository instead of force-casting.

## Acceptance Criteria
- [ ] Bloc test: with no service selected, `canSubmit == false` and `BookingRepository.createBooking` is never called.
- [ ] Repository test: the create-booking request body always contains a non-empty `service_ids` array.
- [ ] Unit test: for a fixed `DateTime`, the floor-plan query `date`/`time_slot` and the booking `time_slot` represent the same instant under the Task 20 convention.
- [ ] Router test: navigating to `/bookings/<id>/tracker` (and the details path) with no `extra` renders the screen after fetching by ID. No `TypeError` or null-check exception is thrown.
- [ ] Existing `apps/client_app/test/branch_detail_bloc_test.dart` and `booking_flow_test.dart` are updated and pass.
- [ ] `melos run analyze` and `melos run test` pass.

## Out of Scope
- Slot-picker UI driven by the availability endpoint (Task 21 backend, then a follow-up in this flow).
- Booking a barber without a chair (Task 24) and direct booking from the stylist profile (Task 79).
