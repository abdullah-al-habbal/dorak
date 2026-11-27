---
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [Architecture](../SKILL.md) · [Previous](../SKILL.md)

## Naming conventions

Every class **must** carry a suffix identifying its layer/role (e.g. `ClientModel`, `CreateBookingAction`, `TranslatorHandlerService`). See [coding-standards](../../coding-standards/SKILL.md) for the full suffix table.

## PSR-4 mapping

| Namespace | Path |
|-----------|------|
| `Modules\` | `modules/` |
| `Database\Seeders\` | `database/seeders/` |
| `Tests\` | `tests/` |

## Dependency direction

All future modules depend on Core. Core has no dependencies on other modules.
