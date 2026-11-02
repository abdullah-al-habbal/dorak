---
nodeid: mobile.references.root.core-architecture.part-3
parentnode: mobile.references.root.core-architecture
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 3 of 3 · [core architecture](core-architecture.md) · [Previous](core-architecture-part-2.md)

```
no stored token          -> guest
refreshToken() succeeds  -> persist rotated token, authenticated
  401 / 403              -> clear token, guest
  NetworkException       -> authenticated, token kept
  other ApiException     -> authenticated, token kept
```

Auth-action failures surface in `state.error` (typed via `AuthError.from` in
the app). `LogoutRequested` swallows the network failure and always clears local
state. `SendVerificationCodeRequested` errors are swallowed — registration
already succeeded. `SessionBloc` raises `sessionExpired` /
`authenticationRequired`, `AuthBloc` raises `loginSucceeded` /
`registrationSucceeded` / `verificationSucceeded`. The router subscribes to both
streams and acknowledges session signals via `SignalAcknowledged` and auth
signals via `AuthSignalAcknowledged`.

Unauthorized: `ApiClient` owns a broadcast `unauthorizedStream` (fires once per
401/403 burst until `resetUnauthorizedSignal()`). `client_app` forwards it to
`UnauthorizedDetected`; the bloc drops to `guest` + raises `sessionExpired`.

### Navigation — `apps/client_app/lib/src/core/navigation/`

| File | Owns |
|---|---|
| `app.router.dart` | `AppRouter` — the `go_router` route table + redirects |
| `app_routes.entity.dart` | route path constants (`/`, `/auth`, `/onboarding`, `/home`) |
| `app_gate.entity.dart` | `AppGate.resolve` — the post-splash branch, a pure function called from `AppRouter._leaveSplash` |

Screens receive callbacks only. They never know their neighbours. Bloc never
navigates: navigation happens through the router, driven by state via
redirects. **Routing lives in the router, never in a screen or a bloc.**

### The launch gate

```
Splash (2500 ms) -> AppGate.resolve (called from AppRouter._leaveSplash)
  await session.ready
  A. session.isAuthenticated        -> /home
  B. preferences.dontShowOnboarding -> /home
     otherwise                      -> /auth (entry)
```

| Scenario | authenticated | dontShowOnboarding | Lands on |
|---|---|---|---|
| New device | false | false | Auth Entry |
| Guest who saw the tour | false | true | Home |
| Returning logged-in user | true | ignored | Home |
| Just signed up | true | ignored | Home |
| Token revoked server-side | false (cleared) | as stored | B decides |
| Offline start with token | true (kept) | ignored | Home |

Authentication always outranks the onboarding flag.

---
