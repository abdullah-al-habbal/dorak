---
nodeid: mobile.packages.core.references.storage
parentnode: mobile.packages.core
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 6. Storage

| Contract | Impl | Key |
|---|---|---|
| `TokenStorage` | `SecureTokenStorage` | `dorak_client_token` (secure) |
| `AppPreferences` | `SharedAppPreferences` | `dont_show_onboarding` (prefs) |
| `FeedCache` | `SharedFeedCache` | `dorak_cache:v1:<universe>:<lat>:<lon>:<radius>:<per_page>` (prefs) |

`SecureTokenStorage.read()` normalises `''` to `null`.
`AppPreferences.dontShowOnboarding` is a **synchronous** getter — the launch
gate branches on it with no await. Build it once with
`await SharedAppPreferences.create()`; that factory exists so apps never
declare `shared_preferences` themselves.

**Feed cache strategy (Track 05, consumer = Discovery feed):**

* Stores the **raw JSON response payload** (item maps + pagination meta), not
  parsed DTOs — `*.dto.dart` uses `createToJson: false`, so wire payloads are
  re-parsed via the same `itemParser`/`PaginationMeta.fromJson` on cache read.
* Key derivation folds the query into bounded buckets: lat/long rounded to 3 dp
  (≈111 m), radius snapped to a 5 km bucket, `universe` + `per_page` exact.
  The same key space the feed query itself ranks over.
* **No TTL enforcement inside the cache.** `FeedCacheEntry.storedAt` +
  `isStale(now)`/`feedCacheTtl` (30 min) live in the value object; the consumer
  decides whether stale data is acceptable (offline) or must be revalidated
  (pull-to-refresh). Universe switch / filter change → `evict(key)` then re-query.
* Corrupt/unparseable payloads read as `null`, never throw.

## 7. Adding things

| Task | Steps |
|---|---|
| New endpoint | add the constant to the matching `*.endpoints.dart`, then a method on the repository. Never inline a path string. |
| New wire model | `dto/<name>.dto.dart` with `@JsonSerializable(fieldRename: FieldRename.snake, createToJson: false)` + `part`, export from `network.barrel.dart`, run `melos run build` |
| New backend domain | new `<domain>.endpoints.dart` + `<domain>.repository.dart`; do not extend `auth.endpoints.dart` |
| New persisted value | extend `AppPreferences` (non-secret) or `TokenStorage` (secret), keep the abstract contract |
| New shared async state | a `Bloc` (`.bloc.dart` + `.event.dart` + `.state.dart`, pure `bloc` package) here when the state is core infrastructure, otherwise an app-layer `Bloc`. Never a `ChangeNotifier`. |
