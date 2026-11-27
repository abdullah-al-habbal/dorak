---
nodeid: docs.waves.runbook
parentnode: docs.waves
childnodes: []
codeanchors:
  - backend/docker-compose.test.yml
  - frontend/web/dashboard/playwright.config.ts
  - scripts/release-dev.sh
---

# Wave runbook: commands and traps

Routes: [wave tracker](index.md) · [backlog](../backlog/index.md) · [gates](../../.claude/skills/monorepo-task-executor/references/gates.md)

## Safety rules

- Never print or commit secrets, tokens or `.env` values.
- Tests use only the disposable `dorak_test` database, one consumer at a time (never Pest and Playwright together). Take it down afterwards.
- Dev is deployed with `reset_database=false`. A dev-only reset is allowed when a wave edits an existing migration; tell the owner each time. Never reset production.
- No destructive Git commands, no `--no-verify`.

## Backend (`backend/`)

```bash
composer test:db:up
composer test                 # resets dorak_test, then the suite; on a memory limit: composer test:reset && php -d memory_limit=-1 vendor/bin/pest
composer test:concurrency
vendor/bin/pint --test
php scripts/check_migrations.php
composer audit
composer test:db:down
```

## Dashboard (`frontend/web/dashboard/`)

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

### Playwright: two traps on the owner's machine

1. Ports 3000 and 3001 belong to another project's containers. Never stop them. Playwright reuses any server already on its port, so use ports 3100 and 8100.
2. `php artisan serve` drops the `DB_*` variables when `.env` exists, unless it gets `--no-reload`. The server could then use the dev database while the test setup wipes `dorak_test`.

So start the backend yourself, with the test database up, from `backend/`:

```bash
export DB_CONNECTION=mysql DB_HOST=127.0.0.1 DB_PORT=3307 DB_USERNAME=root DB_PASSWORD=root DB_DATABASE=dorak_test DB_URL= \
  BROADCAST_CONNECTION=log MAIL_MAILER=log QUEUE_CONNECTION=sync SMS_DRIVER=log
php artisan serve --no-reload --host=127.0.0.1 --port=8100
```

(The credentials are the throwaway ones committed in `docker-compose.test.yml`.) Before the first run, confirm the server really uses `dorak_test`: wipe it and expect errors from the server, then migrate and expect success. Then, from the dashboard folder with the same variables:

```bash
TZ=UTC E2E_APP_PORT=3100 E2E_BACKEND_PORT=8100 npx playwright test
```

The full suite took about an hour (487 tests, 2026-11-26). Read the `N passed` line, not a pipe's exit code.

## Mobile (`frontend/mobile/`)

```bash
dart run melos run verify
```

## Release (repository root)

Push, wait for CI on the commit (`gh run list --commit <sha>`), then run `bash scripts/release-dev.sh`: it deploys with no reset, waits for Vercel and runs `scripts/verify-deploy.sh`. Run it only after CI passes; it does not wait for CI itself. A docs-only push needs no backend deploy.

## Dev limits

- Dev sign-in routes are throttled to 5 a minute; honour `Retry-After`.
- Reverb does not answer on dev (RR-20), and the queue cron is unconfirmed (RR-8), so live delivery cannot be tested there.
- After a live check that changes data (for example a brand suspension), restore it and verify the restore.

## Cleanup after the gates pass

```bash
(cd frontend/web/dashboard && npm run clean:artifacts && npx next typegen)
(cd backend && rm -f storage/logs/*.log)
(cd frontend/mobile && dart run melos run clean)
```
