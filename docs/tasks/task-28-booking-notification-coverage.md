# Task 28: Notify on Every Booking Transition

**Phase:** Notifications & Realtime · **Priority:** P1 · **Depends on:** Task 16, Task 18 · **Audit source:** Feature-spec audit (REMEDIATION Ph6: notifications on every transition, Partial); product-spec audit (Notifications: booking status Partial); `06_entity-model-abstract.md:210`

## Overview & Root Cause
Push and broadcast happen only on client booking creation and on the barber accept/start/complete/no-show actions. These transitions send no push, and most send no broadcast event:
- client cancel;
- barber cancel (it fires a broadcast but no push);
- dashboard status update, cancel and reschedule;
- branch status update.

So clients are not told when a shop cancels or reschedules them, and dashboards stay stale.

## Evidence
- `backend/modules/Booking/Handlers/Client/CreateBookingHandler.php:25` — `SendBookingStatusNotificationJob::dispatch($booking->id, true)`.
- `backend/modules/Booking/Http/Actions/Barber/TransitionBookingAction.php:38-39` — `BookingStatusUpdatedEvent` and the notification job.
- `backend/modules/Booking/Http/Actions/Barber/CancelBookingAction.php:38` — `BookingCancelledEvent` only, no job.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CancelBookingEloquentResolver.php:35` — status update, no event or job.
- `backend/modules/Dashboard/Http/Actions/UpdateBookingStatusAction.php`, `backend/modules/Dashboard/Http/Actions/CancelBookingAction.php`, `backend/modules/Dashboard/Http/Actions/RescheduleBookingAction.php`, `backend/modules/Branch/Http/Actions/Branch/UpdateBookingStatusAction.php` — no event or job dispatch.
- `backend/modules/Booking/Jobs/SendBookingStatusNotificationJob.php:24-43` — the push fan-out (barber or branch on create; client on update).

## Full-Stack Scope
### Backend (API / DB / Policies)
- Move dispatching into the lifecycle service from Task 18, so every successful transition fires:
  - `BookingStatusUpdatedEvent` (or `BookingCancelledEvent` for cancels), broadcast to `branch.{id}` and `barber.{id}`, plus the client channel from Task 29;
  - `SendBookingStatusNotificationJob`.
- Reschedule fires a `BookingRescheduledEvent` (new) and a notification with the new time.
- Dispatch after commit (`afterCommit`), so a rolled-back transition never notifies.
- Remove the per-action dispatches so there are no duplicates.

### Dashboard (BFF / React)
- `frontend/dashboard/new/src/hooks/use-branch-channel.ts` and `use-barber-channel.ts` — listen for `.booking.status.updated`, `.booking.cancelled` and the new reschedule event, and invalidate the matching dashboard query keys (`["dashboard","bookings"]`, `["dashboard","overview"]`, `["barber","appointments"]`).

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/notifications/push_notification.client.dart` — handle the payload `type` values for status update and reschedule, and route taps to booking details by ID (deep-link fix in Task 78).
- stylist_app and business_app blocs (`stylist.bloc.dart`, `branch_operations.bloc.dart`) — refresh on the new broadcast events.

## Acceptance Criteria
- [ ] For each transition path the following holds, verified with `Queue::fake` and `Event::fake` in the Feature test `BookingTransitionNotificationTest` (one case per path): exactly one `SendBookingStatusNotificationJob` and one broadcast event are dispatched. The paths are client cancel, barber cancel and accept/start/complete/no-show, dashboard update/cancel/reschedule, and branch status update.
- [ ] A transition rejected with 422 dispatches nothing.
- [ ] No action class under `backend/modules/*/Http/Actions` dispatches `SendBookingStatusNotificationJob` directly (grep check). Only the lifecycle service and the create handler do.
- [ ] Dashboard test: receiving `.booking.cancelled` on the branch channel invalidates `["dashboard","bookings"]`.
- [ ] `php artisan test`, `npm run test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- FCM transport fix (Task 16).
- Client realtime channel (Task 29).
- Delivery records (Task 30).
- Non-booking notifications (Task 31).
