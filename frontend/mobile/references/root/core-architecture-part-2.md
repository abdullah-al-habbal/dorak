---
nodeid: mobile.references.root.core-architecture.part-2
parentnode: mobile.references.root.core-architecture
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 2 of 3 · [core architecture](core-architecture.md) · [Previous](core-architecture.md) · [Next](core-architecture-part-3.md)

### Session — `packages/core/lib/src/session/`

**The canonical state contract is
[`docs/state-management/conventions.md`](../../docs/state-management/conventions.md)** —
Bloc/Event/State shape, `clearX` on every nullable field, loading vs submitting,
retry, refresh, pagination, concurrency latches, repository boundaries, and the
bloc/navigation separation. Read it before adding or changing any bloc.

Two conventions that are easy to get wrong and are already enforced by tests:

* **`copyWith` needs an explicit `clearX` flag for every nullable field.**
  `field ?? this.field` makes `null` unsettable — that shipped once as a session
  that resurrected itself after expiry.
* **Bloc's default event transformer is `concurrent()`.** A handler that can
  emit before its first `await` guards on state and must emit first; a handler
  that must await first needs a synchronous bool latch (`SessionBloc._expiring`).
  Cancellation belongs to `bloc_concurrency.restartable()`, which is
  **deliberately not a dependency yet** — it arrives with its first consumer.

Pagination state is `Paged<T>` (`packages/core/lib/src/network/paged.entity.dart`):
an immutable value object with named transitions (`loadingFirst`, `loadingMore`,
`refreshing`, `succeeded`, `failed`, `reset`) and **no public `copyWith`**, so a
feature bloc cannot get append-versus-replace wrong. There is no generic
`PaginationBloc`. It has no consumer yet — Discovery (016) will be the first.

The session aggregate is two pure `bloc`s (no Flutter dependency), both over
`AuthRepository` + `TokenStorage`:

* `AuthBloc` — active auth actions (`LoginRequested`, `RegisterRequested`,
  `SendVerificationCodeRequested`, `VerifyEmailRequested`). Emits `isSubmitting`,
  writes the returned token, exposes the `client`, raises the auth signals.
* `SessionBloc(AuthRepository, TokenStorage)` — session truth
  (`RestoreRequested`, `LogoutRequested`, `UnauthorizedDetected`,
  `RequireAuthentication`, `SignalAcknowledged`, `SessionAuthenticated`).
  `AuthStatus` is `unknown | authenticated | guest`; `unknown` is pre-restore and
  must never be branched on — `await session.ready` first.

The two blocs are **decoupled** — no bloc-to-bloc dependency. The app layer
coordinates them: it forwards every `AuthBloc` success into
`SessionBloc.add(SessionAuthenticated(client))` (the same wiring pattern as the
`unauthorizedStream` forward). `SessionState.signal` carries the one-shot
`SessionSignal` (`sessionExpired | authenticationRequired`);
`AuthState.signal` carries the one-shot `AuthSignal` (`loginSucceeded |
registrationSucceeded | verificationSucceeded`). The router subscribes to both
streams and acknowledges session signals via `SignalAcknowledged` and auth
signals via `AuthSignalAcknowledged`.

`RestoreRequested`:
