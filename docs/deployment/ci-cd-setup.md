---
nodeid: docs.deployment.ci-cd-setup
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/
---

# CI/CD setup and manual checklist

Part of the [Dorak Deployment and Handover Guide](deployment-guide.md). Last verified: 2026-11-22 (live checks, GitHub Actions runs, commit statuses and Vercel probes recorded below). Read-only smoke test: `scripts/verify-deploy.sh`.

## Workflows

| File | Trigger | Needs secrets | Runs in |
|---|---|---|---|
| `backend-ci.yml` | push and PR on `master`, `backend/**` | none (MySQL 8.4 service, `root/root`) | `backend/` (`defaults.run.working-directory`) |
| `dashboard-ci.yml` | push and PR on `master`, `frontend/web/dashboard/**`; `workflow_dispatch` | none (placeholder build env) | `frontend/web/dashboard/` |
| `mobile-ci.yml` | push and PR on `master`, `frontend/mobile/**`; `workflow_dispatch` (input `build_artifacts`, default true) | none | `frontend/mobile/` |
| `deploy.yml` | **manual** (`workflow_dispatch`) only; input `reset_database` (default false) | 4 `HOSTINGER_*` secrets | the Hostinger host, over SSH |

The dashboard is **not** deployed by any workflow: Vercel builds it (see [Vercel dashboard hosting](vercel-dashboard.md)).

**Dashboard CI has never run** (2026-11-22: workflow ID `425966822`, zero runs). The file is valid YAML and is on `origin/master`; it is registered, but `gh workflow list` omits it and the GitHub API listing was inconsistent between calls (Backend CI flipped to `deleted` while still viewable by ID). Its push filter fires only for pushes that touch `frontend/web/dashboard/**` or the workflow file, and no such push has produced a run. The `workflow_dispatch` trigger was added so it can be started on demand once pushed; dispatch it once to confirm it is green before requiring it as a branch-protection check.

### Mobile CI (`mobile-ci.yml`)

- **`verify`** (every mobile push/PR): Flutter 3.44.5 (`FLUTTER_VERSION`), `dart pub get`, `melos bootstrap`, then `melos run generate`, `build`, `analyze`, `taxonomy`, `test`. Each app declares `.env` as an asset but the file is git-ignored, so the job copies `apps/*/.env.example` to `.env` first (non-secret placeholders that point at the dev API).
- **`android-apk`** and **`flutter-web`** (only on `workflow_dispatch` with `build_artifacts=true`, after `verify` passes): one matrix job per app (`client_app`, `business_app`, `stylist_app`) running `flutter build apk --release --flavor dev` (output `app-dev-release.apk`; prod builds pass `--flavor prod`) / `flutter build web --release` and uploading `<app>-apk` / `<app>-web` artifacts (14-day retention). APKs are signed with the **debug key** because CI has no `key.properties`: fine for sideloading MVP testers, rejected by every store. Store releases stay deferred until market traction.
- **Concurrency:** a newer run on the same ref cancels the older one, so dispatching right after a push cancels that push's `verify` run. The dispatched run is a superset.
- **Android build fixes this workflow forced (all three apps):** `compileSdk = 37` (`flutter_secure_storage` requires API 37; Flutter 3.44 defaults to 36) and `android/app/proguard-rules.pro` with `-dontwarn org.slf4j.impl.StaticLoggerBinder` wired into the release build type (R8 otherwise fails on the optional slf4j binder). `flutter_local_notifications` also requires core library desugaring (`desugar_jdk_libs` in `android/app/build.gradle.kts`) and, through `androidx.core` 1.19.0, AGP 9.1.0 or newer; the apps use AGP 9.1.1 with Gradle 9.3.1, which supports API 37, so `android.suppressUnsupportedCompileSdk` is gone. CI status of this change: backlog RR-18.
- **Tests must not depend on the machine timezone.** `branch_repository_test` once built a local `DateTime` and only passed at UTC+3; the CI runner is UTC. Use `DateTime.utc` or an offset-qualified `DateTime.parse`.
- **Flutter Web and CORS:** the web bundles call the API from the browser. There is no `backend/config/cors.php`, so Laravel's framework defaults apply (`api/*`, all origins, no credentials). A real cross-origin request from a deployed web bundle has not been tested; do that before sharing a web build. Where the bundles are hosted is undecided.
- Last verified run: `44918280902` (verify, 3 APKs of 26-28 MB, 3 web bundles of about 14 MB, all green). Recorded 2026-11-21, before `1ab76c269` (push notifications P1.3); GitHub returned 404 for this run on 2026-11-26. The next manual APK run GitHub lists, `45728727288`, failed (backlog RR-18).

