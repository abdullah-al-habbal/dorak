---
codeanchors:
  - backend/modules/
---

Part 5 of 7 · [Eloquent: Relationship-Aware Queries](eloquent-relationships.md) · [Previous](eloquent-relationships-part-4.md) · [Next](eloquent-relationships-part-6.md)

## Filter versus eager load

| Requirement | Preferred API |
|---|---|
| Orders belonging to one customer | `whereBelongsTo($customer)` or `$customer->orders()` |
| Orders whose customer is active | `whereRelation()` / `whereHas()` |
| Orders, then access `$order->customer` | `with('customer')` |
| Filter on active customer **and** include that customer | `withWhereHas('customer', ...)` |
| The one newest related model | `latestOfMany()` / `ofMany()` |
| Are these two models the same record? | `$model->is($other)` / `$model->isNot($other)` |

---

## Relationship aggregates and existence

Never load a relationship only to count it or test its presence.

```php
$users = UserModel::query()
    ->withCount('orders')
    ->withExists('subscription')
    ->get();

// $user->orders_count, $user->subscription_exists
```

Full set: `withCount()`, `withExists()`, `withSum()`, `withAvg()`, `withMin()`, `withMax()`,
`withAggregate()`. Constrained counts take a closure:

```php
->withCount(['orders as completed_orders_count' => fn (Builder $q) => $q->where('status', OrderStatusEnum::Completed)])
```

For models already hydrated, use the `load*` equivalents: `loadMissing()`, `loadCount()`,
`loadExists()`, `loadAggregate()`, `loadSum()`.

---
