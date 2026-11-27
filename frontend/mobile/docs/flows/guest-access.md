---
nodeid: mobile.flows.guest-access
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Guest Access


## What a guest is

A guest is a device with **no stored token**: `SessionBloc.state.status ==
AuthStatus.guest`. There is no guest account, no anonymous token, and no
server-side guest session — the client simply sends no `Authorization` header
(`AuthInterceptor` omits it when `tokenProvider` returns null).

## Becoming a guest

- Never signed in.
- Tapped **"Continue as Guest"** on the auth entry screen.
- Had a token that the backend rejected on restore (401/403) — the token is
  cleared and the device drops back to guest.
- Logged out.

## What a guest reaches

"Continue as Guest" starts the onboarding tour (see `flows/onboarding.md`); every
exit from that tour lands on Home. A guest that has already dismissed or
completed the tour goes straight to Home from the launch gate.

A guest uses the tabbed shell. An action that needs an account sends `RequireAuthentication`, which opens sign-in on
top ([guards](../navigation/guards.md)). Nothing is carried over when a guest later signs in.

## Verification

```bash
cd apps/client_app && flutter test test/app_gate_test.dart
```
