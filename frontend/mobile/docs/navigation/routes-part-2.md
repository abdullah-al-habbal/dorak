---
nodeid: mobile.navigation.routes.part-2
parentnode: mobile.navigation.routes
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 2 · [Routes](routes.md) · [Previous](routes.md)

## The redirect and the three listeners

Guard logic is split across three places, deliberately:

| Mechanism | Owns |
| --- | --- |
| `AppRouter._redirect` | holds the app on `/splash` while `SessionState.status` is `unknown`, and nothing else |
| `AppRouter._leaveSplash` | awaits `session.ready`, then `router.go(AppGate.resolve(...))` — the launch gate (see `flows/app-launch.md`) |
| `AppRouter._onSessionChanged` / `_onAuthChanged` / `_onRecoveryChanged` | `router.refresh()` on every session change, then react to `SessionSignal` / `AuthSignal` / `RecoverySignal` |

The launch gate is **not** in `_redirect`: the splash must hold for its 2500 ms
animation, which a redirect cannot express. `AppGate.resolve` is a pure function
(`app_gate.entity.dart`) and is unit-testable without pumping a widget.

**`go` vs `push` is a contract, not a detail:**

| Signal | Call | Why |
| --- | --- | --- |
| `SessionSignal.sessionExpired` | `router.go(/auth)` | **replaces** — no dead-session screen survives to be back-navigated into |
| `SessionSignal.authenticationRequired` | `router.push(/auth)` | **pushes** — back returns to the guest destination the user was on |
| `RecoverySignal.codeSent` / `codeAccepted` / `passwordReset` | `router.push(...)` | **pushes** — each recovery step stays back-navigable while the flow is in progress |
| 014's "Log In" action | `router.go(/auth/login)` | **replaces** — the code has been consumed, so a completed reset must not be re-enterable |

Each is acknowledged immediately after (`SignalAcknowledged` /
`AuthSignalAcknowledged`) together with `apiClient.resetUnauthorizedSignal()`.

## Taxonomy

`.router.dart` and `.bloc.dart`/`.event.dart`/`.state.dart` are the current
navigation/state roles (registered in `CLAUDE.md` §1, enforced by
`tool/check_taxonomy.dart`, `apps/*` only). `.navigator.dart` is **deprecated** —
removed from `client_app` in Phase 2; tolerated only in the `business_app` /
`stylist_app` stubs.

## Not implemented

Deep links, notification-driven navigation, nested navigation, and route-level
analytics. See `navigation/guards.md` for the guard gap.
