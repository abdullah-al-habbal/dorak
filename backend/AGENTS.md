---
nodeid: backend.guide
parentnode: repo.root
childnodes:
  - backend.claude
  - backend.docs
  - backend.process
  - backend.readme
  - backend.website
  - skills.backend
  - backend.guide.part-2
codeanchors:
  - backend/modules/
  - backend/bootstrap/
---

## Quick start

Documentation routes: [product documentation](docs/README.md) · [repository graph](../docs/index.md).

```bash
composer setup          # install + .env + key:generate + migrate + npm
composer dev            # server, queue, logs, vite concurrently
composer test           # config:clear + pest/phpunit (MySQL dorak_test via .env.testing)
```

- Husky pre-push hook runs `pint --test` + `composer test` before every push; CI only checks formatting (`pint --test`). Tests are gated locally, not in CI.

## Architecture

- **Core module** `Modules\Core` — foundation config, migrations, shared infrastructure. Feature modules (e.g. `Modules\Client`) add their own providers via `bootstrap/providers.php`.
- No `app/`, `config/`, `routes/` directories
- `bootstrap/app.php` registers `AssignRequestUuidMiddleware` globally; API routes return JSON
- `Modules\Core\Providers\ApplicationServiceProvider::loadAppConfig()` manually `require`s every file in `modules/Core/Config/*.php` and sets config key = filename — Laravel does NOT auto-load these. It **skips when config is cached** (keys already baked into `config.php`; re-requiring would call `env()` which returns null after caching) and **preserves `app.providers`** (injected from `bootstrap/providers.php` — clobbering it breaks provider registration after `config:cache`).
- Translations loaded from `modules/Core/lang/` under `core::` namespace
- Migrations loaded from `modules/Core/Database/Migrations/`
- Error handling via `ErrorCodeEnum` (string backed) with HTTP status + `core::messages.*` lang keys
- `AssignRequestUuidMiddleware` injects UUID into every request

## Config & .env

- All `env()` calls in config files have **no defaults** (2nd arg removed). Every key equals a `.env` / `.env.example` entry.
- `.env` is gitignored. `.env.example` is the reference with all ~100 keys.
- `AUTH_MODEL` is hardcoded as `ClientModel::class` in auth.php — not env-driven (no backslash in .env).
- `MAIL_SENDMAIL_PATH` must be quoted in .env: `"/usr/sbin/sendmail -bs -i"` (space in value).

## Technical Concepts

Before implementing any feature, read `docs/13-technical-concepts.md` — mandatory CRUD patterns (optimistic/pessimistic updates, version locking, idempotency keys, soft delete, PATCH vs PUT, race conditions, batch operations, retry backoff, consistency models, field projection) and Flutter/Laravel integration patterns.

## Code conventions

- **Before writing ANY new code, read `.claude/skills/laravel-attributes/SKILL.md`** — full Laravel 13 attribute reference. Use attributes (not properties) for models, jobs, commands, requests, resources, factories, tests, DI.
- `declare(strict_types=1)` on every file
- Final classes for service providers and middleware
- PHP 8 attributes for Eloquent model meta (`#[Fillable]`, `#[Hidden]`, `#[Table]`, `#[Translatable]`)
- PSR-4: `Modules\\` → `modules/`, `Database\\Seeders\\` → `database/seeders/`, `Tests\\` → `tests/`
- Test config targets a dedicated MySQL/MariaDB test DB via gitignored `.env.testing` (DB `dorak_test`), array cache/session/mail, sync queue

## Continued in

- [Part 2: Remaining Gaps (from docs/02-prd.md §5 + §8)](agents-part-2.md)
