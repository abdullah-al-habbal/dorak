# Task 13: Fix Booking Completion for Bookings Without a Barber

**Phase:** 2 — Data Integrity & Broken Pipelines · **Priority:** P0 · **Depends on:** None · **Audit source:** Feature audit (Rec PRD §3 history edge defect); product audit (HIST-1, `02_prd.md:254`); verified in code by the parent session

## Overview & Root Cause
`bookings.barber_id` is nullable: a chair booking does not have to name a barber. Two observers fire when a booking's status changes to `completed`, and both write `$booking->barber_id` into non-nullable columns:
- **ClientHistory** creates a `client_service_histories` row whose `barber_id` is NOT NULL.
- **ClientRecommendation** creates a `recommendation_edges` row whose target is `uuidMorphs('target')`, also NOT NULL.

When a booking without a barber is completed, the insert fails. That likely aborts the completion request, so the booking cannot be completed (not yet reproduced at runtime). Separately, only the **first** service is written to history, and no branch edge is ever created.

## Evidence
- `backend/modules/Booking/Database/Migrations/0001_01_01_200060_create_bookings_table.php:18`: `foreignUuid('barber_id')->nullable()`.
- `backend/modules/ClientHistory/Database/Migrations/2026_07_19_000001_create_client_service_histories_table.php:17`: `foreignUuid('barber_id')->constrained('barbers')`, NOT NULL.
- `backend/modules/ClientRecommendation/Database/Migrations/2026_07_19_000001_create_recommendation_edges_table.php:16`: `uuidMorphs('target')`, NOT NULL.
- `backend/modules/ClientHistory/Observers/BookingCompletedObserver.php:28-37`: `barberId: $booking->barber_id`, and `$booking->services->first()` only.
- `backend/modules/ClientRecommendation/Observers/BookingCompletedObserver.php:24-31`: `target_type => 'barber'`, `target_id => $booking->barber_id`.
- Completion call sites:
  - `backend/modules/Booking/Http/Actions/Barber/CompleteBookingAction.php`
  - `backend/modules/Branch/Http/Actions/Branch/UpdateBookingStatusAction.php`
  - `backend/modules/Dashboard/Http/Actions/UpdateBookingStatusAction.php`

## Full-Stack Scope
### Backend (API / DB / Policies)
- **History:** migration that makes `client_service_histories.barber_id` nullable. Also prepare HIST-2 anonymization by making `client_id` nullable, but leave the anonymization logic to Task 36.
- **History observer:** fall back to `booking.chair.barber_id` when `booking.barber_id` is null. If both are null, store null.
- **History observer:** write one history row per booked service, or one row with all services.
  - Decision required: the HIST-1 granularity. This spec proposes one row per service.
- **Recommendation observer:**
  - always create a `client → branch` history edge when the booking has a chair;
  - create the `client → barber` edge only when a barber is resolvable;
  - never insert a null target.
- Run both observers after commit (`$afterCommit = true`), so an observer failure cannot roll back the status change. Log failures instead.

### Dashboard (BFF / React)
- None. The completion endpoints keep the same contract.

### Mobile (Flutter / Repositories)
- None. `frontend/mobile/packages/core/lib/src/network/dto/service_history.dto.dart:18` already declares `HistoryBarberDto? barber`. Verify that the history UI (`frontend/mobile/apps/client_app/lib/src/features/profile/widgets/history_card.widget.dart`) renders correctly when there is no barber.

## Acceptance Criteria
- [ ] Completing a chair booking with `barber_id = null` (and no chair barber) through each of the three completion call sites returns 200, and the booking status becomes `completed`.
- [ ] That completion creates a `client_service_histories` row with `barber_id = null` and a `recommendation_edges` row with `target_type = branch`.
- [ ] Completing a booking with 2 services creates history entries for both services.
- [ ] Feature test `tests/Feature/ClientHistory/BookingCompletionHistoryTest.php` covers the null-barber, chair-barber fallback and multi-service cases.
- [ ] Unit test `tests/Feature/ClientRecommendation/Services/HistoryEdgeObserverTest.php` asserts that no edge with a null target is ever created.
- [ ] `php artisan test` and `melos run test` pass; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Resolving the chair's barber at booking creation: Task 23.
- History anonymization on account deletion: Task 36.
- History notes, rating and media upload: Task 58.
