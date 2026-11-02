---
nodeid: mobile.packages.core.references.session
parentnode: mobile.packages.core
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 5. Session

The session layer is split into two pure `bloc`s — **no Flutter dependency**:

* `AuthBloc` (`auth.bloc.dart` + `auth.event.dart` + `auth.state.dart`) owns the
  **active auth actions**: `LoginRequested`, `RegisterRequested`,
  `SendVerificationCodeRequested`, `VerifyEmailRequested`. It takes `AuthRepository`
  + `TokenStorage` (the same storage `SessionBloc` shares), writes the returned
  token, exposes the signed-in `client`, and raises `loginSucceeded` /
  `registrationSucceeded` / `verificationSucceeded`. Failures land in `state.error`
  (typed via `AuthError.from` in the app). `AuthState` uses `isSubmitting`, not
  `isLoading`.
* `SessionBloc` (`session.bloc.dart` + `session.event.dart` + `session.state.dart`)
  owns the **session truth**: `SessionBloc(AuthRepository, TokenStorage)`. It
  drives `RestoreRequested` / `LogoutRequested` / `UnauthorizedDetected` /
  `RequireAuthentication` / `SignalAcknowledged`, plus `SessionAuthenticated`
  (dispatched by the app layer when `AuthBloc` succeeds). The two blocs are
  **decoupled** — `SessionBloc` has no `AuthBloc` dependency.

```dart
SessionState {
  AuthStatus status;       // unknown | authenticated | guest
  ClientDto? client;
  bool isAuthenticated;
  bool isLoading;
  Object? error;
  SessionSignal signal;    // none | sessionExpired | authenticationRequired
}
Future<void> get ready;    // memoised restore pass
```

`RestoreRequested`:

```
no stored token          -> guest
refreshToken() succeeds  -> persist rotated token, authenticated
  401 / 403              -> clear token, guest
  NetworkException       -> authenticated, token kept
  other ApiException     -> authenticated, token kept
```

`LogoutRequested` swallows the network failure and always clears local state.
`SendVerificationCodeRequested` (on `AuthBloc`) swallows errors (registration
already succeeded). Auth-action failures land in `state.error`; success sets the
matching `AuthSignal`, which the app's router consumes and acknowledges via
`AuthSignalAcknowledged`. `UnauthorizedDetected` dedupes against an already-raised
`sessionExpired` and drops to `guest`.

The router subscribes to **both** blocs: session signals (`sessionExpired`,
`authenticationRequired`) route from `SessionBloc`, auth signals
(`loginSucceeded`, `registrationSucceeded`, `verificationSucceeded`) route from
`AuthBloc`. Session-only signals are acknowledged with `SignalAcknowledged`;
auth-only signals with `AuthSignalAcknowledged`.

Unauthorized is signalled separately: `ApiClient.unauthorizedStream` fires
**once per burst** of 401/403 on authenticated, non-lifecycle requests, then
stays silent until `resetUnauthorizedSignal()`. `client_app` forwards it to the
session bloc.
