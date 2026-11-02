---
nodeid: mobile.apps.client-app.runtime.app-lifecycle.part-3
parentnode: mobile.apps.client-app.runtime.app-lifecycle
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 3 of 4 · [Application Lifecycle — Dorak Client App (apps/client_app)](app-lifecycle.md) · [Previous](app-lifecycle-part-2.md) · [Next](app-lifecycle-part-4.md)

### The two guards

**`status == AuthStatus.unknown` → skip.** The startup restore owns that status.
`SessionBloc.ready` memoises its restore (`_restoration ??= …`) and the splash
awaits it; a concurrent second restore would resolve the session twice behind
that completer. The startup probe is already in flight, so the resume probe has
nothing to add.

**`isLoading` → skip.** A restore or a logout is already running. `SessionBloc`
uses Bloc's default `concurrent()` event transformer, so a second
`RestoreRequested` would overlap the first rather than queue behind it — two
`refreshToken()` calls and two interleaved emits.

Deliberately **not** a guard: `status == guest`. It is true today that a guest has
no token, so the probe is a single storage read and no network call. But that
fact lives in `SessionBloc._onRestore`, and duplicating it in the app layer would
turn a future change there into a silent bug here. The bloc stays the single
source of truth for what a stored token means.

### Why not in `build`

The listener is constructed in `initState` and destroyed in `dispose`. It is never
touched from `build`, so the locale-toggle rebuild (`BlocBuilder<LocaleBloc>`) and
every other rebuild cannot create a second observer or fire a second probe.

## 4. Interaction with existing behaviour

**Splash / startup — unchanged.** `AppRouter._redirect` only forces the splash
while `status == AuthStatus.unknown`. `_onRestore` never returns to `unknown` — it
seeds `guest` and emits `guest` or `authenticated` — so a resume probe cannot
re-enter the splash. `session.ready` is memoised and is not re-awaited.

**Session expiry — unchanged.** The resume probe reuses `_onRestore`, which for a
revoked token clears storage and resolves to `guest` **without** raising
`SessionSignal.sessionExpired`. That is the pre-existing cold-start contract,
pinned by `test/session_expired_test.dart` → *"a revoked token at restore does not
raise sessionExpired"*. The resume path inherits it rather than inventing a second
expiry semantics.

The consequence is stated plainly: **a resume probe that finds a dead token
resolves the session to guest but does not navigate.** The user stays on whatever
route they were on. Route-level enforcement is Track 11 (*Authentication guards —
`PARTIAL`; there are no per-route guards*), not Track 10. See §6.

**Repeated resumes.** Each background→foreground round-trip probes once. There is
no debounce and no minimum interval; the guards make an overlapping probe
impossible, and a resume is a user-scale event, not a frame-scale one.
