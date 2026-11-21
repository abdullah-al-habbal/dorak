---
nodeid: docs.deployment.ci-cd-setup
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/
---

# CI/CD setup and manual checklist

Part of the [Dorak Deployment and Handover Guide](deployment-guide.md). Audit date: 2026-11-21.

## Workflows

| File | Trigger | Needs secrets | Runs in |
|---|---|---|---|
| `backend-ci.yml` | push and PR on `master`, `backend/**` | none (MySQL 8.4 service, `root/root`) | `backend/` (`defaults.run.working-directory`) |
| `dashboard-ci.yml` | push and PR on `master`, `frontend/web/dashboard/**` | none (placeholder build env) | `frontend/web/dashboard/` |
| `deploy.yml` | **manual** (`workflow_dispatch`) only | 4 `HOSTINGER_*` secrets | the Hostinger host, over SSH |

There is no CI for the Flutter apps yet. Deploy stays manual until hosting is in scope.

## GitHub state (last inspected 2026-11-20; not rechecked in this audit)

Repository secrets, repository variables and environments were all empty. No workflow reads a repository variable.

## What to configure in GitHub (Settings, Secrets and variables, Actions)

The deploy job declares `environment: development`, so the secrets must be created in that environment (Settings, Environments, `development`, Environment secrets). Repo-level secrets also resolve, but the job will not start until the environment exists or is auto-created on first run. Optionally add required reviewers to it.

| Secret | Value source |
|---|---|
| `HOSTINGER_SERVER_IP` | `82.25.83.69` (hPanel SSH access) |
| `HOSTINGER_USERNAME` | `u685718414` |
| `HOSTINGER_SSH_PORT` | `65002` (verified SSH alias) |
| `HOSTINGER_SSH_PRIVATE_KEY` | Dedicated CI private key; add only its public half in hPanel SSH access. Keep the private half in GitHub Secrets. |

Use a key pair made only for this repo. Do not reuse a personal key, and do not reuse the key of another Hostinger account.

## Hostinger account findings and deployment status

The account-specific findings are tracked in [Hostinger findings and deployment
readiness](hostinger-questions.md). The verified SSH alias is
`hostinger-internationalboard` (`82.25.83.69:65002`, user `u685718414`). The
server uses `/home/u685718414/domains/dev-dorak-backend.io/public_html`; its
siblings are `DO_NOT_UPLOAD_HERE` and `shared`. The active `current -> dev`
symlink and root `.htaccess` rewrite to `current/public` are present. Do not
reuse or alter SSH aliases and keys for other accounts/projects. The workflow's
target is the actual `public_html/dev` release directory; it must never target
`DO_NOT_UPLOAD_HERE`.

## What to configure on the Hostinger server

1. Confirmed over SSH: Git 2.52.0, PHP 8.5.13 at `/opt/alt/php85/usr/bin/php`, `composer2` 2.9.8, and `proc_open` enabled in CLI. The existing deploy key can read the GitHub repository with strict host-key verification.
2. The shared `.env` exists at `/home/u685718414/domains/dev-dorak-backend.io/shared/.env` with mode `600`; the deployed release links to it. Shared storage is linked from the release. Shell `ln`, `flock`, and `rsync` are available; the `symlink()` PHP function is disabled.
3. PHP CLI disables `system`, `exec`, `shell_exec`, and `passthru`; the workflow uses shell commands and Composer's working `proc_open`. It must use the explicit PHP 8.5 path and `composer2`.
4. The live database is MariaDB 11.8.9, while CI intentionally tests only MySQL 8.4 because `TestDatabaseGuard` rejects MariaDB. Keep this difference documented; test compatibility before applying migrations.
5. The release directory is under `public_html/dev`, and the root `.htaccess` rewrites into `current/public`. Direct HTTP probes returned 404 for `dev/composer.json` and 403 for `.env`. The workflow's rename and current symlink strategy matches the existing layout. `DO_NOT_UPLOAD_HERE` is reserved.
6. The live Laravel scheduler runs `recommend:recompute-vectors` daily at 02:00. `schedule:list` succeeds because the shared environment sets `DB_CACHE_LOCK_TABLE=cache_locks`; `.env` is mode `600`. The `database` queue uses `jobs`; both `jobs` and `failed_jobs` currently contain zero rows. The SSH shell has no `crontab` executable, so the existing Hostinger cron list could not be inspected or changed from SSH. Check it in hPanel, then add the entries below if absent. Do not run a long-lived worker.
7. On 2026-11-21 the live health endpoint returned HTTP 200 with only overall status, timestamp, and per-check status values. `/en/features` and `/en/pricing` both returned HTTP 200 after the localized aliases and targeted marketing-page seeders were applied. `APP_DEBUG=true` remains set intentionally on this development host; the public health payload no longer exposes it or runtime details.

## Current workflow status

The workflow remains manual and matches the existing `public_html/dev` plus `current -> dev` layout. It selects the verified PHP and Composer executables and requires strict Git host-key checking. Its release replacement uses two directory renames behind the stable `current -> dev` link, which leaves a brief interval when `current` points to no directory; this is not a zero-downtime atomic symlink switch. CI intentionally runs MySQL 8.4 because the backend test guard rejects MariaDB; the live server runs MariaDB 11.8.9. The deployed revision and schema predate local `master`, so CI does not establish migration compatibility with the live database. Review migrations and take a database backup before dispatch. The dashboard is not deployed by this workflow.

### Cron commands (after checking the hPanel cron list)

Use the stable `current` path so release swaps do not require editing cron. Hostinger's SSH account does not provide the `crontab` command; add these through hPanel only if equivalent Dorak entries are absent. The scheduler is safe to invoke every minute; Laravel selects due events. The queue command is bounded and lock-protected so overlapping invocations do not drain concurrently:

```cron
* * * * * /opt/alt/php85/usr/bin/php /home/u685718414/domains/dev-dorak-backend.io/public_html/current/artisan schedule:run --no-ansi >> /home/u685718414/domains/dev-dorak-backend.io/shared/storage/logs/scheduler.log 2>&1
* * * * * /usr/bin/flock -n /tmp/dorak-queue-worker.lock /opt/alt/php85/usr/bin/php /home/u685718414/domains/dev-dorak-backend.io/public_html/current/artisan queue:work --stop-when-empty --max-time=50 --no-ansi >> /home/u685718414/domains/dev-dorak-backend.io/shared/storage/logs/queue-worker.log 2>&1
```

These entries are recommendations, not confirmed active cron configuration. Verify Hostinger's cron interface and preserve unrelated entries before adding them.

## First manual deploy

1. Push the approved repository revision through the normal release process; local changes are not available to GitHub Actions until pushed.
2. Review migrations against MariaDB 11.8.9 and back up the database before a full release.
3. Check existing jobs in Hostinger hPanel and add the cron entries above if absent, preserving unrelated jobs.
4. Run a controlled manual deployment. Database migrations are not automatically rolled back if a deployment fails.
