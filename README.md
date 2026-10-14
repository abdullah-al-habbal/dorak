# Dorak Operations Monorepo

Dorak Operations is a salon and barber operations platform. This repository
contains the Laravel API, the multi-actor web dashboard, and the Flutter mobile
workspace used by clients, branch teams, and stylists.

## Repository map

| Path | Project | Main technologies |
| --- | --- | --- |
| `backend/` | API, booking lifecycle, authorization, history, recommendations, and operations services | PHP 8.3+, Laravel 13, MySQL 8, Pest |
| `frontend/dashboard/` | Admin, branch manager, and barber web portals; server-side API bridge | Next.js 16, React, TypeScript |
| `frontend/mobile/` | Client, business, and stylist apps plus shared packages | Flutter, Dart, Melos |
| `docs/` | Cross-project architecture, decisions, and task specifications | Markdown |

Start with [the task tracker](docs/todowork.md), [the documentation index](docs/INDEX.md),
and the subsystem guides in each project directory.

## Architecture at a glance

- The backend is a modular Laravel monolith. Domain code lives under
  `backend/modules/`; `Modules\Core` supplies shared infrastructure. The
  backend is the authority for authentication, branch scope, booking state,
  and API contracts.
- The Next.js dashboard provides separate `/admin`, `/manager`, and `/barber`
  portals. Its server-side API bridge handles backend communication and
  dashboard sessions.
- The mobile workspace contains `client_app`, `business_app`, and
  `stylist_app`, with shared `core`, `design_system`, `localization`, and
  `feature_floor_plan` packages. Package boundaries and the Dart file taxonomy
  are described in `frontend/mobile/AGENTS.md`.

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

Run the backend suite with:

```bash
cd backend
php artisan test
```

Backend architecture, environment, and coding rules are in
[`backend/AGENTS.md`](backend/AGENTS.md) and [`backend/README.md`](backend/README.md).

### Dashboard

```bash
cd frontend/dashboard
cp .env.example .env.local
# Set BACKEND_API_URL for the local Laravel API.
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
# Backend
(cd backend && php artisan test)

# Dashboard
(cd frontend/dashboard && npm run lint && npm run typecheck && npm test && npm run build)

# Mobile
(cd frontend/mobile && dart run melos run verify)
```

Backend migration changes must also satisfy `php scripts/check_migrations.php`
from `backend/`. The backend CI workflow runs against MySQL; see
`.github/workflows/backend-ci.yml` for its setup. The production deployment
workflow is documented in [the deployment guide](docs/DEPLOYMENT_GUIDE.md).

## Contributing and agent guidance

Read [AGENTS.md](AGENTS.md) and the applicable subsystem guide before making
changes. Follow the path/import rules there, preserve API and package
boundaries, and update task and decision documentation when work changes their
status. For tasks routed through `docs/tasks/`, use the reusable
[monorepo task executor](.agents/skills/monorepo-task-executor/SKILL.md).

Keep local work local unless the user explicitly requests a remote Git action.
