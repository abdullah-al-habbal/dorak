---
nodeid: docs.deployment.hostinger-questions
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/deploy.yml
---

# Hostinger findings and deployment readiness

Part of the [CI/CD setup and checklist](ci-cd-setup.md). Findings supplied from
Hostinger account information and the site overview on 2026-11-20, with
repository verification on the same date. The SSH probe could not start because
the local system SSH config has invalid ownership/permissions, so host details
remain owner-reported rather than session-tested.

Never store private keys, `.env` content, or passwords in this document.

## Site overview

- The home, Features, and Pricing pages load and HTTPS is active.
- The site report says `/en/features` and `/en/pricing` return 404. Both routes
  are registered by the backend in
  `backend/modules/Website/Routes/Web/website_routes.php`; the live host could
  not be probed from this session, so the reported 404 points to deployment,
  document-root, or live content state rather than missing route definitions.
- No reliable visitor counts, dated publish history, or current speed score are
  available. The pages were reachable when checked; this is not a traffic or
  performance baseline.
- The site report says the hosted health endpoint returns HTTP 200 and exposes
  environment/runtime details. The repository handler was confirmed to include
  these details; it now emits only per-check status values and a timestamp. The
  hosted response remains unchanged until this revision is deployed.
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
| B6 | Which CLI PHP versions are available, and can `php8.5` be selected? | PHP 8.2–8.5 are offered. CLI 8.5 is `/opt/alt/php85/usr/bin/php`; CLI uses the plan-wide default, not the domain web setting. No `php8.5` alias is guaranteed. | `change`; invoke the explicit binary or prepend its directory to `PATH`. |
| B7 | Is Composer 2 installed? | Yes, as `composer2`; run `composer2 install`. Alternative: use project-local `composer.phar` with PHP. | `change`; do not assume the `composer` alias. |
| B8 | What Git version is installed? | hPanel does not expose it. The deploy needs Git ≥2.25 for sparse checkout. | `open`; run `git --version` over SSH before depending on sparse checkout. |
| B9 | Which PHP functions are disabled, and can Composer/Artisan run? | `exec`, `shellexec`, `system`, `passthru`, `symlink`, and related functions are disabled by default; `proc_open` is disabled on newly created accounts. Settings are under PHP Configuration → PHP Options → disableFunctions. Composer and Artisan can run over SSH after required functions are enabled. | `answered`; determine actual CLI requirements and enable only necessary functions. |
| B10 | Are `flock`, `mv`, `ln -s`, and `readlink -f` available? | These are standard utilities, but account-specific behavior is not confirmed. | `open`; test `command -v flock mv ln readlink` and `readlink -f .`; test symlinks in a temporary directory. |

## C. GitHub deploy key

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| C11 | Can a server-side key pull a private GitHub repo, and is port 22 open? | Generate with `ssh-keygen -t ed25519 -f ~/.ssh/githubdeploy`; add the `.pub` key as a read-only repository Deploy key and configure SSH. Hostinger does not guarantee outbound port 22. | `answered`; test from this account before choosing the clone route. |
| C12 | Is GitHub SSH over port 443 a fallback? | Test `ssh -T -p 443 git@ssh.github.com`; Hostinger does not guarantee outbound SSH over 443. If it works, configure `Host github.com`, `HostName ssh.github.com`, `User git`, `Port 443`, `IdentityFile ~/.ssh/githubdeploy`. | `open`; test connectivity from this account. |

## D. Folder layout and web root

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| D13 | What is the document root? | `/home/u685718414/domains/dev-dorak-backend.io/publichtml`. The reported sibling directories are `DONOTUPLOADHERE`, `publichtml`, and `shared`. | `change`; configure around this fixed root and never deploy into `DONOTUPLOADHERE`. |
| D14 | Can the root be swapped by rename or symlink? | Rename does not change the configured root. Symlinks are disabled by default; after enabling support, `ln -s` may work. | `change`; do not assume atomic symlink swapping; validate and design a supported release strategy. |
| D15 | Can hPanel change the root to `publichtml/dev/public`? | No, Web Hosting does not support that document-root change. | `change`; keep app code outside the root and public-facing files in `publichtml`. |
| D16 | Can private app/shared files live outside the root? | Yes, e.g. `/home/u685718414/domains/dev-dorak-backend.io/shared`. Outside-root content is not directly web-accessible unless exposed by app code or symlink. | `ok`; keep `.env`, private storage, and deploy state outside `publichtml`. |

