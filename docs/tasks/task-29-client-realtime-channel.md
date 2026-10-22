# Task 29: Add Client Realtime Booking Channel

**Phase:** Notifications & Realtime · **Priority:** P1 · **Depends on:** Task 28 · **Audit source:** Feature-spec audit (mvp-gap: client real-time booking channel Missing); mobile audit (booking tracker uses polling)

## Overview & Root Cause
Reverb channels exist only for `branch.{id}` and `barber.{id}`. The broadcast auth route does not accept the `client` guard, so a client cannot subscribe to anything. The client booking tracker has to poll for status changes.

## Evidence
- `backend/modules/Core/Routes/channels.php` — only the `branch.{branchId}` and `barber.{barberId}` channels, with guards `admin_api`, `branch_api` and `barber`.
- `backend/modules/Core/Providers/ApplicationServiceProvider.php:48` — `Broadcast::routes([... 'middleware' => ['api', 'auth:admin_api,branch_api,barber']])`, with no `client` guard.
- `backend/modules/Booking/Events/BookingStatusUpdatedEvent.php:18-20` and `BookingCancelledEvent.php:18-20` — broadcast only to the branch and barber channels.
- `frontend/mobile/packages/core/lib/src/network/realtime_channels.entity.dart:4-6` — only `branch()` and `barber()` helpers.
- `frontend/mobile/apps/client_app/lib/src/features/booking/booking_tracker.screen.dart`, `booking_refresh.bloc.dart` — tracker refresh without realtime.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add a private channel `client.{clientId}`, authorized only when the authenticated `ClientModel` ID equals `clientId`.
- Add `client` to the broadcast auth middleware guards and to the channel's `guards` option.
- Booking created, status-updated, cancelled and rescheduled events also broadcast on `client.{booking.client_id}`.
- Payload: the booking ID and new status only. No other personal data.

### Dashboard (BFF / React)
- None. Dashboard actors never subscribe to client channels.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/realtime_channels.entity.dart` — add `client(String clientId)`.
- `frontend/mobile/packages/core/lib/src/network/realtime.client.dart` — authenticate with the client token.
- client_app `booking_refresh.bloc.dart` / tracker — subscribe to `client.{id}` and refresh on events. Keep polling only as a fallback when the socket is disconnected.

### Implemented contract
- Channel `private-client.{clientId}` in `modules/Core/Routes/channels.php`, guard `client` only; authorized when the authenticated `ClientModel` id equals `clientId`. Broadcast auth middleware is now `auth:admin_api,branch_api,barber,client`. Other actors get 403 on it, and a client token gets 403 on `branch.*` and `barber.*` because those channels list their own guards.
- `BookingCreatedEvent`, `BookingStatusUpdatedEvent`, `BookingCancelledEvent` and `BookingRescheduledEvent` take a trailing `clientId` and add `client.{clientId}` to `broadcastOn()`. The property is `private`, so the client id is not added to the broadcast payload; the payload keeps its existing public fields (`bookingId`, plus `status` / `timeSlot` where already present). Callers: `BookingTransitionNotifier`, `CreateBookingAction`, `RebookFromHistoryEloquentResolver`.
- Mobile: `RealtimeChannels.client()`, `RealtimeClient.subscribeToClient()`, `isConnected`, `connectionChanges`. client_app creates a `RealtimeClient` in `DorakApp`, connects on an authenticated session and disconnects for guests. `BookingRefreshCubit` subscribes to `client.{id}`, refreshes when the payload `bookingId` matches, refreshes on reconnect, and the 10s poll only runs while the socket is disconnected (`pollIfDisconnected`).
- Dashboard: no change. Docs: this file and `docs/todowork.md`.
- Tests: `ClientChannelAuthorizationTest` (uses the signing driver, because the suite's null driver authorizes everything), `realtime_channels_test.dart`, `booking_refresh_cubit_test.dart`; the business_app and stylist_app realtime fakes implement the new members.
- Deviations: none. The spec's "booking ID and new status only" is met by keeping the client id out of the payload; the shared payloads keep their existing non-personal fields, which the branch and barber consumers already read.

## Acceptance Criteria
- [x] `POST /api/v1/broadcasting/auth` for `private-client.{ownId}` with a client token returns 200.
- [x] For `private-client.{otherId}` it returns 403.
- [x] With no token it returns 401.
- [x] A barber or branch token is rejected for `private-client.*` with 403.
- [x] Every booking event's `broadcastOn()` includes `client.{client_id}` (unit test per event).
- [x] Feature test `ClientChannelAuthorizationTest` exists and passes.
- [x] `frontend/mobile/packages/core/test/realtime_channels_test.dart` covers `client()`.
- [x] A tracker bloc test shows a status change arriving via a realtime event without a poll.
- [x] `php artisan test` and `melos run test` pass. PHPStan max and Pint are clean.

## Out of Scope
- Push notifications (Task 28).
- Live location tracking of barbers (not in spec).
