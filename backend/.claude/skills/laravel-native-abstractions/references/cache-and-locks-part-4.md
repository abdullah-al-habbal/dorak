---
codeanchors:
  - backend/modules/
---

Part 4 of 4 · [Cache and Locks](cache-and-locks.md) · [Previous](cache-and-locks-part-3.md)

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
