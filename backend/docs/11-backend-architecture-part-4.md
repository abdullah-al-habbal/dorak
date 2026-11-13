---
nodeid: backend.11-backend-architecture.part-4
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-3.md) · [Next](11-backend-architecture-part-5.md)

## 7. Translation‑first

Every module ships **both** `lang/en/` and `lang/ar/` from day one. `SpatieTranslatable` handles translatable model attributes (e.g. name, description — the "translatable" fields in `06`); the `LanguageSwitch` plugin toggles `en`/`ar` inside panels. **No hardcoded UI strings** — always translation keys, e.g. `__('booking::labels.starts_at')`.

This is the code‑level enforcement of `04` **J1/J2** (always show the user's language; fall back, never empty) and the bilingual attributes in `06`.

---

## 8. Testing

- **Pest** + **PHPUnit 11**.
- **MySQL `dorak_test`** only (forced in `phpunit.xml`, enforced by `Tests\Support\TestDatabaseGuard`); SQLite is not supported.
- Tests in `tests/Feature/`, `tests/Unit/`, `tests/Integration/`.
- **Factories in each module's `Database/Factories/`.**
- Run: `composer test` (clears config, runs the full suite).

The *policy* for what to test (every house rule → a test; every edge case → a test; every flow → a feature test; the flagship concurrency test) lives in `.claude/skills/laravel-baseline/testing/SKILL.md`. This section only fixes the **stack**.

---

## 9. What's absent on purpose

| Absent | Reason |
|---|---|
| **Controllers / Service layer / Repository layer** | Replaced by single‑method **Action / Handler / EloquentResolver** so no class grows unbounded |
| Service‑container bindings | Concrete classes resolved directly; no interfaces to bind |
| Abstract base classes | `final` + composition over inheritance |
| Module auto‑discovery | Explicit `providers.php` keeps boot order predictable |
| `app/` features (except providers) | Domain code lives in `modules/`; `app/` is only glue |

---
