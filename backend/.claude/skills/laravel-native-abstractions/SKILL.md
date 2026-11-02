---
name: laravel-native-abstractions
description: MANDATORY before writing or changing Laravel code in this repo. Prefer existing Dorak module abstractions and Laravel's semantic, relationship-aware, transaction-aware, testable APIs over manual foreign-key filtering, cache plumbing, retry loops, ownership checks, native filesystem calls, raw SQL, and reimplemented framework behaviour. Covers Eloquent, query builder, cache, HTTP client, validation, authorization, queues, events, scheduling, concurrency, collections, context, container, API resources, and testing. Read together with laravel-attributes, cqrs-pattern, database-conventions, testing, and AGENTS.md.
nodeid: skills.backend.laravel-native-abstractions
parentnode: skills.backend
childnodes:
  - skills.backend.laravel-native-abstractions.examples.dorak-refactors
  - skills.backend.laravel-native-abstractions.references.anti-patterns-and-decision-tree
  - skills.backend.laravel-native-abstractions.references.cache-and-locks
  - skills.backend.laravel-native-abstractions.references.concurrency-collections-helpers
  - skills.backend.laravel-native-abstractions.references.context-container-resources
  - skills.backend.laravel-native-abstractions.references.decision-order-and-discovery
  - skills.backend.laravel-native-abstractions.references.eloquent-persistence
  - skills.backend.laravel-native-abstractions.references.eloquent-relationships
  - skills.backend.laravel-native-abstractions.references.exceptions-and-checklist
  - skills.backend.laravel-native-abstractions.references.http-client
  - skills.backend.laravel-native-abstractions.references.query-builder-and-sql
  - skills.backend.laravel-native-abstractions.references.queues-events-scheduling
  - skills.backend.laravel-native-abstractions.references.repo-facts
  - skills.backend.laravel-native-abstractions.references.requests-validation-authorization
  - skills.backend.laravel-native-abstractions.references.testing
  - skills.backend.laravel-native-abstractions.references.verification-and-ownership
  - skills.backend.laravel-native-abstractions.part-2
codeanchors:
  - backend/modules/
---

# Laravel Native Abstractions

**Scope:** Laravel `13.20.0`, PHP `^8.3` — the version actually installed in this repo.
Every API named in this skill and its reference files was verified against
`vendor/laravel/framework/src/Illuminate/**` on 2026-08-22.

This is the **navigation + core rules** layer. Detailed rules live in `references/`
(see [Reference files](references/skill-part-2.md#reference-files)) and are loaded only when the task touches them.

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

## Continued in

- [Part 2: Golden rules](references/skill-part-2.md)
