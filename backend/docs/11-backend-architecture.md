---
nodeid: backend.11-backend-architecture
parentnode: backend.docs
childnodes:
  - backend.11-backend-architecture.group-1
codeanchors:
  - backend/modules/
---

# 11 — Backend Architecture (C4 Level 3: Components & Conventions)

> This is the **component level** that `10-c4-containers.md` deliberately deferred. It describes *how the Laravel backend is structured internally* — the modular layout and the **Action → Handler → EloquentResolver** flow — plus the team's coding conventions. It stays at the **structural / naming / flow** level; **actual code patterns live in the skill** `.claude/skills/laravel-baseline/module-architecture/SKILL.md`, which the Ralph loop reads when building.
> This document **does not restate business logic** — rules live in `04-house-rules.md`, entities in `06-entity-model-abstract.md`.

---

## 0. Reconciliations applied (please confirm)

Three small points were standardized from the draft you provided; correct any that don't match your existing codebase:

1. **Spelling: `EloquentResolver`** (the draft wrote `EloqunetResolver`). If your real classes use the misspelling, say so and it'll be matched verbatim everywhere.
2. **Resolvers are per‑action, single‑method** (matching your evolved approach: "each action … one method," "the EloquentResolver … is only also one method"). The earlier draft showed a **module‑level** resolver (`UserEloquentResolver` owning *all* queries). This doc adopts the **per‑action** form (`ListAllBookingsEloquentResolver`) as the default, because it's the whole point of avoiding fat classes. 🟡 *If you actually want one resolver per module with many query methods, that's a one‑line change to the convention.*
3. **Folders:** Actions in `Http/Actions/`, Handlers in a new `Handlers/`, resolvers kept in `Repositories/` (your draft's folder) — though `Resolvers/` would read truer now that the repository concept is gone. 🟡 *pick one.*

---

## 1. Modular by domain

Every feature is a self‑contained **module** under `modules/{Name}/`, owning its entire vertical slice. You understand one module without reading the other nineteen — the boundary is **cognitive**, not a microservice.

| Layer | Location |
|---|---|
| Migrations | `Database/Migrations/` |
| Models | `Models/{Entity}Model.php` |
| Data access (Eloquent) | `Repositories/{Action}EloquentResolver.php` |
| Presentation | `Presenters/{Name}Presenter.php` |
| HTTP — validation | `Http/Requests/` |
| HTTP — entry points | `Http/Actions/{Action}Action.php` |
| Logic | `Handlers/{Action}Handler.php` |
| Translations | `lang/{en,ar}/{name}.php` |
| Blade | `Resources/views/` |
| Provider | `Providers/{Name}ServiceProvider.php` |

**Modules are not microservices** — they share one DB, one request cycle, and may call each other's resolvers directly.

PSR‑4 autoloading in `composer.json`:

```json
"autoload": { "psr-4": { "Modules\\": "modules/" } }
```

**Dorak's modules** map one‑to‑one onto the aggregates in `06`: `Auth`, `Brand`, `Branch`, `Chair`, `Barber`, `Affiliation`, `Service`, `Booking`, `Review`, `Job`, `Currency`, `Settings` (plus support modules as needed). One module per aggregate keeps the slice clean.

---

## Continued in

- [Parts 2-19](11-backend-architecture-group-1.md)
