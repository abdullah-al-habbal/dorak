---
nodeid: skills.backend.laravel-native-abstractions.references.eloquent-persistence.part-3
parentnode: skills.backend.laravel-native-abstractions.references.eloquent-persistence
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 4 · [Eloquent: Persistence, Cardinality, Bulk Work, Transactions](eloquent-persistence.md) · [Previous](eloquent-persistence-part-2.md) · [Next](eloquent-persistence-part-4.md)

`sole()` throws `MultipleRecordsFoundException` / `RecordsNotFoundException`. Use it where
"exactly one" is a domain invariant, so a data problem fails loudly instead of silently
picking a row.

---

## Bulk and large-data processing

Never load a large result set with `get()` just to loop it.

```php
BookingModel::query()
    ->where('status', BookingStatusEnum::Pending)
    ->lazyById()
    ->each(function (BookingModel $booking): void {
        // one model in memory at a time
    });
```

| Traversal | Use when |
|---|---|
| `chunk($size, $cb)` | Read-only pass, stable ordering, offset paging acceptable |
| `chunkById($size, $cb)` | Rows may be **updated or deleted** during the pass |
| `each($cb)` / `eachById($cb)` | Same as above with a per-model callback |
| `lazy()` | Streaming a `LazyCollection`, read-only |
| `lazyById()` | Streaming while rows mutate |
| `cursor()` | Single query, one hydrated model at a time (no chunking) |

Use the `*ById` variants whenever the loop modifies a column used in the `where` or `order`
clause — offset-based chunking silently skips rows in that case.

Prefer a set-based update when per-model events, casts, and observers are **not** required:

```php
BookingModel::query()
    ->where('status', BookingStatusEnum::Pending)
    ->where('starts_at', '<', now())
    ->update(['status' => BookingStatusEnum::Expired]);
```

A mass `update()` / `delete()` fires no model events. If domain side effects are required,
dispatch an explicit domain operation or process models individually.

`increment()` / `decrement()` / `incrementEach()` push the arithmetic into the database and
avoid read-modify-write races:

```php
BranchModel::query()->whereKey($branchId)->increment('views');
BranchModel::query()->whereKey($branchId)->incrementEach(['views' => 1, 'shares' => 2]);
```

---
