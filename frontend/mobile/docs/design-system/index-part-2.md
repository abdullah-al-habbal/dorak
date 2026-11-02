---
nodeid: mobile.design-system.part-2
parentnode: mobile.design-system
childnodes: []
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

Part 2 of 2 · [Design System — States & Loading Components](index.md) · [Previous](index.md)

## Deliberately empty

| File | Reason |
|---|---|
| `states/permission_required.md` | No permission mechanism exists in the workspace (no `permission_handler`, `geolocator`, or `connectivity_plus`) and no production consumer. Deferred by Track 12; owner is Tracks 13/14, triggered by Discovery 016. See `docs/index.md` §Track 12. |
| `states/success.md` | No component. Success is the absence of an error state. |
| `states/no_search_results.md` | A copy variant of the empty state (`StatusView`), not a component. |
| `components/shimmer/{card,list,profile}.md` | Compositions of `ShimmerBox`; built when their first consumer (016) needs them. |
| `components/loading/circular.md` | Framework `CircularProgressIndicator`; `AppLoader` is the wrapper. |
| `components/feedback/{snackbar,toast}.md` | Framework `SnackBar`; no wrapper warranted. |

## Paged<T> mapping (Track 09)

| `Paged<T>` | Render |
|---|---|
| `isFirstLoad` | `ShimmerBox` list skeleton or `AppLoader.page()` |
| `isLoadingMore` | `AppLoader.inline()` in the list footer |
| `isRefreshing` | `RefreshIndicator` |
| `isEmpty` | `StatusView` (neutral icon) |
| `hasFailedFirst` | `StatusView` with `colors.error` + retry action |
| `hasFailedMore` | `StatusBanner` in the footer + retry |
| `hasFailedRefresh` | `SnackBar` |
| `isEndOfList` | text line |

Track 12 stays `IN_PROGRESS` until Discovery 016 consumes these components.
