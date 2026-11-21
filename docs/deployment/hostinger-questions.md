---
nodeid: docs.deployment.hostinger-questions
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/deploy.yml
---

# Hostinger findings and deployment readiness

Part of the [CI/CD setup and checklist](ci-cd-setup.md). Findings supplied from
Hostinger account information and verified over SSH on 2026-11-21. The alias
works with `ssh -F ~/.ssh/config hostinger-internationalboard`; the system SSH
config include has invalid ownership/permissions and prevents the shorter
command from starting in this environment.

Never store private keys, `.env` content, or passwords in this document.

## Site overview

- The home, Features, and Pricing pages load and HTTPS is active.
- `/en/features` and `/en/pricing` returned HTTP 200 on 2026-11-21. The old
  deployed release lacked localized aliases and marketing-page rows; the
  targeted seeders and route updates are now applied. The home/features/pricing
  records are present.
- No reliable visitor counts, dated publish history, or current speed score are
  available. The pages were reachable when checked; this is not a traffic or
  performance baseline.
- The live health endpoint returned HTTP 200 on 2026-11-21 with only overall
  status, timestamp, and per-check status values. It no longer exposes
  `APP_ENV`, `APP_DEBUG`, runtime versions, extensions, or database/cache
  implementation details. `APP_DEBUG=false` (shared `.env` and cached config)
  after the 2026-11-21 reset deploy; the earlier `true` was a stale config cache
  from the old release.
- Hostinger's access logs are available for up to 7 days. Current web-server
  error log has no entries.

## A. SSH access

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| A1 | Where are SSH host/IP, port, and username? | Verified alias `hostinger-internationalboard`: host `82.25.83.69`, port `65002`, user `u685718414`. | `ok`; GitHub secrets must match these values. |
| A2 | Is SSH available and enabled? | hPanel reports SSH status ACTIVE. | `ok` |
| A3 | How to add a public key, and what is the limit? | Existing hPanel key is `internationalboard-production-20251201`. | `answered`; preserve it and do not use it for a different account/project. Add a dedicated Actions key only if required. |
| A4 | Can SSH logins be restricted by IP or allowlisted for GitHub runners? | IP Manager is documented for website traffic, not SSH login allowlists. No hPanel SSH allowlist/disable control was documented. | `ok`; use SSH key authentication, not runner-IP allowlists. |
| A5 | Are there SSH rate limits or firewall constraints? | No customer-configurable SSH rate-limit value is documented. SSH host-key fingerprints are shown on the SSH access page. | `answered`; one connection per workflow, avoid bursts, back off retries, and verify host fingerprints. |

## B. Server tooling

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| B6 | Which CLI PHP versions are available, and can `php8.5` be selected? | `/opt/alt/php85/usr/bin/php` is PHP 8.5.13. `/usr/bin/php` also resolves to 8.5.13. | `ok`; workflow uses the explicit PHP 8.5 path. |
| B7 | Is Composer 2 installed? | `composer2` is Composer 2.9.8; a `composer` alias also exists. | `ok`; workflow uses `composer2`. |
| B8 | What Git version is installed? | `git --version` returns 2.52.0. | `ok`; sparse checkout is supported. |
| B9 | Which PHP functions are disabled, and can Composer/Artisan run? | CLI disables `system`, `exec`, `shell_exec`, `passthru`, and `symlink` among others. `proc_open` is enabled. | `ok`; current Composer and Artisan commands can run; use shell `ln -s` rather than PHP `symlink()`. |
| B10 | Are `flock`, `mv`, `ln -s`, and `readlink -f` available? | `ln`, `readlink`, `flock`, `mv`, and `rsync` are installed; `current -> dev` and storage symlinks already exist. | `ok`; release operations match observed utilities. |

## C. GitHub deploy key

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| C11 | Can a server-side key pull a private GitHub repo, and is port 22 open? | Port 22 to GitHub works. The old `/home/u685718414/.ssh/deploy_key` authenticates as a deploy key of a different repository (`ssh -T` greets another repo), so it read `dorak` only because `dorak` is public; it would fail if the repo went private. A dedicated key `~/.ssh/dorak_deploy_key` (ED25519, mode 600) was generated on 2026-11-21 and must be registered as a read-only deploy key on `abdullah-al-habbal/dorak`. | `owner action`: register `dorak_deploy_key.pub` in GitHub (Settings, Deploy keys, read-only); the workflow uses this path. Leave `deploy_key` untouched. |
| C12 | Is GitHub SSH over port 443 a fallback? | Not tested because the configured deploy key successfully read the repository over the normal Git SSH route. | `unverified`; test only if port 22 stops working. |

## D. Folder layout and web root

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| D13 | What is the document root? | `/home/u685718414/domains/dev-dorak-backend.io/public_html`. Siblings are `DO_NOT_UPLOAD_HERE` and `shared`. | `ok`; `DO_NOT_UPLOAD_HERE` is a zero-byte marker and is never a deployment target. |
| D14 | Can the root be swapped by rename or symlink? | `.htaccess` rewrites through `current -> dev`; the release and storage symlinks exist and resolve. | `ok`; the existing workflow swaps the `dev` directory behind the stable `current` symlink. |
| D15 | Can hPanel change the root to `public_html/dev/public`? | The account's root remains `public_html`; `.htaccess` rewrites requests to `current/public`. Direct probes to app files returned 404, and `.env` returned 403. | `ok`; preserve the root rewrite. |
| D16 | Can private app/shared files live outside the root? | `.env` and storage live in `/home/u685718414/domains/dev-dorak-backend.io/shared`; application release code is currently under `public_html/dev` and served via the root rewrite. | `answered`; retain the observed layout and never upload to the marker directory. |

