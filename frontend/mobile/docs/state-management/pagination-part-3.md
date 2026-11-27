---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 3 of 5 · [Pagination](pagination.md) · [Previous](pagination-part-2.md) · [Next](pagination-part-4.md)

## 4. `Paged<T>`

`packages/core/lib/src/network/paged.entity.dart` — an immutable value object.
No bloc, no Flutter, no JSON. A feature state **holds one as a field**:

```dart
class DiscoveryState extends Equatable {
  final Paged<BranchDto> results;
  final DiscoveryFilters filters;
}
```

```dart
enum PageStatus  { initial, loading, success, failure }
enum PageTrigger { first, more, refresh }

class Paged<T> {
  List<T>        items
  PaginationMeta meta
  PageStatus     status
  PageTrigger    trigger    // which operation is in flight, or last completed
  Object?        error
}
```

### Derived getters

```
hasMore          meta.currentPage < meta.totalPages
isEmpty          success and no items
isEndOfList      items present and no further pages
isBusy           status == loading            <- the load-more guard
isFirstLoad      loading + first
isLoadingMore    loading + more
isRefreshing     loading + refresh
hasFailedFirst   failure + first
hasFailedMore    failure + more
hasFailedRefresh failure + refresh
```
