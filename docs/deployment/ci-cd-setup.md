---
nodeid: docs.deployment.ci-cd-setup
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/
---

# CI/CD setup and manual checklist

Part of the [Dorak Deployment and Handover Guide](deployment-guide.md). What is deployed now and what was last probed is in [dev environment status](dev-environment-status.md). Read-only smoke test: `scripts/verify-deploy.sh`.

## Workflows

| File | Trigger | Needs secrets | Runs in |
|---|---|---|---|
| `backend-ci.yml` | push and PR on `master`, `backend/**` | none (MySQL 8.4 service, `root/root`) | `backend/` (`defaults.run.working-directory`) |
| `dashboard-ci.yml` | push and PR on `master`, `frontend/web/dashboard/**`; `workflow_dispatch` | none (placeholder build env) | `frontend/web/dashboard/` |
| `mobile-ci.yml` | push and PR on `master`, `frontend/mobile/**`; `workflow_dispatch` (input `build_artifacts`, default true) | none | `frontend/mobile/` |
| `docs-ci.yml` | push and PR on `master`, every path | none | repository root (`scripts/check_docs.py`) |
| `deploy.yml` | **manual** (`workflow_dispatch`) only; input `reset_database` (default false) | 4 `HOSTINGER_*` secrets | the Hostinger host, over SSH |

The dashboard is **not** deployed by any workflow: Vercel builds it (see [Vercel dashboard hosting](vercel-dashboard.md)).

Dashboard CI runs lint, route type generation, typecheck, Vitest and a build (latest run checked on 2026-11-27: success on `a712aca7f`).

### Mobile CI (`mobile-ci.yml`)

- **`verify`** (every mobile push/PR): Flutter 3.44.5 (`FLUTTER_VERSION`), `dart pub get`, `melos bootstrap`, then `melos run generate`, `build`, `analyze`, `taxonomy`, `test`. Each app declares `.env` as an asset but the file is git-ignored, so the job copies `apps/*/.env.example` to `.env` first (non-secret placeholders that point at the dev API).
- **`android-apk`** and **`flutter-web`** (only on `workflow_dispatch` with `build_artifacts=true`, after `verify` passes): one matrix job per app (`client_app`, `business_app`, `stylist_app`) running `flutter build apk --release --flavor dev` (output `app-dev-release.apk`; prod builds pass `--flavor prod`) / `flutter build web --release` and uploading `<app>-apk` / `<app>-web` artifacts (14-day retention). APKs are signed with the **debug key** because CI has no `key.properties`: fine for sideloading MVP testers, rejected by every store. Store releases stay deferred until market traction.
- **Concurrency:** a newer run on the same ref cancels the older one, so dispatching right after a push cancels that push's `verify` run. The dispatched run is a superset.
- **Android build fixes this workflow forced (all three apps):** `compileSdk = 37` (`flutter_secure_storage` requires API 37; Flutter 3.44 defaults to 36) and `android/app/proguard-rules.pro` with `-dontwarn org.slf4j.impl.StaticLoggerBinder` wired into the release build type (R8 otherwise fails on the optional slf4j binder). `flutter_local_notifications` also requires core library desugaring (`desugar_jdk_libs` in `android/app/build.gradle.kts`) and, through `androidx.core` 1.19.0, AGP 9.1.0 or newer; the apps use AGP 9.1.1 with Gradle 9.3.1, which supports API 37, so `android.suppressUnsupportedCompileSdk` is gone. CI status of this change: backlog RR-18.
- **Tests must not depend on the machine timezone.** `branch_repository_test` once built a local `DateTime` and only passed at UTC+3; the CI runner is UTC. Use `DateTime.utc` or an offset-qualified `DateTime.parse`.
- **Flutter Web and CORS:** the web bundles call the API from the browser. There is no `backend/config/cors.php`, so Laravel's framework defaults apply (`api/*`, all origins, no credentials). A real cross-origin request from a deployed web bundle has not been tested; do that before sharing a web build. Where the bundles are hosted is undecided.
- The newest APK and web artifact builds are tracked under backlog RR-18; builds run only when dispatched with `build_artifacts`.

## Running the dashboard gates locally

Use the steps and placeholder environment of `dashboard-ci.yml`. `npm ci` deletes `node_modules` first, so a network
timeout leaves later steps failing with "command not found"; retry with `--maxsockets=2 --prefer-offline`. Run
`npm run clean:artifacts` afterwards.

## What to configure in GitHub (Settings, Secrets and variables, Actions)

The deploy job declares `environment: development`, so the secrets must be created in that environment (Settings, Environments, `development`, Environment secrets). Repo-level secrets also resolve, but the job will not start until the environment exists or is auto-created on first run. Optionally add required reviewers to it.

| Secret | Value source |
|---|---|
| `HOSTINGER_SERVER_IP` | `82.25.83.69` (hPanel SSH access) |
| `HOSTINGER_USERNAME` | `u685718414` |
| `HOSTINGER_SSH_PORT` | `65002` (verified SSH alias) |
| `HOSTINGER_SSH_PRIVATE_KEY` | Dedicated CI private key; add only its public half in hPanel SSH access. Keep the private half in GitHub Secrets. |

Use a key pair made only for this repo. Do not reuse a personal key, and do not reuse the key of another Hostinger account.

## The Hostinger server

SSH alias `hostinger-internationalboard` (`82.25.83.69:65002`, user `u685718414`; if the system SSH include blocks it,
use `ssh -F ~/.ssh/config`). Don't reuse or change the keys and aliases of other accounts or projects.

