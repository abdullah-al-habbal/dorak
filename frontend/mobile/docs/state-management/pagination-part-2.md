---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 5 · [Pagination](pagination.md) · [Previous](pagination.md) · [Next](pagination-part-3.md)

There is no `/client/discovery-feed` route. `/client/discovery-preferences` is a
separate preferences resource, not the feed.

## 2. What core provides

```dart
final page = await api.getPaginated<BranchDto>(
  '/explore/branches',
  queryParameters: {'page': 2, 'per_page': 15, 'latitude': …},
  itemParser: (json) => BranchDto.fromJson(json as Map<String, dynamic>),
);

page.data;              // List<T>   — the field is `data`, not `items`
page.meta.currentPage;  // 1-based
page.meta.perPage;
page.meta.totalPages;
```

`getPaginated` validates the envelope like every other verb: a `success: false`
body or a `statusCode >= 400` **throws**. An API or network failure is never
converted into a successful empty page — that distinction is the whole point of
the empty state.

## 3. Modes Dorak actually needs

| Mode | Needed | Note |
|---|---|---|
| Numbered pages | **No** | No screen in Stitch 010–020 shows page numbers. `currentPage` is still carried, so a numbered UI remains possible without a contract change. |
| Load-more / infinite | **Yes** | The only mode any real screen uses |
| Pull-to-refresh | **Yes** | Stitch 016 §38 |
| Retry | **Yes** | Separately for the first page and the next page |
| Empty | **Yes** | Must not look like an error |
| End-of-list | **Yes** | Derived, never stored |
