---
codeanchors:
  - backend/modules/
---

# Eloquent: Relationship-Aware Queries

Laravel relationships are **query semantics**, not just object navigation. If a relationship
already expresses the association, use it. Do not duplicate its foreign-key constraint.

All APIs below verified in `vendor/laravel/framework/src/Illuminate/Database/Eloquent/Concerns/QueriesRelationships.php`
(Laravel 13.20.0).

---

## `whereBelongsTo()`

Signature: `whereBelongsTo($related, $relationshipName = null, $boolean = 'and')`.
Accepts a single model **or** an `Illuminate\Database\Eloquent\Collection` ("belongs to any of
these parents").

Avoid:

```php
$orders = OrderModel::query()
    ->where('customer_id', $customer->id)
    ->where('status', OrderStatusEnum::Completed)
    ->latest()
    ->get();
```

Prefer:

```php
$orders = OrderModel::query()
    ->whereBelongsTo($customer)
    ->where('status', OrderStatusEnum::Completed)
    ->latest()
    ->get();
```

Appropriate when:

- The queried model defines a `belongsTo` relationship to the supplied model.
- The query starts from the child model.
- The relationship name is unambiguous.
- The association should stay correct if the foreign-key column is ever renamed.

Name the relation explicitly when several relationships target the same model:

## Continued in

- [Part 2: Start from the known parent](eloquent-relationships-part-2.md)
- [Part 3: whereAttachedTo() — many-to-many](eloquent-relationships-part-3.md)
- [Part 4: whereRelation() vs whereHas()](eloquent-relationships-part-4.md)
- [Part 5: Filter versus eager load](eloquent-relationships-part-5.md)
- [Part 6: "One of many" relationships](eloquent-relationships-part-6.md)
- [Part 7: Eager loading is deliberate](eloquent-relationships-part-7.md)
