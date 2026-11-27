---
codeanchors:
  - backend/modules/
---

Part 6 of 7 · [Eloquent: Relationship-Aware Queries](eloquent-relationships.md) · [Previous](eloquent-relationships-part-5.md) · [Next](eloquent-relationships-part-7.md)

## "One of many" relationships

Avoid repeating the same query in application code:

```php
// Avoid, repeated across Handlers
$latestOrder = $customer->orders()->latest()->first();
```

Encode the concept once on the model:

```php
public function latestOrder(): HasOne
{
    return $this->hasOne(OrderModel::class)->latestOfMany();
}
```

`oldestOfMany()` and `ofMany('column', 'aggregate', $closure)` cover "first" and custom
"best/current" selection rules. These are true relationships, so they can be eager loaded.

---

## Relationship graph helpers

Use the relationship API instead of mutating foreign keys or pivot rows by hand:

| Intent | API |
|---|---|
| Constrained eager load | `with(['items' => fn ($q) => $q->where(...)])` |
| Load onto hydrated models | `load()`, `loadMissing()` |
| Create through a relation | `create()`, `createMany()`, `createQuietly()` |
| Attach existing models | `save()`, `saveMany()` |
| Set/clear a `belongsTo` | `associate()`, `dissociate()` |
| Many-to-many membership | `attach()`, `detach()`, `sync()`, `syncWithoutDetaching()`, `toggle()` |
| Update pivot columns | `updateExistingPivot()` |

---
