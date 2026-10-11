---
nodeid: docs.deployment
parentnode: docs.architecture
childnodes:
  - backend.docs
  - dashboard.guide
  - mobile.guide
codeanchors:
  - .github/workflows/
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

# Dorak Deployment and Handover Guide

Routes: [documentation graph](INDEX.md) · [work tracker](todowork.md) · [architecture](ARCHITECTURE.md).

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

Use a configured database in development or the PHPUnit SQLite configuration for
tests. Queue workers are required for booking push notifications.

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
cd frontend/dashboard
npm ci
npm run build
npm run dev
```

## Firebase configuration

Do not commit Firebase credentials. Inject these files from CI/CD secrets:

- Android: `frontend/mobile/apps/client_app/android/app/google-services.json`
- Android: `frontend/mobile/apps/business_app/android/app/google-services.json`
- Android: `frontend/mobile/apps/stylist_app/android/app/google-services.json`
- iOS: `frontend/mobile/apps/client_app/ios/Runner/GoogleService-Info.plist`
- iOS: `frontend/mobile/apps/business_app/ios/Runner/GoogleService-Info.plist`
- iOS: `frontend/mobile/apps/stylist_app/ios/Runner/GoogleService-Info.plist`

Run the Firebase Flutter configuration process for each target before release so
the generated options and native build files match the deployed Firebase project.

## Required environment values

### Backend (`backend/.env`)

```dotenv
APP_ENV=production
APP_KEY=
APP_URL=https://api.example.com
DB_CONNECTION=
DB_HOST=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
QUEUE_CONNECTION=database
FCM_SERVER_KEY=
SANCTUM_STATEFUL_DOMAINS=dashboard.example.com
SESSION_DOMAIN=.example.com
```

Configure CORS to permit the dashboard origin and run a long-lived queue worker.

### Mobile app `.env` files

```dotenv
API_BASE_V1_URL=https://api.example.com/api/v1
```

Firebase native configuration supplies the platform-specific messaging values;
do not place service-account secrets in mobile `.env` files.

### Dashboard (`frontend/dashboard/.env.local`)

```dotenv
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
```

Use HTTPS in production so Sanctum session cookies can be `Secure` and `SameSite`
policies can be enforced.

## Release checks

1. Run `php artisan test` in `backend`.
2. Run mobile analysis and tests in `frontend/mobile`.
3. Run `npm ci && npm run build` in `frontend/dashboard`.
4. Apply migrations, deploy the API and queue worker, then inject Firebase files
   during signed mobile builds.
