---
nodeid: mobile.docs.part-5
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 5 of 13 · [Dorak Mobile — AI Execution Index](index.md) · [Previous](index-part-4.md) · [Next](index-part-6.md)

## Track 09 — State Management

**Status:** `IN_PROGRESS`

> Locked (Phase 2): **Pure Bloc** (`flutter_bloc`) is the canonical
> state-management architecture. UI emits events; `Bloc` owns business state;
> UI renders from state. No Riverpod, Provider or GetIt. `ChangeNotifier` is
> **not** a target pattern — the session layer runs on `SessionBloc` (pure
> `bloc`) with `ApiClient.unauthorizedStream` for the 401 signal, and the
> pagination notifiers were deleted. This track still owes the async / loading /
> empty / error / refresh conventions.

Objectives:

* Establish one canonical state-management architecture. — `DONE` (Pure Bloc;
  `packages/core` uses pure `bloc` by ADR 0001, `apps/*` use `flutter_bloc`)
* Async state conventions. — `DONE` (`docs/state-management/conventions.md`,
  `async-state.md`)
* Loading. — `DONE` (`isLoading` = reading, `isSubmitting` = user-initiated
  write; initial ≠ loading ≠ empty)
* Success. — `DONE` (absence of `error` plus data; no separate flag)
* Empty. — `DONE` (`success && data.isEmpty`, never rendered as an error)
* Error. — `DONE`. Failures land in `state.error`; blocs never rethrow; the app
  localizes via `AuthError.from` — a backend `message` is never rendered.
* Refresh. — `DONE` (`docs/state-management/refresh.md`; first-load vs
  load-more vs refresh, and refresh vs filter change)
* Pagination. — `IN_PROGRESS`. The `Paged<T>` contract exists in
  `packages/core/lib/src/network/` and is covered by `paged_test.dart`, but
  **no feature consumes it yet**. It stays `IN_PROGRESS` until Discovery (016)
  validates it. If 016 finds it does not fit, change `Paged<T>` rather than
  working around it.
* Background operations. — `PENDING`, deliberately undocumented. Nothing in
  Dorak performs background work; writing a contract for it would be fiction.
  `docs/state-management/background_operations.md` stays empty until Track 13
  creates something real.

Also carried by this track:

* `ApiClient.getPaginated` now validates the envelope like every other verb — a
  `success: false` body no longer returns a successful empty page.
* `OnboardingConfigBloc` retry guard fixed: a failed config load can be retried
  for the same locale.
* `LocaleBloc` keeps `Bloc<LocaleEvent, Locale>` under the documented
  single-value-state exemption (`conventions.md` §1a), now covered by tests.
* `bloc_concurrency` is **deliberately not a dependency** — the concurrency
  convention is written down; the package arrives with its first real consumer
  (`restartable()` for Discovery's search field).

Implementation targets:

```text
apps/*
packages/feature_*
```

---
