---
codeanchors:
  - backend/modules/
---

Part 3 of 4 · [Query Builder, Set-Based Persistence, and Raw SQL](query-builder-and-sql.md) · [Previous](query-builder-and-sql-part-2.md) · [Next](query-builder-and-sql-part-4.md)

## Intent-specific query methods

Prefer:

```php
BookingModel::query()->whereKey($bookingId)->first();
BookingModel::query()->whereIn('status', $statuses)->exists();
BookingModel::query()->pluck('id');
BookingModel::query()->count();
```

Avoid:

```php
BookingModel::query()->where('id', $bookingId)->get()->first();
BookingModel::query()->whereIn('status', $statuses)->get()->isNotEmpty();
BookingModel::query()->get()->map->id;
BookingModel::query()->get()->count();
```

---

## Specialized `where` clauses

Search for a dedicated clause before reaching for `whereRaw`. Verified present in 13.20:

| Intent | API |
|---|---|
| Any of several columns matches | `whereAny([...], $op, $value)` |
| All of several columns match | `whereAll([...], $op, $value)` |
| None of several columns match | `whereNone([...], $op, $value)` |
| Primary key(s) | `whereKey()`, `whereKeyNot()` |
| Column vs column | `whereColumn()` |
| Between / not between | `whereBetween()`, `whereNotBetween()`, `whereBetweenColumns()` |
| Date parts | `whereDate()`, `whereMonth()`, `whereDay()`, `whereYear()`, `whereTime()`, `wherePast()`, `whereFuture()` |
| JSON | `whereJsonContains()`, `whereJsonContainsKey()`, `whereJsonLength()` |
| Full text | `whereFullText()` (MySQL / Postgres grammars) |
| Subquery existence | `whereExists()`, `whereNotExists()` |
| Compare against a subquery | `where('col', fn ($q) => ...)`, `whereIn('col', fn ($q) => ...)` |
| Conditional clause | `when($condition, fn ($q) => ...)` |
| Derived table | `fromSub()`, `joinSub()`, `selectSub()` |

`when()` replaces the `if ($filter) { $query->where(...) }` ladder that filter-building
Resolvers accumulate.

---