## Local dashboard gate baseline (2026-11-22)

The same steps as `dashboard-ci.yml`, run locally on Node 22.22.1 with the placeholder env (`BACKEND_API_URL`, `DASHBOARD_SESSION_SECRET`, `NEXT_TELEMETRY_DISABLED`), all exit 0: `npm ci`, `npm run lint`, `npx next typegen`, `npm run typecheck`, `npm test` (**203 files, 1075 tests, all passed**), `npm run build`. Commands run from `frontend/web/dashboard/`; run `npm run clean:artifacts` afterwards.

Notes from that run:
- `npm ci` hit `ERR_SOCKET_TIMEOUT` twice on a flaky connection and left no `node_modules` (it deletes the folder first), so later steps failed with exit 127 (command not found). That is a network symptom, not a code failure. It passed with `npm ci --maxsockets=2 --prefer-offline --fetch-timeout=300000 --fetch-retries=8`.
- npm printed `EBADENGINE` warnings: `jsdom@30` and related packages want Node `^22.22.2`, while the local Node was 22.22.1. CI uses `node-version: 22` (latest 22.x), so it satisfies them.

Dashboard re-run after the Arabic sidebar and header fixes (same steps, all exit 0): `npm test` now shows **204 files, 1077 tests passed** (the baseline above was 203 and 1075).

## GitHub state

Last inspected 2026-11-20 (not rechecked since): repository secrets and variables were empty and no workflow reads a repository variable. The four `HOSTINGER_*` secrets live in the `development` **environment**, which the 2026-11-21 deploys used successfully. The `dorak` deploy key is registered (the clone succeeded). Branch protection on `master` was checked on 2026-11-22: `GET branches/master/protection` returns 404, so `master` is **unprotected** and no check is required.

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

1. Confirmed over SSH: Git 2.52.0, PHP 8.5.13 at `/opt/alt/php85/usr/bin/php`, `composer2` 2.9.8, and `proc_open` enabled in CLI. The old `~/.ssh/deploy_key` is bound to a different GitHub repository and reads `dorak` only because `dorak` is public; the workflow therefore uses the dedicated `~/.ssh/dorak_deploy_key`, which is generated but still has to be registered on GitHub (see the pre-deploy checklist).
2. The shared `.env` exists at `/home/u685718414/domains/dev-dorak-backend.io/shared/.env` with mode `600`; the deployed release links to it. Shared storage is linked from the release. Shell `ln`, `flock`, and `rsync` are available; the `symlink()` PHP function is disabled.
3. PHP CLI disables `system`, `exec`, `shell_exec`, and `passthru`; the workflow uses shell commands and Composer's working `proc_open`. It must use the explicit PHP 8.5 path and `composer2`.
4. The live database is MariaDB 11.8.9, while CI intentionally tests only MySQL 8.4 because `TestDatabaseGuard` rejects MariaDB. Keep this difference documented; test compatibility before applying migrations.
5. The release directory is under `public_html/dev`, and the root `.htaccess` rewrites into `current/public`. Direct HTTP probes returned 404 for `dev/composer.json` and 403 for `.env`. The workflow's rename and current symlink strategy matches the existing layout. `DO_NOT_UPLOAD_HERE` is reserved.
6. The live Laravel scheduler runs `recommend:recompute-vectors` daily at 02:00. `schedule:list` succeeds because the shared environment sets `DB_CACHE_LOCK_TABLE=cache_locks`; `.env` is mode `600`. The `database` queue uses `jobs`; both `jobs` and `failed_jobs` currently contain zero rows. The SSH shell has no `crontab` executable, so the existing Hostinger cron list could not be inspected or changed from SSH. Check it in hPanel, then add the entries below if absent. Do not run a long-lived worker.
7. On 2026-11-21 the live health endpoint returned HTTP 200 with only overall status, timestamp, and per-check status values. `/en/features` and `/en/pricing` both returned HTTP 200 after the localized aliases and targeted marketing-page seeders were applied. `APP_DEBUG=false` is set in the shared `.env` and in the cached config (verified 2026-11-21 after the reset deploy); unknown routes return a bare 404 envelope, and the health payload exposes no runtime details.

