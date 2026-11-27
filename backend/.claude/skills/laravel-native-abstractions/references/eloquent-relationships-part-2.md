---
codeanchors:
  - backend/modules/
---

Part 2 of 7 · [Eloquent: Relationship-Aware Queries](eloquent-relationships.md) · [Previous](eloquent-relationships.md) · [Next](eloquent-relationships-part-3.md)

```php
$orders = OrderModel::query()
    ->whereBelongsTo($customer, 'billingCustomer')
    ->get();
```

`orWhereBelongsTo()` exists for the disjunctive case:

```php
$query->whereBelongsTo($customer)->orWhereBelongsTo($otherCustomer);
```

**Do not** use `whereBelongsTo()` if no `belongsTo` relationship exists. Define the
relationship first, or write the query that matches the actual data model.

---

## Start from the known parent

When the parent is already in hand and the intent is "this parent's records", use its
relationship query:

```php
$orders = $customer->orders()
    ->where('status', OrderStatusEnum::Completed)
    ->latest()
    ->get();
```

Ownership-scoped creation:

```php
$order = $customer->orders()->create([
    'status' => OrderStatusEnum::Pending,
    'total_amount' => $totalAmount,
]);
```

Avoid setting the foreign key by hand when the relationship API expresses it:

```php
// Avoid
$order = OrderModel::create([
    'customer_id' => $customer->getKey(),
    'status' => OrderStatusEnum::Pending,
]);
```

---
