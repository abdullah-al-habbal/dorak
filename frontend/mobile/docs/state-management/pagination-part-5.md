---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 5 of 5 · [Pagination](pagination.md) · [Previous](pagination-part-4.md)

## 6. Rules

1. Load-more appends. Refresh and filter-change replace.
2. **Any filter or query change calls `reset()` and refetches page 1** —
   `/explore/branches` filters are query parameters.
3. A failed next page never discards loaded items.
4. `hasMore` is derived, never stored.
5. Page size is a per-feature constant; the backend caps `per_page` at 100.
6. **Load-more dedupe uses a state guard, emitted before the first `await`**
   (see [`conventions.md`](./conventions.md) §8). A scroll fling dispatches the
   event repeatedly.

## 7. Feature bloc shape

Illustrative. Discovery is **not** implemented — this is the pattern 016 will
follow.

```dart
Future<void> _onLoadMore(LoadMoreRequested e, Emitter<DiscoveryState> emit) async {
  if (state.results.isBusy) return;
  if (!state.results.hasMore) return;

  emit(state.copyWith(results: state.results.loadingMore()));  // before any await

  try {
    final next = await _repository.fetchBranches(
      page: state.results.meta.currentPage + 1,
      filters: state.filters,
    );
    emit(state.copyWith(results: state.results.succeeded(next)));
  } catch (e) {
    emit(state.copyWith(results: state.results.failed(e)));
  }
}
```

## Verification

```bash
cd frontend/mobile
dart run melos run test
```

`packages/core/test/paged_test.dart` covers the boundaries — `hasMore` at
mid-list / last page / empty, `isEmpty` only on success-with-no-items, append
versus replace, failure keeping items, `reset`, and structural equality.
`packages/core/test/api_client_test.dart` covers the envelope guard.
