---
nodeid: docs.deployment.ci-cd-setup
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/
---

# CI/CD setup and manual checklist

Part of the [Dorak Deployment and Handover Guide](deployment-guide.md). Audit date: 2026-11-20.

## Workflows

| File | Trigger | Needs secrets | Runs in |
|---|---|---|---|
| `backend-ci.yml` | push and PR on `master`, `backend/**` | none (MySQL 8.4 service, `root/root`) | `backend/` (`defaults.run.working-directory`) |
| `dashboard-ci.yml` | push and PR on `master`, `frontend/web/dashboard/**` | none (placeholder build env) | `frontend/web/dashboard/` |
| `deploy.yml` | **manual** (`workflow_dispatch`) only | 4 `HOSTINGER_*` secrets | the Hostinger host, over SSH |

There is no CI for the Flutter apps yet. Deploy stays manual until hosting is in scope.

## GitHub state (2026-11-20)

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

## Hostinger account findings and deployment gate

The account-specific findings are tracked in [Hostinger findings and deployment
readiness](hostinger-questions.md). The verified SSH alias is
`hostinger-internationalboard` (`82.25.83.69:65002`, user `u685718414`); its
existing hPanel key is named `internationalboard-production-20251201`. Do not
reuse or alter SSH aliases and keys for other accounts/projects. Do not run the
current deployment workflow against this account: it targets a nonexistent
`public_html/dev` path, assumes symlink-based releases, and its PHP/Composer
selection does not match the host.

## What to configure on the Hostinger server

1. Confirm `git --version` (must be ≥2.25 for sparse checkout), shell utility behavior, and outbound GitHub SSH connectivity on port 22 or 443. SSH host/IP/port/user are confirmed as above.
2. Add a read-only GitHub deploy key for `abdullah-al-habbal/dorak`; generate the key on the server and add its public half in GitHub repository Deploy keys. Verify whether the workflow path `~/.ssh/deploy_key` matches the chosen setup.
3. Keep `.env` at `/home/u685718414/domains/dev-dorak-backend.io/shared/.env` with mode `600` when PHP runs as the same user. Never symlink `.env` into the web root. Confirm how the revised Laravel release loads that external file.
4. Use `/opt/alt/php85/usr/bin/php` for CLI PHP 8.5 and `composer2` for Composer. Do not rely on `php8.5` or `composer` aliases. Verify that required Composer PHP functions (including `proc_open`) are available in CLI.
5. Confirm actual PHP resource limits and MariaDB version/compatibility (`SELECT VERSION();`). CI intentionally tests only MySQL 8.4: `TestDatabaseGuard` rejects MariaDB, so production compatibility must be verified separately and CI must not be weakened to mask the difference.
6. Keep application code and shared private data outside `/home/u685718414/domains/dev-dorak-backend.io/publichtml`; the configured document root cannot be changed to an app's nested `public` directory.
7. `DONOTUPLOADHERE` is reserved and must never be a deployment target. Validate any proposed symlink behavior before choosing a release strategy. Renaming directories does not change the configured root, and symlinks are disabled by default; the existing release swap cannot be considered valid for this account.
8. Configure Laravel scheduler and queue processing through cron. A long-lived queue worker is unsuitable; use a short worker such as `queue:work --stop-when-empty --max-time=50` every minute.
9. Ensure the health response is production-safe. The repository implementation now returns only check statuses and a timestamp; the currently hosted build remains unchanged until deployed. SSL is active; verify HTTPS redirect and health response from SSH.

## Current workflow status

The workflow currently assumes a release-directory/atomic-swap deployment, uses a target outside the verified directory layout, and calls generic `php`/`composer`. It is not validated for this account. Keep it manual and do not dispatch it until deployment has been redesigned for the fixed `publichtml` document root, outside-root application/shared data, and the host's actual symlink/function constraints. The dashboard is not deployed by this workflow.

## First manual deploy

1. Resolve the blockers in the Hostinger findings tracker and revise the workflow to match the account's document root and supported deployment strategy.
2. Validate SSH, runtime, database compatibility, and production-safe health output.
3. Only then run a controlled manual deployment. Database migrations are not automatically rolled back if a deployment fails.
