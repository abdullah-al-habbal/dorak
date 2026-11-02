---
nodeid: mobile.navigation.routes
parentnode: mobile.docs
childnodes:
  - mobile.navigation.routes.part-2
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Routes

Status: `IN_PROGRESS` — go_router route table in place; deep links and nested
navigation not yet.

## Approach

**`go_router` only** — declarative route table with redirects. No Navigator 1.0,
no `AppNavigator`, no named-route strings. Navigation lives in
`apps/client_app/lib/src/core/navigation/`:

| File | Owns |
| --- | --- |
| `app.router.dart` | `AppRouter` — constructs the `GoRouter`, owns the redirect, the launch gate (`AppGate.resolve`) and the session/auth signal listeners, plus all flow wiring (`router.push/go` passed into screens as callbacks) |
| `app_routes.entity.dart` | `AppRoutes` — path constants (`/splash`, `/auth`, `/auth/login`, `/auth/register`, `/auth/verify`, `/onboarding/welcome|discovery|booking|ai-style`, `/home`) |
| `app_gate.entity.dart` | `AppGate.resolve` — the post-splash branch, a pure function called from `AppRouter._leaveSplash` (**not** from the redirect) |

Screens receive callbacks only and know nothing about their neighbours. Bloc
never navigates — routing responds to state through the router's redirect and
listener. **Routing lives in the router, never in a screen or a bloc.**

## The route table

```
/splash                          SplashScreen
/onboarding/welcome              -> push /onboarding/discovery ... -> /home
/onboarding/ai-style             -> context.go('/home') when finished
/auth                            AuthEntry (Continue as Guest -> go /onboarding/welcome)
/auth/login  (parent: /auth)     -> context.go('/home') on success
/auth/register (parent: /auth)   -> push /auth/verify on success
/auth/verify  (parent: /auth)    -> context.go('/home') on success or skip
/auth/forgot-password            (parent: /auth)  -> push .../otp on codeSent
/auth/forgot-password/otp        -> push /auth/reset-password on codeAccepted
/auth/reset-password             (parent: /auth)  -> push .../success on passwordReset
/auth/reset-password/success     -> go /auth/login  (go, so the stack is dropped)
/home                            legacy alias -> redirects to the shell (Discover tab)
```

Password recovery (Stitch 011–014) is driven by `RecoverySignal`, a third one-shot
signal alongside `SessionSignal` and `AuthSignal`. Its wrinkle is worth knowing
before touching it: the backend has no verify-reset-code endpoint, so the OTP screen
cannot validate the code and a rejected code surfaces on `/auth/reset-password`. See
`authentication/password-recovery.md`.

Flow wiring lives in `AppRouter._routes()`: each `GoRoute` receives callbacks
(`onNext`, `onSkipForNow`, `onLogin`, ...) that the router implements with
`router.push`/`router.go`. `context.go('/home')` clears the stack by
construction — there is no `pushAndRemoveUntil` bookkeeping.

## Continued in

- [Part 2: The redirect and the three listeners](routes-part-2.md)
