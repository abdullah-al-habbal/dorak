---
nodeid: mobile.navigation.guards
parentnode: mobile.docs
childnodes:
  - mobile.navigation.guards.part-2
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Guards

Status: `IN_PROGRESS` — the launch gate exists; per-route guards do not.

## What exists: the launch gate

`AppGate.resolve` is the only guard in the app. It runs once, after the splash,
and picks the first real screen from two checks in strict order — session first,
onboarding flag second. Full table in `flows/app-launch.md`.

`AppGate.resolve` is a **pure function** (`app_gate.entity.dart`) called from
`AppRouter._leaveSplash` once `session.ready` completes. It is deliberately not
inside `_redirect` — the splash has to hold for its animation, which a redirect
cannot express. `_redirect` does one thing only: hold on `/splash` while
`SessionState.status` is `unknown`.

It guards **entry into the app**, not individual routes.

Key properties:

- `await session.ready` before branching. `AuthStatus.unknown` is never a valid
  input to a decision.
- Authentication outranks the onboarding flag unconditionally.
- A failed restore (401/403) is not an error state — the token is cleared and the
  device is treated as a guest, falling through to the onboarding check.
- A transport failure during restore keeps the session (Sanctum tokens do not
  expire server-side).

## What does not exist

- **Per-route auth guards.** No screen refuses to build for a guest. Nothing
  currently needs to — Home is a placeholder — but any authenticated feature
  screen will need one. The mechanism to express it exists: a guest-guarded
  action adds `RequireAuthentication` to the session bloc, which raises the
  `authenticationRequired` signal.
- **Profile-completion guards** (Track 17).
- **Deep-link guards.** Deep links are not implemented at all.

## Continued in

- [Part 2: Session-expired handling (DONE)](guards-part-2.md)
