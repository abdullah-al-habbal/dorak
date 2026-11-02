---
nodeid: skills.backend.laravel-native-abstractions.references.cache-and-locks.part-2
parentnode: skills.backend.laravel-native-abstractions.references.cache-and-locks
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 4 · [Cache and Locks](cache-and-locks.md) · [Previous](cache-and-locks.md) · [Next](cache-and-locks-part-3.md)

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
