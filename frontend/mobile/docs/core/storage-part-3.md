---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 3 of 3 · [Storage](storage.md) · [Previous](storage-part-2.md)

## Feed cache

`FeedCache` / `SharedFeedCache` (`feed_cache.storage.dart`) is the cache
strategy. The client app's Discovery bloc reads it.

Design:

* **Wire payload, not DTOs.** Feed stores the raw item maps + pagination meta
  from a real response. DTOs use `createToJson: false`, so a cache read
  re-parses through the same `itemParser`/`PaginationMeta.fromJson` as the
  network path — one parse path, no second serialization format.
* **Bounded keys.** `keyFor(universe, latitude, longitude, radius, perPage)`:
  lat/long rounded to 3 dp (≈111 m), radius snapped to a 5 km bucket,
  `universe` + `per_page` exact. Local feeds for the same neighbourhood hit the
  same entry; distance-ranked requests don't explode the key space.
* **Staleness is read-time, not write-time.** `FeedCacheEntry{items, meta,
  storedAt}` + `isStale(now, [ttl])`; default `feedCacheTtl` = 30 min. The store
  never refuses to return — the consumer decides (offline retry renders stale,
  pull-to-refresh revalidates). A TTL inside the store would force re-fetch in
  the one situation the cache exists for.
* **Eviction is explicit.** Universe switch / filter change → `evict(key)` then
  re-query; `clear()` drops every `dorak_cache:v1:` key (logout, cache reset).
* **Corrupt payloads read as `null`**, never throw.

```dart
final cache = await SharedFeedCache.create();
final key = cache.keyFor(
  universe: 'men',
  latitude: 33.5138,
  longitude: 36.2765,
  radius: 10,
);
final cached = await cache.read(key);          // FeedCacheEntry? — consumer
if (cached != null && !cached.isStale(DateTime.now())) {
  // render from cache; refresh in the background
}
```

## Verification

```bash
dart run melos run analyze
dart run melos run test    # packages/core/test/storage_test.dart, feed_cache_test.dart
```
