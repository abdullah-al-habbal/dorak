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
| Branch operations | `subscribeToBranch(branchId, ...)` | `private-branch.{branchId}` | `booking.created`, `booking.status.updated`, `booking.cancelled`, `booking.rescheduled`, `brand.suspended` |
| Stylist workspace | `subscribeToBarber(barberId, ...)` | `private-barber.{barberId}` | `booking.status.updated`, `booking.cancelled`, `booking.rescheduled`, `workstation.status.toggled` |
| Client booking, and the owner | `subscribeToClient(clientId, ...)` | `private-client.{clientId}` | `booking.created`, `booking.status.updated`, `booking.cancelled`, `booking.rescheduled`; `brand.suspended` for an owner |
| No app subscribes | none | `private-floor-plan.{branchId}` | `chair.status.updated`, once per real status change |

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
`subscribeToBarber(barberId, ...)`, refreshing appointments for each
booking event and refreshing the persisted workstation state after
`workstation.status.toggled`.

## Brand suspension

`brand.suspended` (`RealtimeEvents.brandSuspended`, payload `brandId`, `status`)
arrives on each enabled branch channel and on the owner's `client.{clientId}`
channel (`client_id` from `GET /owner/me`). `business_app`'s
`BrandSuspensionMonitor` listens for the signed-in role: a branch manager is
signed out with the reason, an owner's brand turns read-only in place. It starts
on sign-in and stops with the session. If the id lookup or the socket fails, the
HTTP answers do the same job (`../core/interceptors.md`). Reactivation sends no
event.

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

6. With a branch manager and an owner signed in, suspend the brand from the
   dashboard (a queue worker must run). The manager lands on login with the
   suspension message; the owner's open branch screen loses its add button.
   Repeat with Reverb stopped: the next refused request has the same effect.

If authorization fails, verify the bearer token guard and the channel ID
before changing client code; those are enforced by backend channel policies.
