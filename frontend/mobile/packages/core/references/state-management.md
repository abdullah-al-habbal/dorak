# State management

Referenced from [`../CLAUDE.md`](../CLAUDE.md) §5.

Session state lives **in this package as pure `bloc`s** — `SessionBloc`,
`SessionEvent`, `SessionState`, `SessionSignal` plus the auth split `AuthBloc`,
`AuthEvent`, `AuthState`, `AuthSignal` (no Flutter dependency). The session
aggregate is two independent blocs: `AuthBloc` owns active auth actions
(login/register/verify/resend) and shares `TokenStorage`; `SessionBloc(AuthRepository, TokenStorage)`
owns session truth (restore/logout/unauthorized/ack). The two are **decoupled**:
the app layer forwards an auth success to `SessionBloc` via
`SessionAuthenticated(client)` — no bloc-to-bloc dependency. `SessionState` uses
`SessionSignal` (`sessionExpired | authenticationRequired`); `AuthState` uses
`AuthSignal` (`loginSucceeded | registrationSucceeded | verificationSucceeded`).
The unauthorized signal lives on `ApiClient` as a broadcast `unauthorizedStream`
(fires once per 401/403 burst until reset). The former `ChangeNotifier` layer
(`SessionController`, `UnauthorizedNotifier`) and the pagination notifiers were
removed in Phase 4. **Do not add `ChangeNotifier` state here.**

Convention: success sets the owning bloc's signal for the router; failures land
in `state.error` — screens map via `AuthError.from` (app layer). No Riverpod,
Provider or GetIt anywhere.

**The canonical contract is
[`docs/state-management/conventions.md`](../../../docs/state-management/conventions.md)** —
Bloc/Event/State shape, `clearX` flags on every nullable field, loading vs
submitting, retry, refresh, concurrency latches, and testing. Read it before
adding or changing a bloc here.

Pagination state uses `Paged<T>`
(`lib/src/network/paged.entity.dart`) — an immutable value object with named
transitions and **no public `copyWith`**. There is no generic `PaginationBloc`.
See [`docs/state-management/pagination.md`](../../../docs/state-management/pagination.md).
