---
nodeid: skills.backend
parentnode: backend.guide
childnodes:
  - skills.backend.10-strict-backend-architecture
  - skills.backend.12-strict-enums
  - skills.backend.api-response-standard
  - skills.backend.architecture
  - skills.backend.coding-standards
  - skills.backend.cqrs-pattern
  - skills.backend.database-conventions
  - skills.backend.feature-flags
  - skills.backend.grill-me
  - skills.backend.how-to-add-a-module
  - skills.backend.how-to-add-a-route
  - skills.backend.laravel-attributes
  - skills.backend.laravel-migrations-baseline
  - skills.backend.laravel-module-architecture-baseline
  - skills.backend.laravel-native-abstractions
  - skills.backend.laravel-testing-baseline
  - skills.backend.logging-and-tracing
  - skills.backend.prototype
  - skills.backend.research
  - skills.backend.testing
  - skills.backend.to-prd
  - skills.backend.translation-conventions
  - skills.backend.part-2
  - skills.backend.part-3
codeanchors:
  - backend/modules/
---

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

## Continued in

- [Part 2: Data and persistence](readme-part-2.md)
- [Part 3: Skills with supporting files](readme-part-3.md)