## Current status (2026-11-21)

| Area | State | Evidence |
|---|---|---|
| Backend on Hostinger (`dev-dorak-backend.io`) | **Live and healthy**, release of commit `19e52c81e`, dev database reset and seeded | Deploy run `44915144212` green (50 s) |
| `APP_DEBUG` | `false` in `shared/.env` and in the cached `bootstrap/cache/config.php` | read over SSH after the deploy |
| `GET /api/v1/health` | 200, `{status, timestamp, checks.{app,database,cache,php,queue}.status}` only | curl |
| Unknown route | bare 404 `{"message":"Not found",...,"request_id"}`, no trace or file paths | curl |
| Migrations | 73 ran, 0 pending (flattened set from `c6f953ff1`) | `artisan migrate:status` |
| Queue tables | `jobs` 0, `failed_jobs` 0 | tinker |
| Laravel log | only the old failed-migration entry from the 13:23 run; nothing after the reset deploy | `shared/storage/logs` |
| Seed | `DatabaseSeeder` ran in `development`; 1 admin row | tinker |
| Cron (`schedule:run`, `queue:work`) | **not confirmed**: `scheduler.log` and `queue-worker.log` do not exist, so the hPanel entries were probably never added. Queued jobs are not processed until they are. | ssh `ls` |
| Dashboard on Vercel | Ready at `dorak-bay.vercel.app`, built from `ec7b19a39`; reaches the backend; `origin/master` is at `2befdb3df` (the earlier local commits were pushed 2026-11-22); admin sign-in verified (secrets match); Arabic sidebar and header fixes pending the next push | see [Vercel dashboard hosting](vercel-dashboard.md) |
| Mobile CI | green, APK and web artifacts build | run `44918280902` |

### Resetting the development database

The workflow takes a boolean input `reset_database` (default `false`). When true it runs `migrate:fresh --seed --force` instead of `migrate --force`, dropping **every table** and re-running `DatabaseSeeder`. It is refused unless `DORAK_ENVIRONMENT` is `development`. Run it from Actions, Run workflow, or `gh workflow run deploy.yml -f reset_database=true`.

Use it only when the migration set was rewritten and the live schema no longer matches (this happened with the flattened migrations of `c6f953ff1`: a plain `migrate` died with `Table 'barbers' already exists`). Ordering caveat: the reset runs **before** the directory swap, so the previous release serves traffic against the fresh schema for the duration of the run. Acceptable for disposable dev data, not for anything else. Without the flag the workflow behaves as before.

### Workflow behaviour

The workflow stays manual and matches the existing `public_html/dev` plus `current -> dev` layout. It selects the verified PHP and Composer executables and requires strict Git host-key checking. Its release replacement uses two directory renames behind the stable `current -> dev` link, which leaves a brief interval when `current` points to no directory; this is not a zero-downtime atomic symlink switch. Caches (`config`, `route`, `view`) are built only after the swap, at the final path, and asserted free of `_release_` paths. A failed run restores the previous release but **never rolls back the database**. CI runs MySQL 8.4 because the backend test guard rejects MariaDB; the live server runs MariaDB 11.8.9, so CI does not prove MariaDB compatibility. The reset deploy above applied the full migration set to MariaDB successfully. Take a database backup before any deploy that is not a reset.

