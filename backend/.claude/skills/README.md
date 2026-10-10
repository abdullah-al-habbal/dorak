# Dorak Backend — AI Agent Skills

Focused guides for AI agents working on this codebase. Each skill covers one aspect of the
architecture and conventions.

## Mandatory before writing code

| Skill | Description |
|-------|-------------|
| [laravel-attributes](laravel-attributes/SKILL.md) | Laravel 13 attribute-only convention — `#[Fillable]`, `#[Table]`, `#[Signature]`, queue/DI attributes. Read before **any** new PHP code |
| [laravel-native-abstractions](laravel-native-abstractions/SKILL.md) | Prefer Laravel's semantic APIs over manual framework plumbing and duplicated infrastructure. Core rules + navigation; details in `references/` |
| [coding-standards](coding-standards/SKILL.md) | PHP conventions, `strict_types`, `final`, enums, naming, `env()` rules |
| [12StrictEnums](12StrictEnums/SKILL.md) | Backed enums for every status/type column, `Rule::enum` validation, model casts |

## Architecture and structure

| Skill | Description |
|-------|-------------|
| [architecture](architecture/SKILL.md) | Module structure, bootstrap flow, PSR-4 mapping |
| [laravel-module-architecture-baseline](laravel-module-architecture-baseline/SKILL.md) | Mandatory module layout and the Action → Handler → EloquentResolver flow |
| [cqrs-pattern](cqrs-pattern/SKILL.md) | Command/Query flow: Request → Action → Handler → Resolver |
| [10StrictBackendArchitecture](10StrictBackendArchitecture/SKILL.md) | FormRequests, Command objects, strict imports, Resource composition |
| [how-to-add-a-module](how-to-add-a-module/SKILL.md) | Steps to create a new domain module |
| [how-to-add-a-route](how-to-add-a-route/SKILL.md) | Defining API and web routes per module |
| [filament-module-structure](filament-module-structure/SKILL.md) | Filament resource and page placement per module |

## Data and persistence

| Skill | Description |
|-------|-------------|
| [database-conventions](database-conventions/SKILL.md) | Migrations, factories, seeders, Eloquent patterns |
| [laravel-migrations-baseline](laravel-migrations-baseline/SKILL.md) | Schema standard: UUID keys, JSON translatable columns, cascade laws, reversibility |

## Cross-cutting concerns

| Skill | Description |
|-------|-------------|
| [api-response-standard](api-response-standard/SKILL.md) | Unified JSON response envelope and helpers |
| [translation-conventions](translation-conventions/SKILL.md) | i18n with the `core::` namespace and TranslatorHandlerService |
| [logging-and-tracing](logging-and-tracing/SKILL.md) | LoggerService and `request_uuid` tracing |
| [feature-flags](feature-flags/SKILL.md) | Laravel Pennant for freemium gating |

## Testing

| Skill | Description |
|-------|-------------|
| [testing](testing/SKILL.md) | Test structure, MySQL + RefreshDatabase setup, running tests |
| [laravel-testing-baseline](laravel-testing-baseline/SKILL.md) | Coverage gates: every house rule, edge case, and user flow becomes a test |

## Workflow skills

Process automation rather than code conventions.

| Skill | Description |
|-------|-------------|
| [crescent](crescent/SKILL.md) | 7-phase state machine: Idea → Research → Prototype → PRD → Kanban → Ralph Loop → QA |
| [research](research/SKILL.md) · [prototype](prototype/SKILL.md) · [to-prd](to-prd/SKILL.md) · [to-issues](to-issues/SKILL.md) · [ralph-loop](ralph-loop/SKILL.md) · [qa-plan](qa-plan/SKILL.md) | Individual CRESCENT phases |
| [grill-me](grill-me/SKILL.md) | Adversarial review of a proposal or plan |

---

## Skills with supporting files

`laravel-native-abstractions` follows the official guidance of keeping `SKILL.md` short and
moving detail into files that load only when relevant:

```text
laravel-native-abstractions/
├── SKILL.md                    ← core rules, discovery workflow, anti-pattern table, navigation
├── references/                 ← one file per concern; load only what the task touches
│   ├── eloquent-relationships.md
│   ├── eloquent-persistence.md
│   ├── query-builder-and-sql.md
│   ├── cache-and-locks.md
│   ├── http-client.md
│   ├── requests-validation-authorization.md
│   ├── queues-events-scheduling.md
│   ├── concurrency-collections-helpers.md
│   ├── context-container-resources.md
│   └── testing.md
└── examples/
    └── dorak-refactors.md      ← real before/after cases from this repo
```

Apply the same structure to any skill that outgrows ~500 lines: keep `SKILL.md` as the core
rules plus a navigation table that says what each supporting file contains and when to load it.

Also read the project-level [AGENTS.md](../../AGENTS.md) for quick-start commands and config
notes, and [CLAUDE.md](../../CLAUDE.md) for the build protocol.
