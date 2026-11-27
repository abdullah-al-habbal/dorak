---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Refresh

Screens with pull-to-refresh use `RefreshIndicator`.

---

## Three reloads, three renderings

They are different operations and must be distinguishable from state alone.
`Paged<T>` carries a `PageTrigger` for exactly this reason.

| Operation | Trigger | Items during | On failure |
|---|---|---|---|
| **First load** | `first` | none to show — full skeleton | full-screen error + retry |
| **Load more** | `more` | list stays, footer spinner | list stays, footer retry |
| **Refresh** | `refresh` | **list stays**, refresh indicator | **list stays**, transient notice |

The rule that ties them together: **refresh never flashes empty.** A user who
pulls to refresh is looking at content; replacing it with a skeleton and then
restoring it is a worse experience than a brief indicator over stale data. So
`Paged.refreshing()` keeps `items`, and only `succeeded()` replaces them.

## Refresh versus filter change

They look similar and behave differently.

| | Refresh | Filter / query change |
|---|---|---|
| Transition | `refreshing()` | `reset()` then `loadingFirst()` |
| Existing items | kept until the response lands | **discarded immediately** |
| Page | back to 1 | back to 1 |
| Rationale | same query, newer data | different query — showing old results under new filters is a lie |

For `/explore/branches`, the filters (`available_now`, `price_range`,
`rating_min`, `catalog_item_ids[]`, `radius`) are query parameters, so any change
is a new query and takes the `reset()` path.

## Failed refresh

Rule 26 in [`conventions.md`](./conventions.md): a failed refresh keeps the
existing list and surfaces a transient notice — a snackbar, not a full-screen
error. The user still has usable content; replacing it with an error page
destroys that for no gain.

`hasFailedRefresh` distinguishes this from `hasFailedFirst` (nothing to show,
full error) and `hasFailedMore` (footer retry).

## Continued in

- [Part 2: Concurrency](refresh-part-2.md)
