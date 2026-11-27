---
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Dorak Operations Monorepo

Dorak Operations is a salon and barber operations platform. This repository
contains the Laravel API, the multi-actor web dashboard, and the Flutter mobile
workspace used by clients, branch teams, and stylists.

## Repository map

| Path | Project | Main technologies |
| --- | --- | --- |
| `backend/` | API, booking lifecycle, authorization, history, recommendations, and operations services | PHP 8.3+, Laravel 13, MySQL 8, Pest |
| `frontend/web/dashboard/` | The dashboard: admin, branch manager, barber and brand-owner portals; server-side API bridge | Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui |
| `frontend/mobile/` | Client, business, and stylist apps plus shared packages | Flutter, Dart, Melos |
| `docs/` | Cross-project architecture and decision records | Markdown |
| `scripts/` | Repository-level helpers, e.g. `verify-deploy.sh` (read-only post-deploy smoke test) and `release-dev.sh` (push, deploy the dev backend, wait for Vercel, verify) | Bash |

Start with [the documentation index](docs/index.md),
and the subsystem guides in each project directory.

## Architecture at a glance

- The backend is a modular Laravel monolith. Domain code lives under
  `backend/modules/`; `Modules\Core` supplies shared infrastructure. The
  backend is the authority for authentication, branch scope, booking state,
  and API contracts.
- The Next.js dashboard (`frontend/web/dashboard/`) provides one workspace
  per role at `/dashboard/admin`, `/dashboard/manager`, `/dashboard/barber` and
  `/dashboard/owner`. Its server-side API bridge handles backend communication and
  dashboard sessions.
- The mobile workspace contains `client_app`, `business_app`, and
  `stylist_app`, with shared `core`, `design_system`, `localization`
  and `feature_error_feedback` packages. Package boundaries and the Dart file taxonomy
  are described in `frontend/mobile/AGENTS.md`.

## Where things are recorded

| What | Where |
|---|---|
| Open tasks, bugs and decisions | [backlog](docs/backlog/index.md) |
| Order and status of the current fix programme | [wave tracker](docs/waves/index.md) |
| What is deployed on dev, URLs and configuration names | [dev environment status](docs/deployment/dev-environment-status.md) |
| Market context (not requirements) | [competitor analysis](docs/competitor-analysis/index.md), [product research](docs/product-research/index.md) |

Agent and contributor rules, including Git rules, are in [AGENTS.md](AGENTS.md).

Repository skills are listed in [`.claude/skills/`](.claude/skills/README.md);
web-only skills are in `frontend/web/dashboard/.claude/skills/`. The first
dashboard was removed from the working tree (see
[ADR 0004](docs/adr/0004-archive-legacy-dashboard.md)).

## Prerequisites

- PHP 8.3 or newer and Composer.
- MySQL 8 for local backend development and tests.
- Node.js and npm compatible with the dashboard's Next.js 16 dependencies.
- Flutter and Dart compatible with the SDK constraints in
  `frontend/mobile/pubspec.yaml`.

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
# Set the local database and service values in .env.
composer install
php artisan key:generate
php artisan migrate --seed
```

Create the configured MySQL database before migrating. Start the backend
development processes with `composer dev`, or run `php artisan serve` and
`php artisan queue:work` in separate terminals. Queue processing is needed for
queued notifications.

The tests use a disposable MySQL 8.4 database in Docker (loopback port 3307):

```bash
cd backend
composer test:db:up
composer test
```

Backend architecture, environment, and coding rules are in
[`backend/AGENTS.md`](backend/AGENTS.md) and [`backend/README.md`](backend/README.md).

### Dashboard

```bash
cd frontend/web/dashboard
cp .env.example .env.local
# Set BACKEND_API_URL for the local Laravel API and DASHBOARD_SESSION_SECRET to the backend's value.
npm ci
npm run dev
```

The dashboard development server uses Next.js's default port. Its local checks
are `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

### Mobile workspace

```bash
cd frontend/mobile
dart pub get
```

Copy the relevant app's `.env.example` to `.env`, configure its API URLs, and
run `flutter run` from that app directory. The workspace contains
`apps/client_app`, `apps/business_app`, and `apps/stylist_app`.

Run the complete mobile verification gate from the workspace root:

```bash
cd frontend/mobile
dart run melos run verify
```

## Quality checks

Run checks for the project you changed:

```bash
# Backend (start the test database first; run sequentially)
(cd backend && vendor/bin/pint --test && composer test)

# Dashboard
(cd frontend/web/dashboard && npm run lint && npm run typecheck && npm test && npm run build)

# Mobile
(cd frontend/mobile && dart run melos run verify)
```

Migration changes must also pass `php scripts/check_migrations.php` from
`backend/`. CI is in `.github/workflows/`; deployment is in
[the deployment guide](docs/deployment/deployment-guide.md).
