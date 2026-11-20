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

Recommended: create an environment named `development`, then add the secrets there and add `environment: development` to the deploy job. This is a follow-up; the job does not use an environment yet.

| Secret | Value source |
|---|---|
| `HOSTINGER_SERVER_IP` | hPanel, Websites, the dev-dorak-backend.io site, SSH access |
| `HOSTINGER_USERNAME` | same page (the workflow paths expect user `u685718414`) |
| `HOSTINGER_SSH_PORT` | same page (Hostinger shared hosting usually uses 65002) |
| `HOSTINGER_SSH_PRIVATE_KEY` | a dedicated CI key pair; add its public half in hPanel, SSH access |

Use a key pair made only for this repo. Do not reuse a personal key, and do not reuse the key of another Hostinger account.

## What to configure on the Hostinger server

1. A read-only **deploy key for `abdullah-al-habbal/dorak`**: generate a key pair on the server, save the private half at `~/.ssh/deploy_key` (the workflow uses that path), and add the public half in GitHub, Settings, Deploy keys, read-only. A deploy key belongs to one repository, so the one for the old `dorak-backend` repo cannot be reused.
2. `…/dev-dorak-backend.io/shared/.env`, mode 600, with the values from the [production checklist](deployment-guide-part-3.md#production-environment-checklist).
3. Shared storage under `…/shared/storage` (the script creates the subfolders).
4. PHP 8.5 CLI (`php8.5` or `php`), Composer, and git 2.25 or newer (the deploy uses a sparse checkout of `backend/`).
5. `https://dev-dorak-backend.io/api/v1/health` reachable over HTTPS once the first release is live.
6. A GitHub host key entry: the script passes `StrictHostKeyChecking=no`, so no known_hosts step is required.

## Monorepo layout and the deploy script

The server clones `git@github.com:abdullah-al-habbal/dorak.git` into a temporary `_src` directory with `git sparse-checkout set backend`, verifies the commit and that `backend/artisan` exists, then moves `backend/` to the release directory. All later steps (composer, migrate, atomic swap, health check, rollback) are unchanged. The dashboard is not deployed by this workflow.

## First manual deploy

1. Complete the GitHub and server lists above.
2. Actions, Deploy Dorak Backend, Run workflow on `master`.
3. If it fails before the swap, the script removes the incomplete release. Read the log; migrations that ran are not rolled back (see the failure banner in the script).