## E. Environment and database

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| E17 | Can `.env` live outside the web root, with what permissions? | Yes: `/home/u685718414/domains/dev-dorak-backend.io/shared/.env`. Do not symlink it into `publichtml`; `600` is suitable if PHP runs as this hosting user. Laravel must load it from the app directory. | `change`; revise deployment layout and verify Laravel loads the external environment file safely. |
| E18 | What are the DB credentials and server version? | Database `u685718414devdorakdb`, user `u685718414devdorakuser`; change password in Databases Management → ⋮ → Change password. Hosting uses MariaDB, not exact MySQL 8.x. Check actual version in phpMyAdmin with `SELECT VERSION();`. | `change`; validate MariaDB compatibility. Do not put the password in docs. |
| E19 | What DB host should SSH and website use? | `localhost` for both. Remote port 3306 is unnecessary for local connections. | `ok`; configure `DB_HOST=localhost`. |

## F. Runtime requirements

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| F20 | Are cron jobs supported, and how to run the scheduler? | Premium supports cron jobs. CLI PHP is `/opt/alt/php85/usr/bin/php`; run `schedule:run` every minute using the actual application path. | `ok`; install after confirming deployed Artisan path. |
| F21 | Can a long-lived queue worker run? | Not suitable on shared hosting. Use a cron-run worker each minute: `/opt/alt/php85/usr/bin/php /path/to/artisan queue:work --stop-when-empty --max-time=50`. | `change`; configure short-lived cron worker and validate job duration/overlap. |
| F22 | Are outgoing API requests supported? | cURL is enabled; outgoing connections supported, including HTTPS/443. Outgoing ports are open except 0 and 25. | `ok`; test required providers from the account. |
| F23 | What are plan limits? | 1 CPU core, 2 GB RAM, 20 GB disk, 400,000 inodes, unlimited bandwidth. PHP memory, execution-time, and process limits depend on active configuration. | `answered`; inspect PHP Info and Resource Usage. |
| F24 | Is HTTPS/force redirect available? | SSL is active; Hostinger normally forces HTTPS. If needed: Manage site → SSL → ⋮ → Force HTTPS. | `ok`; verify redirect in deployment checks. |

## G. Health check and logs

| ID | Question | Answer and analysis | Status / next action |
|---|---|---|---|
| G25 | Is the health endpoint served, and does same-host cURL work? | `https://dev-dorak-backend.io/api/v1/health` currently returns HTTP 200. No blanket same-domain server-side cURL block is documented. Test over SSH with `curl -iS --connect-timeout 10 https://dev-dorak-backend.io/api/v1/health`; inspect Analytics → Access logs. Response currently exposes development mode/internal runtime details. | `change`; verify from SSH and remove debug details before production. |
| G26 | Where are PHP and web-server logs? | PHP: File Manager → Home → `.logs` → `errorlogdev-dorak-backend.io`; enable PHP logging if empty. Access logs: Manage site → Analytics → Access logs, retained up to 7 days. Current web-server error log has no entries. | `ok` |

## Hosting readiness notes

- Confirm the installed Git version, shell utility behavior, outbound GitHub SSH route, and actual PHP resource settings from SSH/hPanel.
- The current deploy assumptions need review: document-root target, release swap/symlink support, `.env` handling, explicit PHP 8.5, Composer command, and MariaDB compatibility.
- Correct `/en/features` and `/en/pricing` or hide the links; this is a live site issue, separate from deployment readiness.
- Do not enable production traffic while the health response exposes development/debug details.

## Final report

- **Verdict:** Hosting is capable of serving the app, but deployment is not ready until the deployment workflow is reconciled with the fixed `publichtml` root and non-guaranteed symlink/SSH behaviors.
- **Blocking gaps:** Git ≥2.25; shell tool behavior; GitHub SSH egress on 22 or 443; actual PHP resource settings; validated Laravel/MariaDB compatibility; safe deployment strategy without assuming symlink swaps.
- **Workflow changes needed:** Use explicit PHP 8.5 path and `composer2`; update paths/layout for `publichtml` and private `shared`; use cron-run queue workers; review `.env` loading and database driver compatibility; verify health output is production-safe.
- **GitHub secrets:** `HOSTINGER_SERVER_IP` = `82.25.83.69`; `HOSTINGER_USERNAME` = `u685718414`; `HOSTINGER_SSH_PORT` = `65002`; `HOSTINGER_SSH_PRIVATE_KEY` = a dedicated CI private key (store only in GitHub Secrets, never here).
- **Decision:** Prepare a deployment workflow revision after the remaining SSH and runtime checks; do not treat the existing atomic release workflow as validated.
