---
nodeid: backend.claude
parentnode: backend.guide
childnodes: []
codeanchors:
  - backend/modules/
---

# Dorak Backend — AI Agent Orchestra (.CLAUDE.md)

## 📚 Source of Truth
Before building, read `docs/02-prd.md` then `docs/feature-index.md` to see what exists.

## 🛑 Rules
- **Before writing ANY new code, READ `.claude/skills/laravel-attributes/SKILL.md`** and use PHP class attributes (`#[Fillable]`, `#[Table]`, `#[Signature]`, ...) instead of class properties — mandatory for models, jobs, commands, requests, resources, factories, tests, DI.
- `declare(strict_types=1)`, `final` classes. Controllers banned — use invokable Actions.
- Models suffix `Model`, Actions suffix `Action`. Spatie Translatable for bilingual fields.
- `BaseModuleServiceProvider` extends all providers; it auto-mounts `Routes/Api/V1/*.php` at `/api/v1`. A module may split a route file by area, for example `dashboard.php`, `dashboard-admin.php`, `dashboard-owner.php` and `dashboard-operations.php`, to stay under the 300-line limit.
- Api response shape via `ApiResponseBodyValueObject` + `ApiResponseTrait` (paginated/ok/error). **Never call `response()->json(`** (enforced by `ApiResponseArchitectureTest`): domain errors extend `ConflictApiException` (409) or `ForbiddenApiException` (403); middleware and static helpers `use ApiResponseTrait`. See `docs/api-response-standard.md`.
- **Authorization is not ownership scoping.** A `where('*_id', $actor->id)` query filter is
  not an authorization check. Any Action that reads or mutates a resource another actor could
  own MUST authorize via a `*Policy` class + `$this->authorize()` / `Gate::allows()` / `->can()`.
  See `.claude/skills/laravel-native-abstractions/SKILL.md` (`references/requests-validation-authorization.md`)
  before adding or touching one of these paths — the repo has 33 `*Policy` classes (spread across
  the modules, each under `modules/*/Policies/`); some older paths still rely on scoped queries only, so
  do not copy that pattern into new code.
  Dashboard actions authorize through `Gate::forUser($actor)->authorize('dashboard.<resource>.<ability>', ...)`;
  the abilities are defined in `DashboardServiceProvider` and implemented in `modules/Dashboard/Policies/`.
- All validation lives in a `FormRequest` (`Http/Requests/`), never inline `$request->validate()`
  in an Action/Handler — see `.claude/skills/10StrictBackendArchitecture/SKILL.md`.
- Mass assignment is blocked by `#[Fillable([...])]` on every model — never widen it to `*`.
- Eager-load exactly what a Handler/Resource will access; check query counts for N+1 (Eloquent
  strict mode is off in this repo, so nothing fails loudly on its own) — see
  `laravel-native-abstractions` → `references/eloquent-relationships.md`.
- Keep Actions/Handlers/Resolvers single-purpose: one method, roughly ≤40 lines, one class
  ≤300 lines. A Handler needing 4+ loose parameters takes a CQRS Command/Query object instead
  (already the convention — see `cqrs-pattern`).
- No magic strings/numbers for statuses, codes, or thresholds — use a Backed Enum
  (`12StrictEnums`) or a named class constant.
- Class constants live in `Modules\<Module>\Constants\<Domain>Constants` (shared values in
  `Modules\Core\Constants`), never inside the consuming class. Name them `UPPER_SNAKE` with the
  domain as prefix (`BRANCH_FLOOR_PLAN_MAX_CANVAS_SIZE`). Migration-local constants are the only exception.
- SMS goes through the `SmsSender` strategy resolved by `SmsSenderFactory` — never call a
  gateway or `Http` from a feature module. New gateways follow `docs/17-sms-delivery.md`;
  failures throw `SmsDeliveryException` (no phone/code/secrets in the message, no retries).
- Booking row locks are taken in one order: client, chair, barber, then the booking row. Never lock the booking row first (deadlock, 1213). Changing it needs a failing `tests/Concurrency/` test first. See `docs/booking-concurrency/index.md` and `backend/AGENTS.md`.

## 🗺 Feature Index
After adding a feature, append entry to `docs/feature-index.md`.

## 🛠️ AI Agent Skills
Key skills under `.claude/skills/`:
| Skill | Trigger |
|---|---|
| **Laravel 13 Attributes** (`laravel-attributes`) | **Any new PHP code.** Mandatory read before writing models, jobs, commands, requests, resources, factories, tests, DI. Full attribute reference (36 new + pre-existing). |
| **Strict Backend Architecture** (`10StrictBackendArchitecture`) | Writing Actions, Resources, Requests, or Handlers. Enforces FormRequests, Command objects, strict imports, Resource composition. |

## 🚀 Protocol
1. Read `docs/02-prd.md` + `docs/feature-index.md`
2. Read relevant `.claude/skills/*/SKILL.md`
3. Implement → `vendor/bin/pint --test` + `composer test` (Pest, MySQL `dorak_test`)

`vendor/bin/pint --test` and `composer test` are the mandatory gates and what the Husky
pre-push hook enforces; CI additionally re-checks formatting.
