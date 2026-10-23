Referenced from [`../SKILL.md`](../SKILL.md).

## Anti-pattern detector

A trigger to **investigate**, not a mechanical rewrite rule.

| Manual pattern | First framework API to investigate |
|---|---|
| `where('customer_id', $customer->id)` | `whereBelongsTo()` |
| manual `commentable_type` + `commentable_id` filters | `whereMorphedTo()` |
| hand-built pivot joins / `whereIn` subqueries | `whereAttachedTo()`, relationship APIs |
| duplicated `whereHas()` + identical `with()` | `withWhereHas()` / `withWhereRelation()` |
| load a relation only to count it | `withCount()` / `loadCount()` |
| load a relation only to test presence | `withExists()` / `loadExists()` |
| repeated `->latest()->first()` domain query | `latestOfMany()` / `ofMany()` |
| manual FK assignment on create | `$parent->children()->create()` |
| `->get()->first()` / `->get()->count()` / `->get()->isNotEmpty()` | `first()` / `count()` / `exists()` |
| select-then-update-or-insert branch | `upsert()` / `updateOrInsert()` + unique index |
| row-by-row sync loop | `upsert()` / `insertUsing()` |
| read-modify-write counter | `increment()` / `incrementEach()` |
| `get()` then loop a large table | `chunkById()` / `lazyById()` |
| `filter_var($request->input(...), FILTER_VALIDATE_BOOLEAN)` | `$request->boolean()` |
| `Enum::from($request->input(...))` | `$request->enum()` |
| manual "exists then query" pre-check | `Rule::exists()` |
| `findOrFail($routeId)` inside a bound route | implicit route model binding |
| manual ownership `if` + `abort(403)` | policy + `Gate::authorize()` / `->can()` |
| hand-written cache-aside get/if-null/put | `Cache::remember()` |
| custom stale-while-revalidate | `Cache::flexible()` |
| hand-written distributed mutex (Redis `SET NX`) | `Cache::lock()` |
| repeat lookups of the same value in one request | `Cache::memo()` / `once()` |
| custom "duplicate job" flag | `ShouldBeUnique` + `#[UniqueFor]` |
| custom overlap lock around queued/scheduled work | `Cache::withoutOverlapping()`, `funnel()`, scheduler `withoutOverlapping()` |
| custom HTTP retry loop | `Http::retry()` |
| raw cURL / bare Guzzle | Laravel HTTP client |
| sequential independent slow calls | `Concurrency::run()`, `Http::pool()` |
| work queued only to unblock a response | `defer()` / `Concurrency::defer()` |
| `file_put_contents()` / `unlink()` / `move_uploaded_file()` | `Storage` disk APIs |
| same metadata pasted onto every log call | `Context::add()` + logging context |
| custom per-minute counter | `RateLimiter` + `throttle` middleware |
| five-line `foreach` over a Collection | Collection operators |
| `new SomeService(config(...))` in business code | container / constructor injection |
| hand-rolled fakes for framework integrations | `Http::fake()`, `Queue::fake()`, `Event::fake()`, … |


## Decision tree

```text
Does Laravel already model this concept?
│
├─ Yes
│  ├─ Is there a dedicated semantic method/attribute?
│  │    └─ Use it.
│  ├─ Is there only a broader builder/facade API?
│  │    └─ Use the broader API rather than custom infrastructure.
│  └─ Is the behaviour reusable domain logic?
│       └─ Encode it in the model / policy / rule / Handler layer.
│
└─ No
   ├─ Is this a database-engine-specific requirement?
   │    └─ Use Query Builder / raw SQL deliberately, with a comment.
   ├─ Is this genuine domain behaviour?
   │    └─ Implement it in the module (Action → Handler → Resolver).
   └─ Is this infrastructure?
        └─ First check whether a Laravel contract or installed package already covers it.
```