## E. Environment and database

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| E17 | Can `.env` live outside the web root, with what permissions? | Yes: `/home/u685718414/domains/dev-dorak-backend.io/shared/.env`, linked into the app release. Its current mode is `600`; only non-secret configuration keys were inspected. | `ok`; keep mode `600` and never print or document secret values. |
| E18 | What are the DB credentials and server version? | Live database engine is MariaDB 11.8.9. Database/user are account-specific; credentials are stored only in the protected `.env`. CI intentionally uses MySQL 8.4 and its test guard rejects MariaDB. | `answered`; review migration compatibility separately and back up before deployment. Do not put passwords in docs. |
| E19 | What DB host should SSH and website use? | `localhost` for both. Remote port 3306 is unnecessary for local connections. | `ok`; configure `DB_HOST=localhost`. |

## F. Runtime requirements

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| F20 | Are cron jobs supported, and how to run the scheduler? | `artisan schedule:list --no-ansi` succeeds and shows `recommend:recompute-vectors` daily at 02:00. `crontab` is not installed in this SSH shell, so the existing hPanel cron list remains unverified. | `change`; inspect hPanel and add the documented `schedule:run` entry only if absent. |
| F21 | Can a long-lived queue worker run? | A long-lived worker is unsuitable on shared hosting. The live queue driver is `database`, table `jobs`; `jobs` and `failed_jobs` are empty. Use a cron-run `queue:work --stop-when-empty --max-time=50`, protected by `flock`. | `change`; inspect hPanel and add the documented bounded worker entry only if absent. |
| F22 | Are outgoing API requests supported? | cURL is enabled; outgoing connections supported, including HTTPS/443. Outgoing ports are open except 0 and 25. | `ok`; test required providers from the account. |
| F23 | What are plan limits? | 1 CPU core, 2 GB RAM, 20 GB disk, 400,000 inodes, unlimited bandwidth. PHP memory, execution-time, and process limits depend on active configuration. | `answered`; inspect PHP Info and Resource Usage. |
| F24 | Is HTTPS/force redirect available? | SSL is active; Hostinger normally forces HTTPS. If needed: Manage site → SSL → ⋮ → Force HTTPS. | `ok`; verify redirect in deployment checks. |

## G. Health check and logs

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| G25 | Is the health endpoint served, and does same-host cURL work? | `https://dev-dorak-backend.io/api/v1/health` returns HTTP 200 via server-side curl. The current JSON exposes only overall/per-check status and timestamps. | `ok`; recheck after deployments. |
| G26 | Where are PHP and web-server logs? | PHP: File Manager → Home → `.logs` → `errorlogdev-dorak-backend.io`; enable PHP logging if empty. Access logs: Manage site → Analytics → Access logs, retained up to 7 days. Current web-server error log has no entries. | `ok` |

## Hosting readiness notes

- Hostinger's hPanel cron list still needs an owner-side check because this shell has no `crontab` command. Suggested scheduler and bounded queue entries are documented in [CI/CD setup](ci-cd-setup.md); add only after preserving existing jobs.
- The newer repository revision is deployed (2026-11-21, commit `19e52c81e`). The dev database was reset with `migrate:fresh --seed`; all 73 migrations ran on MariaDB 11.8.9 with none pending. The marketing seed data from the earlier targeted seeders was wiped by the reset and replaced by `DatabaseSeeder` output; re-check `/en/features` and `/en/pricing` if they matter.
- The missing marketing pages and localized route aliases are live and returned HTTP 200 on 2026-11-21.
- Three exact temporary upload files were removed from `shared/` after verifying the live patched files; `.before-*` rollback backups were retained.

## Final report

- **Verdict (2026-11-21):** the backend is deployed and healthy. SSH, Git, PHP 8.5, Composer, the dedicated deploy key, release layout and the `public_html/dev` target are verified by a green deploy (run `44915144212`).
- **Verified live:** `/api/v1/health` 200 with status-only payload; unknown routes return a bare 404; cached config has `debug => false`; 73 migrations, 0 pending; `jobs` and `failed_jobs` empty; no new Laravel log errors.
- **Re-audit 2026-11-22:** health still 200 and the live release is `ec7b19a39` (deploy run `44935178048`). Read-only SSH confirmed `scheduler.log` and `queue-worker.log` still do not exist, so the cron entries are still missing (backlog RR-8).
- **Open gaps:** hPanel cron entries are unconfirmed (no `scheduler.log` or `queue-worker.log` exists); no database backup tooling; whether the Vercel project auto-deploys on push is unverified (a `Vercel` commit status exists on `origin/master`, see [Vercel dashboard hosting](vercel-dashboard.md)).
- **Workflow:** explicit PHP 8.5 and `composer2`, strict known-host checking, `public_html/current -> dev` layout, optional `reset_database` input (see [CI/CD setup](ci-cd-setup.md)).
- **GitHub secrets:** `HOSTINGER_SERVER_IP` = `82.25.83.69`; `HOSTINGER_USERNAME` = `u685718414`; `HOSTINGER_SSH_PORT` = `65002`; `HOSTINGER_SSH_PRIVATE_KEY` = a dedicated CI private key (store only in GitHub Secrets, never here).
- **Decision:** keep deployment manual. Use `reset_database=true` only for disposable dev data after a migration rewrite.