- **Layout:** the root is `/home/u685718414/domains/dev-dorak-backend.io/public_html`, with the siblings
  `DO_NOT_UPLOAD_HERE` (a marker, never a target) and `shared`. A root `.htaccess` rewrites through
  `current -> dev` to `current/public`. The release directory is `public_html/dev`.
- **Environment:** `shared/.env` (mode `600`) and shared storage are linked into the release. Never print or copy its
  values. The database host is `localhost`. The shared `.env` sets `DB_CACHE_LOCK_TABLE=cache_locks`.
- **Tools:** PHP 8.5 at `/opt/alt/php85/usr/bin/php`, `composer2`, Git, `ln`, `flock`, `rsync`. PHP disables
  `system`, `exec`, `shell_exec`, `passthru` and `symlink`; `proc_open` works.
- **Keys:** the workflow uses `~/.ssh/dorak_deploy_key`. The older `~/.ssh/deploy_key` belongs to another
  repository; leave it alone.
- **Database:** the server runs MariaDB while CI tests only MySQL 8.4, so CI doesn't prove MariaDB compatibility.
- **Cron and queue:** the SSH shell has no `crontab`, so cron is managed in hPanel. Don't run a long-lived worker.
- **Limits and logs:** 1 CPU core, 2 GB RAM, 20 GB disk, 400,000 inodes (as reported on 2026-11-21); outgoing ports
  are open except 0 and 25. PHP errors are under `.logs` in the File Manager; access logs are kept for 7 days.

### Resetting the development database

The workflow takes a boolean input `reset_database` (default `false`). When true it runs `migrate:fresh --seed --force` instead of `migrate --force`, dropping **every table** and re-running `DatabaseSeeder`. It is refused unless `DORAK_ENVIRONMENT` is `development`. Run it from Actions, Run workflow, or `gh workflow run deploy.yml -f reset_database=true`.

Use it only when the migration set was rewritten and the live schema no longer matches (this happened with the flattened migrations of `c6f953ff1`: a plain `migrate` died with `Table 'barbers' already exists`). Ordering caveat: the reset runs **before** the directory swap, so the previous release serves traffic against the fresh schema for the duration of the run. Acceptable for disposable dev data, not for anything else. Without the flag the workflow behaves as before.

### Workflow behaviour

The workflow stays manual and matches the existing `public_html/dev` plus `current -> dev` layout. It selects the verified PHP and Composer executables and requires strict Git host-key checking. Its release replacement uses two directory renames behind the stable `current -> dev` link, which leaves a brief interval when `current` points to no directory; this is not a zero-downtime atomic symlink switch. Caches (`config`, `route`, `view`) are built only after the swap, at the final path, and asserted free of `_release_` paths. A failed run restores the previous release but **never rolls back the database**. CI runs MySQL 8.4 because the backend test guard rejects MariaDB; the live server runs MariaDB 11.8.9, so CI does not prove MariaDB compatibility. Take a database backup before any deploy that is not a reset.

### Cron commands (after checking the hPanel cron list)

Use the stable `current` path so release swaps do not require editing cron. Hostinger's SSH account does not provide the `crontab` command; add these through hPanel only if equivalent Dorak entries are absent. The scheduler is safe to invoke every minute; Laravel selects due events. The queue command is bounded and lock-protected so overlapping invocations do not drain concurrently:

```cron
* * * * * /opt/alt/php85/usr/bin/php /home/u685718414/domains/dev-dorak-backend.io/public_html/current/artisan schedule:run --no-ansi >> /home/u685718414/domains/dev-dorak-backend.io/shared/storage/logs/scheduler.log 2>&1
* * * * * /usr/bin/flock -n /tmp/dorak-queue-worker.lock /opt/alt/php85/usr/bin/php /home/u685718414/domains/dev-dorak-backend.io/public_html/current/artisan queue:work --stop-when-empty --max-time=50 --no-ansi >> /home/u685718414/domains/dev-dorak-backend.io/shared/storage/logs/queue-worker.log 2>&1
```

These entries are recommendations, not confirmed active cron configuration. Verify Hostinger's cron interface and preserve unrelated entries before adding them.

## First-time setup

1. GitHub: create the `development` environment with the four `HOSTINGER_*` secrets (see above).
2. GitHub, deploy keys: add the server's `~/.ssh/dorak_deploy_key.pub` as read-only.
3. Server: `APP_DEBUG=false` in `shared/.env`. Laravel reads the cached config, so a changed `.env` takes effect only
   after the next deploy or `config:cache`.
4. hPanel: add the two cron entries above (open as RR-8 in the [backlog](../backlog/index.md), with branch protection
   as RR-9).
5. Vercel: check the Git connection, production branch and root directory ([Vercel setup](vercel-dashboard.md)).

## Manual deploy runbook

1. Push the approved revision; Actions only sees pushed commits.
2. Back up the database (skip for a `reset_database=true` run on disposable dev data).
3. Dispatch `deploy.yml` (add `-f reset_database=true` only after a migration rewrite). Migrations are not rolled back on failure.
4. Verify: `curl https://dev-dorak-backend.io/api/v1/health` is 200 with only status fields; an unknown `/api/v1/...` path returns a bare 404; over SSH `grep "'debug'" bootstrap/cache/config.php` shows `false`, `artisan migrate:status` has no pending rows, `jobs`/`failed_jobs` are empty and the newest `shared/storage/logs/laravel-*.log` has no new errors.
5. Check the hPanel cron entries exist (see above; open item RR-8 in the [backlog](../backlog/index.md)).
6. Run `scripts/verify-deploy.sh`; it must print `verify-deploy OK`.
