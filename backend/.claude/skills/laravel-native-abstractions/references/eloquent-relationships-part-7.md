---
nodeid: skills.backend.laravel-native-abstractions.references.eloquent-relationships.part-7
parentnode: skills.backend.laravel-native-abstractions.references.eloquent-relationships
childnodes: []
codeanchors:
  - backend/modules/
---

Part 7 of 7 · [Eloquent: Relationship-Aware Queries](eloquent-relationships.md) · [Previous](eloquent-relationships-part-6.md)

## Eager loading is deliberate

```php
$orders = OrderModel::query()
    ->whereBelongsTo($customer)
    ->with([
        'customer:id,name',
        'items:id,order_id,product_id,quantity',
        'items.product:id,name',
    ])
    ->latest()
    ->get();
```

- Load a relationship only when it will be accessed or serialized.
- Select only the needed columns — but always keep the key columns Eloquent needs to match
  records (the local key on the parent, the foreign key on the child).
- Prefer `whenLoaded()` in API Resources so an unloaded relation is omitted rather than
  lazy-loaded (see `references/context-container-resources.md`).

---

## N+1

Avoid:

```php
$orders = OrderModel::query()->get();

foreach ($orders as $order) {
    $name = $order->customer->name; // one query per row
}
```

Prefer:

```php
$orders = OrderModel::query()->with('customer:id,name')->get();
```

**Repo state:** strict mode is not enabled anywhere in this codebase, so lazy loading is
silent. Check query counts yourself, or opt in locally while developing:

```php
// modules/Core/Providers/*ServiceProvider::boot()
Model::shouldBeStrict(! app()->isProduction());
```

`shouldBeStrict()` enables all three guards at once:
`preventLazyLoading()`, `preventSilentlyDiscardingAttributes()`,
`preventAccessingMissingAttributes()`. They can also be toggled individually.

Never disable a guard to hide an N+1 or a missing-column defect — fix the query.
