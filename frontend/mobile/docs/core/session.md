---
nodeid: mobile.core.session
parentnode: mobile.docs
childnodes:
  - mobile.core.session.part-2
  - mobile.core.session.part-3
  - mobile.core.session.part-4
  - mobile.core.session.part-5
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Session Management

Status: `DONE`

## Purpose

The session layer (`packages/core/lib/src/session/`) is split into two pure
`bloc`s — **no Flutter dependency**, both over `AuthRepository` +
`TokenStorage`:

* `AuthBloc` (`auth.bloc.dart` + `auth.event.dart` + `auth.state.dart`) owns the
  **active auth actions**: `LoginRequested`, `RegisterRequested`,
  `SendVerificationCodeRequested`, `VerifyEmailRequested`. It writes the returned
  token, exposes the signed-in `client`, and raises the matching `AuthSignal`.
* `SessionBloc` (`session.bloc.dart` + `session.event.dart` + `session.state.dart`)
  owns the **session truth**: `SessionBloc(AuthRepository, TokenStorage, ProfileRepository)`. It
  drives restore, logout, the unauthorized flow and signal acknowledgement. It
  has **no dependency on `AuthBloc`**: an `AuthBloc` success is coordinated by
  the app layer, which forwards it as `SessionAuthenticated(client)`
  (`session.event.dart`).

UI never calls either bloc directly; screens dispatch events and read state
through a `BlocBuilder`.

Success and failure never rethrow: auth actions emit `isSubmitting`, land
failures in `state.error`, and set a one-shot signal on success. The
app layer maps errors via `ErrorFeedback.from` and drives navigation from signals.

## State

`AuthStatus` (`auth_status.entity.dart`): `unknown | authenticated | guest`.

`unknown` is the pre-restore value. **Callers must not branch on it** — await
`ready` first.

## Continued in

- [Part 2: continued](session-part-2.md)
- [Part 3: Restoration](session-part-3.md)
- [Part 4: Mutations](session-part-4.md)
- [Part 5: Global signals](session-part-5.md)
