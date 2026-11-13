---
nodeid: docs.deployment
parentnode: docs.architecture
childnodes:
  - docs.deployment.part-2
  - docs.deployment.part-3
codeanchors:
  - .github/workflows/
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Dorak Deployment and Handover Guide

Routes: [documentation graph](../index.md) · [architecture](../architecture/architecture.md).

## Local startup

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan queue:work
php artisan serve
```

Use a configured MySQL database in development and the dedicated MySQL `dorak_test`
database for tests (SQLite is not supported). Queue workers are required for booking push notifications.

### Flutter workspace

```bash
cd frontend/mobile
flutter pub get
dart run melos run analyze
dart run melos run test
```

Run each app from its directory, for example `flutter run` in
`apps/client_app`, `apps/business_app`, or `apps/stylist_app`.

### Dashboard

```bash
cd frontend/web/dashboard
cp .env.example .env.local
npm ci
npm run build
npm run dev
```

## Continued in

- [Part 2: Firebase configuration](deployment-guide-part-2.md)
- [Part 3: Release checks](deployment-guide-part-3.md)
