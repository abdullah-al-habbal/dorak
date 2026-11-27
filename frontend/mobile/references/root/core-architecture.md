---
nodeid: mobile.references.root.core-architecture
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/src/
  - frontend/mobile/apps/client_app/lib/src/core/navigation/
---

# Mobile core architecture

Referenced from the [mobile guide](../../AGENTS.md).

### Networking — `packages/core/lib/src/network/`

`ApiClient` wraps Dio. Verbs: `get`, `post`, `put`, `patch`, `delete`,
`getPaginated`. Interceptor order: `Locale → [Auth] → [Logging] → Retry`.
Only idempotent methods are retried.

Base URL comes from `.env` (names in `.env.example`) — never hardcode it:

```
API_BASE_URL=https://dev-dorak-backend.io/api
API_BASE_URL_V1=https://dev-dorak-backend.io/api/v1
```

`.env` is gitignored; `.env.example` is committed.

**Response envelope** (every enveloped endpoint):

```json
{"success": bool, "statusCode": int, "code": "SUCCESS", "message": "...",
 "timestamp": "...", "data": ..., "meta": {...}, "errors": {...}}
```

`ApiClient` unwraps `data` and throws on failure. `data`/`meta`/`errors` keys
are **omitted entirely** when empty, not present-as-null.

**Exceptions** — a raw `DioException` never escapes `ApiClient`:

| Type | When |
|---|---|
| `ValidationException` | 422 `VALIDATION_FAILED`; `errors` is `Map<String, List<String>>` |
| `NetworkException` | transport failure; `statusCode` 0, `retryable` flag |
| `ApiException` | everything else; `isUnauthorized`/`isForbidden`/`isNotFound`/… |

### Storage — `packages/core/lib/src/storage/`

Device persistence lives here, behind abstract contracts so tests never touch a platform channel. For example,
`TokenStorage` (`SecureTokenStorage`) holds the Sanctum bearer token and `AppPreferences` holds
`dontShowOnboarding` as a synchronous getter that the launch gate reads without an await.

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
  Cancellation belongs to `bloc_concurrency` transformers.

Pagination state is `Paged<T>` (`packages/core/lib/src/network/paged.entity.dart`):
an immutable value object with named transitions (`loadingFirst`, `loadingMore`,
`refreshing`, `succeeded`, `failed`, `reset`) and **no public `copyWith`**, so a
feature bloc cannot get append-versus-replace wrong. There is no generic
`PaginationBloc`.

Staff apps use `StaffSessionBloc`. The client session aggregate is two pure `bloc`s (no Flutter dependency), both over
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

```
no stored token          -> guest
refreshToken() + profile -> persist rotated token, load the profile, authenticated
  401 / 403              -> clear token, guest
  NetworkException       -> authenticated, token kept
  other ApiException     -> authenticated, token kept
```

Auth-action failures surface in `state.error` (typed via `ErrorFeedback.from` in
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

`app.router.dart` holds the `go_router` table and redirects, `app_routes.entity.dart` the route paths, and
`app_gate.entity.dart` the post-splash choice (`AppGate.resolve`, a pure function).

Screens receive callbacks only. A bloc never navigates: the router moves in response to state.

### The launch gate

After the splash the gate awaits `session.ready`, then:

| Authenticated | Condition | Lands on |
|---|---|---|
| yes | profile completed | home |
| yes | profile not completed | profile completion |
| no | `dontShowOnboarding` set | home |
| no | otherwise | auth entry |
