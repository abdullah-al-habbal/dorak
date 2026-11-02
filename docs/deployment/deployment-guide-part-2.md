---
nodeid: docs.deployment.part-2
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/
  - backend/
  - frontend/dashboard/
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
