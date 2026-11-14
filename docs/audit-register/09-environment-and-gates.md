# 09 Environment, gates and working rules

## Standing rules
- Local commits only: conventional type plus task number, subject at most 100 characters (husky `commit-msg`), trailer
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Never push, change remotes, use `--no-verify`, or destructive git.
  Preserve unrelated working-tree changes; stage only the task's files.
- No relative imports; imports at the top; `declare(strict_types=1)`; backend contract policy (change the backend, stay compatible with mobile).
- One slice per task; hygiene cleanup only after every gate passed, then `npx next typegen`.
- A deny rule blocks reading `.env` files. Do not edit `.env` or `.env.testing`.
- Device resources: the owner asked for gentle runs (one worker, `nice -n 15`, `ionice -c3`).

## Gate commands
- Backend: `cd backend && vendor/bin/pint --test && composer test`; `composer test:concurrency`; `php scripts/check_migrations.php`; `composer audit`.
- Dashboard: `cd frontend/web/dashboard && npm run lint && npm run typecheck && npx vitest run && npm run build`.
- Playwright (production build only, never `next dev`; only on `DB_DATABASE=dorak_test`; never wipe `dorak_backend_development_db`):
  `TZ=UTC E2E_APP_PORT=3100 E2E_BACKEND_PORT=8000 DB_CONNECTION=mysql DB_HOST=127.0.0.1 DB_PORT=3307 DB_USERNAME=root DB_PASSWORD=<from backend/phpunit.xml> DB_DATABASE=dorak_test nice -n 15 ionice -c3 npx playwright test`
  (full run about 40 minutes).
- Mobile: `cd frontend/mobile && dart run melos run verify`.
- Repo: `bash .claude/skills/monorepo-task-executor/scripts/check-conventions.sh`.
- Cleanup: `npm run clean:artifacts` in the dashboard; `rm -f backend/storage/logs/*.log`; `dart run melos run clean`; then `npx next typegen`.

## Machine facts
- Port 3000 belongs to unrelated `ecm-workflow-*` containers; two `next-server (v15.5.28)` processes and `chrome-headless-shell`
  under `/root/.cache` belong to other projects. Never stop them.
- Test DB on 127.0.0.1:3307 (`dorak_test`).

## Repository state at the time of writing
- Branch master, HEAD `ff7755c3`, 19 commits ahead of `origin/master`, nothing pushed.
- Documentation consolidated and committed locally by G-01 (`docs(audit): finalize implementation decisions and handover`); find it with
  `git log --oneline --grep "finalize implementation decisions"`. Application code is unchanged since `ff7755c3`.
- Last verified gates (2026-11-14): see [06](06-test-coverage-gaps.md) baseline line.

## Audit method and limits
- F-01: read-only, no Pest, Playwright, DB writes or migrations. F-05 (S1) was verified by the gates in [03](03-f05-session-lifecycle.md) section 8.6 (2026-11-15). Statements are "trace-confirmed, not executed".
  Exception, 2026-11-14 (T-01 audit): one throwaway Pest probe for F-05 ran against `dorak_test` only (127.0.0.1:3307), kept outside the repository; F-05 statements in
  [03](03-f05-session-lifecycle.md) section 5 are execution-confirmed. F-01 stays trace-only until T-02. No application code, `.env` or `.env.testing` was changed.
- Route and action inventories came from `route:list` and static scans kept in the session scratchpad; the F-01 route lists were
  copied into [02](02-f01-account-state-matrix.md) so they do not depend on the scratchpad.
- Earlier in the session the full transcript is at `/home/lenovo/.claude-personal/projects/-home-lenovo-work-projects-dorak/51a232af-afa6-4776-ab4e-23d2f4b3c294.jsonl`.
- Pest authorization (2026-11-15): container `dorak-test-db-mysql-1` is `Exited (255)`, nothing listens on 3307. Still stopped on 2026-11-15 (not started). Exact steps the owner must approve are in [03](03-f05-session-lifecycle.md) section 7.5 (`composer test:db:up`, then `vendor/bin/pest ...` or `composer test`, on `dorak_test` only; no `.env.testing` change).
