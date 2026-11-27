---
codeanchors:
  - backend/modules/
---

Referenced from [`../SKILL.md`](../SKILL.md).

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
