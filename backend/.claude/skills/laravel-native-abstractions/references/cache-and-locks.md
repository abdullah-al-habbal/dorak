---
codeanchors:
  - backend/modules/
---

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

## Continued in

- [Part 2: Stale-while-revalidate: flexible()](cache-and-locks-part-2.md)
- [Part 3: Atomic locks](cache-and-locks-part-3.md)
- [Part 4: Cache keys and invalidation without tags](cache-and-locks-part-4.md)
