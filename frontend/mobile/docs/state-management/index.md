---
nodeid: mobile.state-management
parentnode: mobile.docs
childnodes:
  - mobile.state-management.async-state
  - mobile.state-management.conventions
  - mobile.state-management.pagination
  - mobile.state-management.refresh
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# State Management

Architecture: **Pure Bloc** + **go_router**. Locked.

Start with [`conventions.md`](./conventions.md) — it is the canonical contract.
Everything else on this page elaborates one part of it.

---

## Map

| Document | Covers |
|---|---|
| [`conventions.md`](./conventions.md) | **The contract.** Bloc/Event/State, loading, success, empty, error, retry, refresh, pagination, concurrency, repository boundaries, UI rules, navigation separation, testing |
| [`async-state.md`](./async-state.md) | The five async conditions, `isLoading` vs `isSubmitting`, the `_run` idiom, error mapping, the retry-guard trap |
| [`refresh.md`](./refresh.md) | First-load vs load-more vs refresh; refresh vs filter change; failed refresh |
| [`pagination.md`](./pagination.md) | The `Paged<T>` contract, the real backend envelope, the UI decision matrix |

## The short version

- **Pure Bloc.** Every state change is an event. No Cubit (the code differs: backlog BD-17).
- **No `ChangeNotifier` application state, no Provider, no Riverpod, no GetIt.**
- Shared infrastructure blocs live in `packages/core` with pure `bloc`
  ([ADR 0001](../architecture/decisions/0001-bloc-in-core.md)); feature blocs
  live in their owning app and may use `flutter_bloc`. Core never gets
  `flutter_bloc` or `go_router`.
- **One flat `Equatable` state class per bloc**, with an explicit `clearX` flag
  for every nullable field.
- **Blocs never navigate.** Navigation reacts to a one-shot signal consumed by
  `AppRouter`.
- Errors are state, not exceptions to rethrow. The UI localizes them; a backend
  `message` is never rendered.