### Cron commands (after checking the hPanel cron list)

Use the stable `current` path so release swaps do not require editing cron. Hostinger's SSH account does not provide the `crontab` command; add these through hPanel only if equivalent Dorak entries are absent. The scheduler is safe to invoke every minute; Laravel selects due events. The queue command is bounded and lock-protected so overlapping invocations do not drain concurrently:

```cron
* * * * * /opt/alt/php85/usr/bin/php /home/u685718414/domains/dev-dorak-backend.io/public_html/current/artisan schedule:run --no-ansi >> /home/u685718414/domains/dev-dorak-backend.io/shared/storage/logs/scheduler.log 2>&1
* * * * * /usr/bin/flock -n /tmp/dorak-queue-worker.lock /opt/alt/php85/usr/bin/php /home/u685718414/domains/dev-dorak-backend.io/public_html/current/artisan queue:work --stop-when-empty --max-time=50 --no-ansi >> /home/u685718414/domains/dev-dorak-backend.io/shared/storage/logs/queue-worker.log 2>&1
```

These entries are recommendations, not confirmed active cron configuration. Verify Hostinger's cron interface and preserve unrelated entries before adding them.

## Pre-deploy owner checklist (GitHub and hPanel)

1. GitHub, Settings, Environments: create `development` and add the secrets `HOSTINGER_SERVER_IP` (82.25.83.69), `HOSTINGER_USERNAME` (`u685718414`), `HOSTINGER_SSH_PORT` (read it from hPanel, SSH access) and `HOSTINGER_SSH_PRIVATE_KEY` (a private key whose public half is in the account's authorized keys).
2. GitHub, Settings, Deploy keys: add the contents of `~/.ssh/dorak_deploy_key.pub` as read-only. Verify with `ssh -i ~/.ssh/dorak_deploy_key -o IdentitiesOnly=yes -T git@github.com` on the server; it must greet `abdullah-al-habbal/dorak`.
3. GitHub, Settings, Branches: protect `master` and require the Backend CI and Dashboard CI checks (currently unprotected; tracked as RR-9 in the [backlog](../backlog/index.md)).
4. Server: `APP_DEBUG=false` in `shared/.env` (keep mode 600), **done and verified 2026-11-21**. Note the cached config is what Laravel reads: a changed `.env` only takes effect after the next deploy (or `config:cache`). Before the reset deploy the `.env` already said `false` while the stale cache from the old release still said `true`, which is why unknown routes leaked stack traces.
5. hPanel, Cron Jobs: add the two every-minute entries above.
6. Push the approved commits, then run the workflow manually (done 2026-11-21).
7. Vercel: confirm in the UI that the Git connection, production branch `master` and root directory `frontend/web/dashboard` are set (a `Vercel` commit status already appears on `origin/master`; see [Vercel dashboard hosting](vercel-dashboard.md)).

## Manual deploy runbook

1. Push the approved revision; Actions only sees pushed commits.
2. Back up the database (skip for a `reset_database=true` run on disposable dev data).
3. Dispatch `deploy.yml` (add `-f reset_database=true` only after a migration rewrite). Migrations are not rolled back on failure.
4. Verify: `curl https://dev-dorak-backend.io/api/v1/health` is 200 with only status fields; an unknown `/api/v1/...` path returns a bare 404; over SSH `grep "'debug'" bootstrap/cache/config.php` shows `false`, `artisan migrate:status` has no pending rows, `jobs`/`failed_jobs` are empty and the newest `shared/storage/logs/laravel-*.log` has no new errors.
5. Check the hPanel cron entries exist (see above; open item RR-8 in the [backlog](../backlog/index.md)).
6. Run `scripts/verify-deploy.sh`; it must print `verify-deploy OK`.
