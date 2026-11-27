---
nodeid: docs.deployment.part-2
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

Part 2 of 3 · [Dorak Deployment and Handover Guide](deployment-guide.md) · [Previous](deployment-guide.md) · [Next](deployment-guide-part-3.md)

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
FCM_PROJECT_ID=
FCM_CREDENTIALS=
SANCTUM_STATEFUL_DOMAINS=dashboard.example.com
SESSION_DOMAIN=.example.com
```

The dashboard needs no CORS entry: only its Next.js server calls Laravel (see [Vercel dashboard hosting](vercel-dashboard.md)). CORS matters only for browser clients such as Flutter Web bundles; Laravel's defaults currently allow every origin on `api/*` without credentials (preflight verified 2026-11-22, a real browser request is still untested, backlog RR-12). On shared hosting, use cron to
run short queue workers (for example `queue:work --stop-when-empty --max-time=50`)
instead of a long-running worker process.

### Mobile app `.env` files

```dotenv
API_BASE_URL=https://api.example.com/api
API_BASE_URL_V1=https://api.example.com/api/v1
```

Firebase native configuration supplies the platform-specific messaging values;
do not place service-account secrets in mobile `.env` files.

### Dashboard (`frontend/web/dashboard/.env.local`)

```dotenv
BACKEND_API_URL=https://api.example.com
DASHBOARD_SESSION_SECRET=<same value as the backend DASHBOARD_SESSION_SECRET, 32+ characters>
```

Only the Next.js server calls the API, so neither value is exposed to the browser.
Use HTTPS in production: the dashboard session cookies are `HttpOnly`, `SameSite=Lax`
and `Secure` outside development.
