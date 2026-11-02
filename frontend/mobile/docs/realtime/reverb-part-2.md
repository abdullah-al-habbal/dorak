---
nodeid: mobile.realtime.reverb.part-2
parentnode: mobile.realtime.reverb
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 2 · [Mobile Reverb contract](reverb.md) · [Previous](reverb.md)

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
