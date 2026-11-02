---
nodeid: mobile.core.networking.part-3
parentnode: mobile.core.networking
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 3 of 3 · [Networking](networking.md) · [Previous](networking-part-2.md)

## Pagination

Backend paginated responses carry `meta.pagination`:

```json
{"total": 25, "count": 2, "per_page": 15, "current_page": 1, "total_pages": 2}
```

Decode with `getPaginated`, which returns `PaginatedData<T>`:

```dart
page.data;              // List<T> — the field is `data`, not `items`
page.meta.currentPage;  // 1-based
page.meta.perPage;
page.meta.totalPages;
```

`getPaginated` validates the envelope like every other verb — a `success: false`
body or `statusCode >= 400` **throws**. An API or network failure is never
turned into a successful empty page; that distinction is what makes an empty
state meaningful.

Paging **state** is app-layer Bloc work over the `Paged<T>` contract — the
legacy `PagePaginationNotifier` / `ScrollPaginationNotifier` `ChangeNotifier`s
were deleted in Phase 4 (see `state-management/pagination.md`).

## Repositories

Network calls live behind repository interfaces (`*.repository.dart`),
e.g. `OnboardingConfigRepository` + `DioOnboardingConfigRepository`.
`DioOnboardingConfigRepository` caches per locale in memory.

## Verification

```bash
melos run analyze
melos run test
```
