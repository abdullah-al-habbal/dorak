# Query Builder, Set-Based Persistence, and Raw SQL

---

## Eloquent or Query Builder?

Use **Eloquent** when the code operates on domain models and needs relationships, casts,
scopes, events, resources, or domain naming. That is the default in this repo — Resolvers
return models or paginators of models.

Use **Query Builder** (`DB::table(...)`) deliberately when the work is table-oriented and
model behaviour is not wanted:

- Reporting / aggregate reads that never hydrate a model.
- Bulk seeding and data movement (`modules/Core/Database/Seeders/Traits/BulkSeedable.php` is
  the existing precedent).
- Health checks (`modules/Core/Handlers/Shared/HealthCheckHandler.php`).

```php
$dailyTotals = DB::table('bookings')
    ->selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
    ->where('status', BookingStatusEnum::Completed->value)
    ->groupByRaw('DATE(created_at)')
    ->orderBy('date')
    ->get();
```

Note the `->value` — `DB::table()` has no casts, so enums must be unwrapped explicitly
(`enum_value($status)` also works).

---

## Set-based persistence

### `upsert()` instead of select-then-branch

Avoid:

```php
$existing = DB::table('prices')->where('sku', $sku)->first();

if ($existing) {
    DB::table('prices')->where('id', $existing->id)->update($data);
} else {
    DB::table('prices')->insert($data);
}
```

Prefer:

```php
DB::table('prices')->upsert([$data], ['sku'], ['price', 'updated_at']);
```

Requires a unique index on the conflict columns. Uniqueness is a database concern, not an
application one.

### `updateOrInsert()` for a single conditional row

```php
DB::table('clients')->updateOrInsert(
    ['email' => $email],
    ['name' => $name],
);
```

Do not `exists()` then branch unless the two paths have genuinely different business
behaviour.

### `insertOrIgnore()` — only when ignoring errors is the intent

Not a generic performance swap for `insert()`. Depending on the driver it can swallow more
than duplicate-key errors (type coercion, strict-mode violations). This repo uses it in
seeders, which is a fair use. Outside seeders, document why ignoring errors is safe.

### `insertUsing()` for data that already lives in the database

```php
DB::table('archived_bookings')->insertUsing(
    ['id', 'client_id', 'created_at'],
    DB::table('bookings')->select('id', 'client_id', 'created_at')->where('status', 'expired'),
);
```

Never pull thousands of rows into PHP just to write them back.

---

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

## Raw SQL rules

1. Never interpolate user input into SQL. Bind it.
   `selectRaw('... ?', [$value])`, `whereRaw('a > b * ?', [$multiplier])`.
2. `sprintf('%f', $userFloat)` is *coercion*, not binding. It is safe for floats but sets a
   pattern the next author will copy with a string. Prefer bindings in new code.
3. Every raw fragment carries a one-line comment saying why no Eloquent/Query Builder method
   fits.
4. Prefer `DB::raw()` inside `selectRaw`/`orderByRaw`/`havingRaw` over assembling a whole
   query string.
5. Raw expressions are not portable. If a fragment is MySQL-specific, say so in the comment.

---

## Pagination

Use the framework paginators; never hand-roll `LIMIT`/`OFFSET` plus a count query.

| Need | API |
|---|---|
| Page numbers and a total | `paginate($perPage)` → `LengthAwarePaginator` |
| Next/previous only, cheaper | `simplePaginate($perPage)` |
| Large or realtime data sets, stable under inserts | `cursorPaginate($perPage)` |

Cursor pagination requires a deterministic `orderBy` and cannot jump to an arbitrary page.
It is the right default for infinite-scroll feeds; `paginate()` stays right for admin tables
that show a page count.

Shape paginated output through `ApiResponseTrait`'s paginated helper — see
`api-response-standard`.
