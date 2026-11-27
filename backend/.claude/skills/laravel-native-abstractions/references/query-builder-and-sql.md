---
codeanchors:
  - backend/modules/
---

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

## Continued in

- [Part 2: Set-based persistence](query-builder-and-sql-part-2.md)
- [Part 3: Intent-specific query methods](query-builder-and-sql-part-3.md)
- [Part 4: Raw SQL rules](query-builder-and-sql-part-4.md)
