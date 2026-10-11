# Task 19: Route Rebook Through the Booking Engine

**Phase:** Booking Engine · **Priority:** P1 · **Depends on:** Task 02, Task 18 · **Audit source:** Backend route audit (NoAuthz on rebook); feature-spec audit (BE-04/12 "Rebook uses the booking engine"); `02_prd.md:258` (HIST-5)

## Overview & Root Cause
Rebooking builds a `BookingModel` directly instead of reusing the client booking-creation path. Because of that it:
- skips the overlap and double-booking check, row locking, and the chair-maintenance and active-service checks;
- creates the booking as `confirmed` instead of `pending` (the barber never accepts it);
- leaves the payment fields empty and dispatches no notification or event.

Task 02 fixes ownership only. This task removes the duplicated engine.

## Evidence
- `backend/modules/ClientHistory/Eloquent/Resolvers/RebookFromHistoryEloquentResolver.php:16` — loads the history record with `findOrFail($command->historyId)` and creates the booking directly.
- `backend/modules/ClientHistory/Eloquent/Resolvers/RebookFromHistoryEloquentResolver.php:27` — `'status' => BookingStatus::Confirmed`.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php:69-71,95` — the canonical path: `Pending`, payment defaults, overlap check using `reservationBlockingValues()`.
- `backend/modules/Booking/Handlers/Client/CreateBookingHandler.php:25` and `backend/modules/Booking/Http/Actions/Client/CreateBookingAction.php:27` — notification job and `BookingCreatedEvent` dispatch.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Change the rebook resolver so it maps a history record to a `CreateBookingCommand`: client, barber, chair, the original services, and the requested `time_slot`. Then call `CreateBookingHandler`.
- Stop writing `BookingModel` directly.
- If the original chair is under maintenance or gone, or a service is inactive, return the same error codes as `POST /bookings` (409 or 422).
- Rebook is used from the client app, so keep the response as `BookingResource` (201).

### Dashboard (BFF / React)
- None. Rebook is a client-only endpoint.

### Mobile (Flutter / Repositories)
- `frontend/mobile/apps/client_app/lib/src/features/profile/history.bloc.dart:68-71` — handle 409 and 422 failures from `rebookFromHistory` with a user-visible message. A successful rebook now shows `pending` status.
- `frontend/mobile/packages/core/lib/src/network/repositories/history.repository.dart:36-42` — no contract change. Confirm it parses error codes.

## Acceptance Criteria
- [ ] `RebookFromHistoryEloquentResolver` no longer calls `BookingModel::create`. It delegates to the create-booking handler.
- [ ] A rebook overlapping an existing `pending`, `confirmed` or `in_progress` booking for the same chair or barber returns 409, and no row is created.
- [ ] A successful rebook returns 201 with `status = pending` and the payment defaults set.
- [ ] A successful rebook dispatches `SendBookingStatusNotificationJob` and `BookingCreatedEvent`, asserted with `Queue::fake` and `Event::fake`.
- [ ] Rebooking another client's history returns 403 (as required by Task 02's ownership policy).
- [ ] The Feature test `RebookFromHistoryTest` covers success, overlap, maintenance chair, inactive service and foreign history.
- [ ] The client_app `history_bloc_test.dart` covers the 409 failure state.
- [ ] `php artisan test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Hours and schedule validation (Task 22).
- Service-ownership checks (Task 23); rebook inherits both automatically once they land.
