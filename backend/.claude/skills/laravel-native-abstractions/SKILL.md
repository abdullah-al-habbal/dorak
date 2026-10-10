---
name: laravel-native-abstractions
description: MANDATORY before writing or changing Laravel code in this repo. Prefer existing Dorak module abstractions and Laravel's semantic, relationship-aware, transaction-aware, testable APIs over manual foreign-key filtering, cache plumbing, retry loops, ownership checks, native filesystem calls, raw SQL, and reimplemented framework behaviour. Covers Eloquent, query builder, cache, HTTP client, validation, authorization, queues, events, scheduling, concurrency, collections, context, container, API resources, and testing. Read together with laravel-attributes, cqrs-pattern, database-conventions, testing, and AGENTS.md.
---

# Laravel Native Abstractions

**Scope:** Laravel `13.20.0`, PHP `^8.3` — the version actually installed in this repo.
Every API named in this skill and its reference files was verified against
`vendor/laravel/framework/src/Illuminate/**` on 2026-08-22.

This is the **navigation + core rules** layer. Detailed rules live in `references/`
(see [Reference files](#reference-files)) and are loaded only when the task touches them.

---

## Mission

Before writing Laravel code, ask one question:

> **Does Laravel already know what I am trying to express?**

If the framework already understands the relationship, lifecycle, authorization rule,
validation rule, queue constraint, cache policy, route binding, file operation, HTTP
behaviour, concurrency problem, or data-access intent — use the API that expresses that
intent. Do not rebuild it.

This is **not** "always use the newest Laravel method". Choose the abstraction that is:

1. Correct for the domain.
2. Explicit about intent.
3. Supported by the installed Laravel version **and this repo's configured infrastructure**.
4. Consistent with the module / CQRS / Action → Handler → Resolver conventions.
5. Testable without unnecessary implementation coupling.

The goal is **fewer duplicated semantics**, not fewer lines.

---

## Golden rules

1. Prefer semantic framework APIs over implementation details.
2. Search the installed Laravel version before inventing a helper, trait, service, or infrastructure abstraction.
3. Treat relationships, routes, validation rules, queues, cache locks, and lifecycle hooks as sources of truth.
4. Prefer set-based database operations over row-by-row PHP loops when the operation is naturally set-based.
5. Prefer typed framework APIs and PHP backed enums over magic strings and manual coercion (see `12StrictEnums`).
6. Keep validation and authorization at framework boundaries; do not duplicate the checks inside Handlers.
7. Use Laravel queue / cache / concurrency primitives instead of custom locking, retry, or background-task infrastructure.
8. Prefer explicit query graphs and deliberate eager loading for predictable SQL.
9. Keep raw SQL and low-level infrastructure for cases where Laravel offers no adequate semantic abstraction, or where engine-specific behaviour is genuinely required.
10. Verify the resulting SQL, query count, transaction boundary, index, authorization scope, and failure behaviour whenever the choice can affect correctness or performance.

---

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

---

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

---

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

---

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

---

## Repo-specific facts you must not get wrong

Verified in this repo on 2026-08-22. These override generic Laravel advice.

**Cache tags will throw here.** `CACHE_STORE=database` in both `.env` and `.env.testing`.
`Illuminate\Cache\DatabaseStore` does not extend `TaggableStore`, so `Cache::tags(...)`
raises `BadMethodCallException: This cache store does not support tagging.` Only the `apc`,
`array`, `memcached`, `null`, `failover`, and `redis` stores are taggable in 13.20.
Design cache invalidation with explicit keys or a key-prefix/version scheme instead.
`Cache::lock()` **is** available — `DatabaseStore` implements `LockProvider`.

**There is no authorization layer yet.** Repo-wide there are zero `*Policy.php` classes, zero
`Gate::` calls, zero `abort(403)` calls, and no `role:` / `permission:` middleware — despite
`spatie/laravel-permission` being installed. Ownership is currently enforced by scoping the
query, e.g. `JobPostingModel::where('branch_id', $branch->id)->findOrFail($jobPosting)`.
A scoped query is **not** authorization. When you touch one of these paths, read
`references/requests-validation-authorization.md` and introduce a policy rather than copying
the scoping pattern into a new file.

**Strict Eloquent is not enabled.** No `shouldBeStrict()`, `preventLazyLoading()`,
`preventSilentlyDiscardingAttributes()`, or `preventAccessingMissingAttributes()` call exists
in the repo, so N+1 queries and typo'd attributes fail silently today. Do not rely on strict
mode catching your mistake — inspect query counts yourself.

**~44 files duplicate a foreign key** with `where('*_id', $model->id)`. This is the single
highest-volume smell in the codebase. See `examples/dorak-refactors.md` for the real
before/after cases.

**Commands.** `composer test` (config:clear + Pest against MySQL `dorak_test`) and
`vendor/bin/pint --test` — both are what the Husky pre-push hook runs. Static analysis is
`vendor/bin/phpstan analyse` with `phpstan.neon`; **there is no `composer analyse` script**
despite `CLAUDE.md` naming one.

**Resolvers live in two places.** 19 `modules/*/Eloquent/Resolvers/` directories (the
convention) plus 17 legacy `modules/Barber/Repositories/*EloquentResolver.php` files. New
code goes in `Eloquent/Resolvers/`.

---

## Reference files

Load the file that matches the concern you are touching. Do not load all of them.

| File | Contents | Load when |
|---|---|---|
| [references/eloquent-relationships.md](references/eloquent-relationships.md) | `whereBelongsTo`, `whereAttachedTo`, `whereMorphedTo`, `whereRelation`, `whereHas`, `withWhereHas`, aggregates, `ofMany`, pivot/associate APIs, eager loading, N+1, strict mode | Any query that involves a relationship, or any eager-loading decision |
| [references/eloquent-persistence.md](references/eloquent-persistence.md) | `firstOrCreate`, `firstOrNew`, `updateOrCreate`, `upsert`, cardinality methods (`sole`, `valueOrFail`, …), bulk updates, chunking, transactions, `afterCommit` | Writing, updating, or bulk-processing models |
| [references/query-builder-and-sql.md](references/query-builder-and-sql.md) | Eloquent vs `DB::table`, `updateOrInsert`, `insertUsing`, `insertOrIgnore` caveats, increments, specialized `where` clauses, pagination, raw-SQL rules | Reporting queries, bulk data movement, or any raw SQL |
| [references/cache-and-locks.md](references/cache-and-locks.md) | `remember`, `flexible`, `memo`, `lock`, `withoutOverlapping`, `funnel`, the database-store tag limitation, key conventions | Any caching or cross-process mutual exclusion |
| [references/http-client.md](references/http-client.md) | `retry`, `pool`, `throw`, timeouts, gateway boundaries, `Http::fake` | Calling any external service |
| [references/requests-validation-authorization.md](references/requests-validation-authorization.md) | Typed request accessors, Form Requests, `Rule::enum`/`exists`/`unique`, route model binding, scoped bindings, policies, `Gate`, `->can()` | Handling input, validating, or deciding who may act |
| [references/queues-events-scheduling.md](references/queues-events-scheduling.md) | `ShouldQueue`, `ShouldBeUnique`, `ShouldQueueAfterCommit`, `#[UniqueFor]`, `#[WithoutRelations]`, batches, chains, events, `Event::defer`, scheduler constraints, `RateLimiter` | Queueing, dispatching events, scheduling, throttling |
| [references/concurrency-collections-helpers.md](references/concurrency-collections-helpers.md) | `Concurrency::run`/`defer`, `defer()`, Collection operators, `abort_if`/`throw_if`/`rescue`/`retry`/`once`/`blank`/`filled`/`value`/`transform`/`enum_value` | Parallelizing work, transforming collections, replacing guard boilerplate |
| [references/context-container-resources.md](references/context-container-resources.md) | `Context`, logging context vs `LoggerService`, container + contextual attributes, `Storage`, API Resource `whenLoaded`/`whenCounted`/`whenAggregated` | Logging, DI, file handling, or shaping API output |
| [references/testing.md](references/testing.md) | Framework fakes, database assertions, time travel, what not to assert | Writing tests for any of the above |
| [examples/dorak-refactors.md](examples/dorak-refactors.md) | Real before/after refactors taken from this codebase, with file paths | You want a worked example in this repo's own style |

---

## What not to abstract

Framework-native does not mean "always use a facade" or "never write a service".
Do **not** force a Laravel abstraction when:

- Laravel has no semantic API for the requirement.
- Raw SQL is required for an engine-specific feature Laravel does not represent cleanly
  (e.g. the Haversine distance in `modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php`).
- The rule is business-specific and does not belong in a generic framework primitive.
- A Handler adds real domain orchestration rather than reproducing framework plumbing.
- The helper would hide an important security, consistency, or performance property.
- The configured infrastructure does not support it (cache tags on the `database` store).

---

## Allowed exceptions

Low-level code is allowed when it is demonstrably better for correctness, performance, or a
required database / external-system feature. Every exception must:

1. Be local and minimal.
2. Carry a short comment stating why the Laravel semantic API is insufficient.
3. Use parameter binding for SQL — never string interpolation of user input.
4. Preserve transaction, authorization, validation, and observability requirements.
5. Include focused tests.

Real example — `modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php`
computes Haversine distance in SQL because Eloquent has no predicate for spherical geometry,
then wraps it with `fromSub()` so `distance` is filterable and sortable. That raw fragment is
justified. Its one weakness is that it interpolates coordinates via `sprintf('%f', ...)`
instead of binding them; `%f` coercion makes it safe in practice, but new raw SQL should bind:

```php
// MySQL spatial maths: Haversine distance has no Eloquent predicate equivalent.
$subQuery = BarberModel::query()
    ->select('barbers.*')
    ->selectRaw(
        '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) '
        . '* cos(radians(longitude) - radians(?)) '
        . '+ sin(radians(?)) * sin(radians(latitude)))) AS distance',
        [$latitude, $longitude, $latitude],
    )
    ->whereNotNull('latitude')
    ->whereNotNull('longitude');

$barbers = BarberModel::query()
    ->fromSub($subQuery, 'barbers_sub')
    ->where('distance', '<', $radiusKm)
    ->orderBy('distance')
    ->paginate($perPage);
```

---

## Agent checklist

Before finalizing Laravel code:

- [ ] Is there an existing Action, Handler, Resolver, model scope, relationship, Resource, event, or job I should use instead?
- [ ] Did I use a relationship instead of duplicating a foreign key?
- [ ] Did I eager load exactly what will be accessed or serialized — nothing more?
- [ ] Did I check the query count for N+1 (strict mode is off in this repo)?
- [ ] Did I pick the right cardinality method: `first`, `firstOrFail`, `sole`, `exists`, `value`, `valueOrFail`, `count`, `pluck`?
- [ ] Does concurrent data need a transaction, a unique index, a cache lock — or all three?
- [ ] Does queued work need `afterCommit()` / `ShouldQueueAfterCommit`?
- [ ] Did I avoid `Cache::tags()` (unsupported by this repo's `database` store)?
- [ ] Did I use the framework's HTTP / cache / filesystem / validation / queue / testing APIs instead of reimplementing them?
- [ ] Is every raw SQL fragment bound, commented, and justified?
- [ ] Did I run `vendor/bin/pint` and the tests required by `testing/SKILL.md`?

---

## Version and source verification

This skill is a **discovery guide**, not an exhaustive API list. Laravel moves fast.

- Prefer the Laravel 13.x documentation: <https://laravel.com/docs/13.x>
- Verify signatures in `vendor/laravel/framework/src/Illuminate/**` for the installed version.
- Use <https://api.laravel.com/docs/13.x/> when a method name or signature is uncertain.
- Prefer Laravel-maintained docs and source over community summaries when they disagree.
- Community articles are discovery sources for patterns worth investigating — never the final
  authority on a signature.

**Skill ownership boundaries.** When a project rule conflicts with generic Laravel advice,
follow the project rule unless it is unsafe or technically invalid. Never bypass the
Action → Handler → Resolver flow just because Laravel's docs show a controller example.

| Skill | Owns |
|---|---|
| `laravel-attributes` | The attribute-only convention and exact Laravel 13 attribute signatures |
| `coding-standards` | PHP naming, `strict_types`, `final`, `env()` rules |
| `12StrictEnums` | Backed enums for every status/type column |
| `cqrs-pattern` | Request → Action → Handler → Resolver responsibilities |
| `database-conventions` | Migrations, factories, seeders, index conventions |
| `architecture` / `laravel-module-architecture-baseline` | Module boundaries and file placement |
| `testing` / `laravel-testing-baseline` | Test location, style, suite commands, coverage gates |
| `laravel-native-abstractions` (this skill) | Choosing semantic Laravel APIs over manual infrastructure |
