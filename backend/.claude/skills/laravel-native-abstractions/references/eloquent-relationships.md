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

## `whereAttachedTo()` — many-to-many

Avoid rebuilding pivot joins or `whereIn()` subqueries when a `belongsToMany` relationship
already exists.

```php
$users = UserModel::query()
    ->whereAttachedTo($role)
    ->get();
```

Pass the relationship name when ambiguous: `whereAttachedTo($role, 'assignedRoles')`.

---

## `whereMorphedTo()` — polymorphic

Avoid:

```php
$comments = CommentModel::query()
    ->where('commentable_type', $post->getMorphClass())
    ->where('commentable_id', $post->getKey())
    ->get();
```

Prefer:

```php
$comments = CommentModel::query()
    ->whereMorphedTo('commentable', $post)
    ->get();
```

Do not reproduce morph-map/type resolution manually — Eloquent already owns it. Related:
`whereNotMorphedTo()`, `whereMorphRelation()`, `whereHasMorph()`.

This repo has three polymorphic links (see `laravel-migrations-baseline`); e.g.
`modules/Branch/Http/Actions/Branch/ListAffiliationsAction.php` filters
`affiliable_id` manually and is a candidate for `whereMorphedTo()`.

---

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
