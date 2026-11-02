---
nodeid: mobile.state-management.refresh.part-2
parentnode: mobile.state-management.refresh
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 2 · [Refresh](refresh.md) · [Previous](refresh.md)

## Concurrency

Refresh and load-more must not run together. Both go through the same guard:

```dart
if (state.results.isBusy) return;
```

emitted **before the first `await`** — see [`conventions.md`](./conventions.md)
§8. `isBusy` is true for all three triggers, so any in-flight operation blocks
the others.

A refresh arriving while a load-more is in flight is therefore **dropped**, not
queued. That is deliberate: the load-more response will land and the user can
pull again. Queueing would need cancellation semantics, which is
`bloc_concurrency.restartable()` — not yet a dependency (§8 rule 32).

## Non-paginated refresh

A bloc without pagination re-dispatches its load event. The retry guard must not
block it — see [`async-state.md`](./async-state.md). `OnboardingConfigBloc`
refetches when the locale changes, which is the same mechanism.

## Verification

```bash
cd frontend/mobile
dart run melos run test
```

Transition behaviour is covered by `packages/core/test/paged_test.dart` —
specifically that `succeeded` after `refreshing()` replaces rather than appends,
and that `failed` keeps the loaded items.
