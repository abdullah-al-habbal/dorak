# Cache and Locks

> **Read this first — repo constraint.** `CACHE_STORE=database` in both `.env` and
> `.env.testing`. `Illuminate\Cache\DatabaseStore` does **not** extend `TaggableStore`, so
> `Cache::tags(...)` throws `BadMethodCallException: This cache store does not support
> tagging.` Only `apc`, `array`, `memcached`, `null`, `failover`, and `redis` are taggable in
> 13.20. `Cache::lock()` **does** work — `DatabaseStore` implements `LockProvider`.

---

## Cache-aside: `remember()`

Avoid:

```php
$key = "catalog:category:{$category->getKey()}";
$products = Cache::get($key);

if ($products === null) {
    $products = $category->products()->where('is_active', true)->get();
    Cache::put($key, $products, now()->addMinutes(10));
}
```

Prefer:

```php
$products = Cache::remember(
    "catalog:category:{$category->getKey()}",
    now()->addMinutes(10),
    fn (): Collection => $category->products()->where('is_active', true)->get(),
);
```

Related: `rememberForever()`, `Cache::add()` (write-if-absent, atomic), `Cache::pull()`
(read-and-forget), `Cache::increment()` / `decrement()`.

Caching hydrated Eloquent models serializes the whole model graph. Prefer caching a DTO,
an array, or a set of IDs when the payload is large or the model has loaded relations.

---

## Stale-while-revalidate: `flexible()`

Signature (verified): `flexible($key, $ttl, $callback, $lock = null, $alwaysDefer = false)`
where `$ttl` is `[$freshSeconds, $staleSeconds]`.

```php
$catalog = Cache::flexible(
    "catalog:{$catalogId}",
    [60, 300],
    fn (): CatalogData => $this->catalogResolver->resolve($catalogId),
);
```

- Within the fresh window: value returned as-is.
- Between fresh and stale: the stale value is returned **and** a deferred refresh is queued
  for after the response.
- Past the stale window: recomputed synchronously.

Use only when serving slightly stale data is an explicitly accepted business requirement.
Never for balances, availability checks, or anything a booking decision depends on.

---

## Request-local memoization: `memo()` / `once()`

```php
$settings = Cache::memo()->remember(
    'settings:public',
    now()->addHour(),
    fn (): array => $this->settingsResolver->public(),
);
```

`Cache::memo()` wraps the configured store and additionally keeps resolved values in memory
for the current request or job, so repeated reads of the same key hit the driver once.
`Cache::memo('redis')` targets a specific store.

The `once()` helper memoizes a closure's result per calling object/scope, with no cache driver
involved — right for a value derived inside one class during one request.

Neither is durable cross-request caching. Do not use them to skip a real cache entry.

---

## Atomic locks

`Cache::lock()` gives cross-process mutual exclusion. Use it instead of hand-coding Redis
`SET NX` with owner tokens, expiry, and cleanup.

```php
$lock = Cache::lock("booking:{$booking->getKey()}:processing", 30);

if (! $lock->get()) {
    throw new BookingAlreadyProcessingException();
}

try {
    $this->processBooking($booking);
} finally {
    $lock->release();
}
```

Blocking form, which releases automatically:

```php
Cache::lock("chair:{$chairId}", 10)->block(5, function (): void {
    // waits up to 5s for the lock, throws LockTimeoutException on failure
});
```

Rules:

- Always set a TTL long enough for the critical section, or a crashed worker holds it forever.
- `->release()` in a `finally`, or use the closure form.
- To release from a different process, pass the owner token: `Cache::restoreLock($name, $owner)->release()`.
- A lock is **not** a transaction and **not** a unique index. For the no-double-booking
  invariant you need the database constraint as well — see `laravel-testing-baseline`.

### Overlap and concurrency limiters

```php
Cache::withoutOverlapping('sync-exchange-rates', function (): void { /* ... */ });

Cache::funnel('call-external-api')->limit(3)->then(fn () => $client->call());
```

`withoutOverlapping()` = "at most one at a time". `funnel()` = "at most N concurrently".
Both are built on the lock driver, so both work with the `database` store.

---

## Cache keys and invalidation without tags

Because tags are unavailable here:

- Build keys from a single convention (`module:entity:id:variant`), defined once per module —
  not inline strings scattered across Handlers and Resolvers.
- For group invalidation, use a **version counter** key:

```php
$version = Cache::get("catalog:version", 1);
$products = Cache::remember("catalog:v{$version}:category:{$id}", $ttl, $loader);

// invalidate the whole group
Cache::increment('catalog:version');
```

- `Cache::forget($key)` for single entries. Avoid `Cache::flush()` — it clears every key in
  the store, including unrelated modules and Pennant feature state.
- `CACHE_PREFIX=dorak-backend-cache-` is already set, so keys are namespaced per app.

Feature-flag caching is Pennant's job — see `feature-flags`, do not wrap it in your own cache.
