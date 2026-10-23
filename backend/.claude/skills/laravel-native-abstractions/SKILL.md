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
| [references/decision-order-and-discovery.md](references/decision-order-and-discovery.md) | Required decision order + the 5-step discovery workflow | Before writing any new query/abstraction |
| [references/anti-patterns-and-decision-tree.md](references/anti-patterns-and-decision-tree.md) | Manual-pattern → framework-API lookup table + the yes/no decision tree | Spotting a manual reimplementation of a framework concept |
| [references/repo-facts.md](references/repo-facts.md) | Repo-specific facts that override generic Laravel advice (cache tags, missing authorization layer, strict mode off, command names) | Before relying on generic Laravel behaviour in this repo |
| [references/exceptions-and-checklist.md](references/exceptions-and-checklist.md) | What not to abstract, allowed raw-SQL exceptions, the pre-submit agent checklist | Finalizing Laravel code |
| [references/verification-and-ownership.md](references/verification-and-ownership.md) | How to verify an API against installed Laravel, and which skill owns which rule | A method/signature is uncertain, or two skills seem to disagree |

---
