---
codeanchors:
  - backend/modules/
---

Referenced from [`../SKILL.md`](../SKILL.md).

## Required decision order

Choose in this order. Stop at the first level that fits.

| # | Level | Examples in this repo |
|---|---|---|
| 1 | Existing Dorak module abstraction | Action, Handler, `*EloquentResolver`, Command/Query object, DTO, Resource, Job, Event, model scope |
| 2 | Existing Eloquent relationship or scope | `$branch->chairs()`, `$client->favorites()` |
| 3 | Laravel semantic API | `whereBelongsTo()`, `Cache::remember()`, `Http::retry()`, `Rule::enum()` |
| 4 | Query Builder or facade | `DB::table()->upsert()`, `Storage::disk()` |
| 5 | Raw SQL / native PHP | Haversine distance, engine-specific JSON operators |

Do not bypass a domain abstraction because a raw query or facade is shorter.
Do not create a new abstraction when an existing Laravel API is clearer and sufficient.


## Discovery workflow

Run this before creating any custom abstraction.

**Step 1 — Name the intent.** Describe the operation in framework terms, not in the code you
were about to write: relationship filter, relationship existence, eager load, aggregate
projection, route-to-model resolution, validation, authorization, queue uniqueness, rate
limit, cache-aside, stale-while-revalidate, atomic lock, file storage, HTTP retry, deferred
execution, batch, chain, scheduler overlap, concurrent independent work, request
normalization, collection transformation.

**Step 2 — Search Laravel 13.x for the intent.** Search the concept, not the snippet.
`relationship belongs to query` → `whereBelongsTo`. `filter and eager load the same
condition` → `withWhereHas`. `atomic insert or update` → `upsert`. `serve stale then
refresh` → `Cache::flexible`. `run independent tasks together` → `Concurrency::run`.

**Step 3 — Verify against installed vendor source.** Authoritative for this repo:

```bash
grep -rn "function whereBelongsTo(" vendor/laravel/framework/src/Illuminate/
```

Confirm existence, signature, named parameters, exceptions, and return type. Never infer an
API from a blog post, an old Stack Overflow answer, or a different Laravel version.

**Step 4 — Pick the smallest semantic API** that expresses the intent without leaking
implementation details.

**Step 5 — Verify behaviour.** Database code: inspect SQL and query count. Queue / cache /
lock: verify timing and failure semantics. Authorization / validation: test the rejection
path.

If Laravel Boost is ever installed here, use its version-aware documentation search in Step 2
before relying on model memory. It is not installed today — vendor source is the fallback and
the final authority.
