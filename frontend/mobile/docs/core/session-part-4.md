---
nodeid: mobile.core.session.part-4
parentnode: mobile.core.session
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 4 of 5 · [Session Management](session.md) · [Previous](session-part-3.md) · [Next](session-part-5.md)

## Mutations

`LoginRequested`, `RegisterRequested`, `VerifyEmailRequested` (on `AuthBloc`)
go through a shared `_run` helper: emit `isSubmitting`, run the action, then
emit the success state + signal, or emit `error` on failure. Screens observe
`state.error` / `state.isSubmitting` through a `BlocBuilder`.

`LogoutRequested` (on `SessionBloc`) is the exception: it swallows the network
failure, always clears local storage, and emits a fresh `guest` state.

Verification-code dispatch has **two paths with different error semantics**:

- **During registration**, `_onRegister` awaits `sendEmailVerification()` itself
  and swallows any failure — registration already succeeded and the token is
  stored, so a failed dispatch must not block the verify screen. This is done
  inside the handler, not by the router dispatching a second event, because two
  events of different types are processed concurrently and the ordering against
  `AuthSignalAcknowledged` would not be guaranteed.
- **A user-initiated `SendVerificationCodeRequested`** (the Resend button) runs
  through `_run` like any other action: `isSubmitting` toggles and a failure
  lands in `state.error` so the screen can show it. A resend that fails
  silently is a defect.

`RegisterRequested` requires `passwordConfirmation` — the backend applies
Laravel's `confirmed` rule and rejects the request without it.

## Token attachment

`ApiClient` receives `tokenProvider: tokenStorage.read`, which activates
`AuthInterceptor`. The provider reads storage directly rather than the bloc, so
`SessionBloc -> ApiClient` stays a one-way dependency.
