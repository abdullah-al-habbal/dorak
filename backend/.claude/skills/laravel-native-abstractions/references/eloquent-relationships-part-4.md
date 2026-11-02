---
nodeid: skills.backend.laravel-native-abstractions.references.eloquent-relationships.part-4
parentnode: skills.backend.laravel-native-abstractions.references.eloquent-relationships
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 7 · [Eloquent: Relationship-Aware Queries](eloquent-relationships.md) · [Previous](eloquent-relationships-part-3.md) · [Next](eloquent-relationships-part-5.md)

## `whereRelation()` vs `whereHas()`

Use `whereRelation()` for a single simple predicate:

```php
$orders = OrderModel::query()
    ->whereRelation('customer', 'is_active', true)
    ->get();
```

Use `whereHas()` when the related query needs multiple conditions, nested logic, or reusable
composition:

```php
$orders = OrderModel::query()
    ->whereHas('customer', function (Builder $query): void {
        $query
            ->where('is_active', true)
            ->where('country_code', 'SA');
    })
    ->get();
```

Use `whereDoesntHave()` for absence rather than hand-writing `NOT EXISTS`:

```php
$clients = ClientModel::query()->whereDoesntHave('bookings')->get();
```

---

## `withWhereHas()` — filter and load the same condition

Avoid the duplicated closure:

```php
// Avoid — the condition is written twice and can drift
$users = UserModel::query()
    ->whereHas('posts', fn (Builder $q) => $q->where('featured', true))
    ->with(['posts' => fn (Builder $q) => $q->where('featured', true)])
    ->get();
```

Prefer:

```php
$users = UserModel::query()
    ->withWhereHas('posts', function (Builder $query): void {
        $query->where('featured', true);
    })
    ->get();
```

For a single simple predicate use `withWhereRelation('posts', 'featured', true)`.

**Never use `with()` as a filtering mechanism.** `with()` constrains what is *loaded*, never
which parents are *returned*.

---
