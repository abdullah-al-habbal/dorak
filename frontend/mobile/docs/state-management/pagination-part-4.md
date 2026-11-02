---
nodeid: mobile.state-management.pagination.part-4
parentnode: mobile.state-management.pagination
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 4 of 5 · [Pagination](pagination.md) · [Previous](pagination-part-3.md) · [Next](pagination-part-5.md)

### Transitions — there is no public `copyWith`

`Paged` exposes named transitions instead. They encode the rules, so a feature
bloc cannot get append-versus-replace wrong, and there are no nullable setters
to reproduce the `client: null` no-op defect.

| Transition | Effect |
|---|---|
| `loadingFirst()` | `loading` + `first`, error cleared, items kept |
| `loadingMore()` | `loading` + `more`, error cleared, items kept |
| `refreshing()` | `loading` + `refresh`, error cleared, **items kept** so the list never flashes empty |
| `succeeded(PaginatedData<T>)` | `more` → **appends**; `first` / `refresh` → **replaces**. Always adopts the new `meta`. `success`, error cleared |
| `failed(Object)` | `failure`, records the error, **keeps items and meta**, leaves `trigger` so the UI knows which operation failed |
| `reset()` | back to `initial` — the filter/query-change path |

### Equality

`props` compares `PaginationMeta`'s **fields**, not the instance.
`PaginationMeta` is a plain `json_serializable` DTO with no value equality, so
two structurally identical pages decoded from separate responses would otherwise
compare unequal and re-trigger every listener. Do not collapse that back to
`meta`.

## 5. UI decision matrix

Every state Stitch 016 §39 requires, from one object. The concrete components
are Track 12's (`design_system`): see `docs/design-system/index.md`.

| Condition | Render | Component |
|---|---|---|
| `isFirstLoad` | full-screen skeleton | `ShimmerBox` list or `AppLoader.page()` |
| `isLoadingMore` | list + footer spinner | `AppLoader.inline()` |
| `isRefreshing` | list + refresh indicator | `RefreshIndicator` (framework) |
| `hasFailedFirst` | full-screen error + retry | `StatusView` + `l10n.actionRetry` |
| `hasFailedMore` | list + footer retry | `StatusBanner` + retry action |
| `hasFailedRefresh` | transient notice | `SnackBar` (framework) |
| `isEmpty` | empty state — **not** an error | `StatusView` (neutral copy) |
| `isEndOfList` | end-of-list marker | text line — no component warranted |
