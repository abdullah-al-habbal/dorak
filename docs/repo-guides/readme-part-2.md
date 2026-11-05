---
nodeid: repo.readme.part-2
parentnode: repo.readme
childnodes: []
codeanchors:
  - backend/
  - frontend/web/new-dashboard/
  - frontend/mobile/
---

Part 2 of 3 · [Dorak Operations Monorepo](../../README.md) · [Previous](../../README.md) · [Next](readme-part-3.md)

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
[`backend/AGENTS.md`](../../backend/AGENTS.md) and [`backend/README.md`](../../backend/README.md).

### Dashboard

```bash
cd frontend/web/new-dashboard
cp .env.example .env.local
# Set BACKEND_API_URL for the local Laravel API and DASHBOARD_SESSION_SECRET to the backend's value.
npm ci
npm run dev
```

The dashboard development server uses Next.js's default port. Its local checks
are `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
