---
nodeid: skills.backend.laravel-module-architecture-baseline.part-2
parentnode: skills.backend.laravel-module-architecture-baseline
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [Module Architecture — baseline standard](../SKILL.md) · [Previous](../SKILL.md)

## Per‑task checklist

- [ ] code is inside the correct `modules/{Name}/` (not `app/`)
- [ ] new behavior = a new **Action + Handler + EloquentResolver** triad, named by action
- [ ] **no** Controller / Service / Repository class created
- [ ] Action is invokable and thin; Handler has only `handle()`; Resolver has one Eloquent‑only method
- [ ] every class is `final`; no `implements`, no `extends` of a project base
- [ ] resolver uses constructor‑injected model + `newQuery()`
- [ ] provider added to `bootstrap/providers.php`; `register()` empty; `boot()` guarded with `File::exists`
- [ ] both `lang/en` and `lang/ar` present; no hardcoded strings
- [ ] names follow the `docs/11` §6 convention table

## When this skill applies in the loop

CRESCENT phase 6 **Plan/Act** — it dictates *where* code goes and *what classes* to create before any line is written. Pair with **migrations** (module‑owned tables + cascades), **validations** (the form requests), **testing** (one test per cited rule), **type‑safety** (enums/DTOs), and the recommended **rbac / tenancy‑isolation / api‑resources / concurrency‑safety** skills.

> Want the concrete code patterns (an Action + Handler + EloquentResolver triad, a `final` model with Spatie translatable casts, a guarded service provider, a panel provider scanner)? Ask and they'll be added as `references/patterns.md` here.
