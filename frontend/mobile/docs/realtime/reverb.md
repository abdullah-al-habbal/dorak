# Mobile Reverb contract

Status: `DONE` for the mobile client integration. A live environment walkthrough
remains an operational verification step.

`packages/core` exposes `RealtimeClient`, backed by `laravel_reverb`. It speaks
the Pusher protocol used by Laravel Reverb, reconnects after backgrounding, and
re-authorizes every private channel after a reconnect.

## Environment

Each app's ignored `.env` must define these values. The committed
`.env.example` files show the required shape.

| Key | Meaning |
| --- | --- |
| `REVERB_APP_KEY` | Public Reverb application key |
| `REVERB_HOST` | Public WebSocket hostname, without a protocol |
| `REVERB_PORT` | `443` for production/staging WSS |
| `REVERB_SCHEME` | `https` or `wss` for TLS; `http` only for an intentional local setup |
| `REVERB_SERVER_PATH` | Optional reverse-proxy WebSocket path, otherwise empty |

The API base URL remains the source of the private-channel auth endpoint:
`$API_BASE_URL_V1/broadcasting/auth`. Mobile apps do not call the dashboard's
cookie-only `/api/realtime/auth` BFF route.

## Authentication and authorization

Create the client with the same secure token storage used by the app's
`ApiClient`. On every private-channel authorization, core sends:

```http
Authorization: Bearer <Sanctum token>
Accept: application/json
```

Laravel applies its existing `admin_api`, `branch_api`, and `barber` channel
policies at `POST /api/v1/broadcasting/auth`; the client never chooses access
rights. A missing token fails authorization rather than subscribing.

```dart
final realtime = RealtimeClient(
  configuration: ConfigProvider.realtimeConfiguration,
  tokenProvider: SecureBranchTokenStorage().read,
  onError: (error, stackTrace) {
    // Send to the app's approved error reporting pipeline.
  },
);

await realtime.connect();
```

On logout, call `disconnectForLogout()` before deleting the token. It drops all
listeners so a stale screen cannot reconnect under a different account. Call
`dispose()` during application teardown.

## Channels and events

Use IDs obtained from the authenticated data already displayed in each
workspace. `RealtimeClient` adds the private-channel prefix internally.

| Workspace | Core call | Wire channel | Events |
| --- | --- | --- | --- |
| Branch operations | `subscribeToBranch(branchId, ...)` | `private-branch.{branchId}` | `booking.created`, `booking.status.updated`, `booking.cancelled` |
| Stylist workspace | `subscribeToBarber(barberId, ...)` | `private-barber.{barberId}` | `booking.status.updated`, `booking.cancelled`, `workstation.status.toggled` |

Every callback receives the exact broadcast event name and decoded payload.
Refresh the authoritative HTTP query after an event instead of attempting a
partial local merge; this preserves server-side authorization and prevents
missed relationship changes.

```dart
final subscription = realtime.subscribeToBranch(branchId, (event, payload) {
  switch (event) {
    case 'booking.created':
    case 'booking.status.updated':
    case 'booking.cancelled':
      unawaited(branchOperationsBloc.load());
  }
});

// In the owning screen/widget lifecycle:
subscription.cancel();
```

The stylist workspace follows the same lifecycle with
`subscribeToBarber(barberId, ...)`, refreshing appointments for all three
booking events and refreshing the persisted workstation state after
`workstation.status.toggled`.

## Live verification

With an authorized branch account and barber account against a TLS-enabled
Reverb server:

1. Open both workspaces and confirm their private channels authorize.
2. Create a booking and confirm the branch list refreshes without a pull to
   refresh.
3. Change a booking status and confirm both relevant workspaces refresh.
4. Toggle a workstation and confirm the barber workspace reads its persisted
   state after the event.
5. Cancel a booking with a reason and confirm both subscriptions receive
   `booking.cancelled`.

If authorization fails, verify the bearer token guard and the channel ID
before changing client code; those are enforced by backend channel policies.
