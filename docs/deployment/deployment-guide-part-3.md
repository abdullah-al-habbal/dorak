---
nodeid: docs.deployment.part-3
parentnode: docs.deployment
childnodes: []
codeanchors:
  - .github/workflows/
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

Part 3 of 3 · [Dorak Deployment and Handover Guide](deployment-guide.md) · [Previous](deployment-guide-part-2.md)

## Production environment checklist

Check these on the production host before the first public release and after every environment change. `backend/.env.example` is a development file; never copy it as is.

| Setting | Required value | Why |
|---|---|---|
| `APP_ENV` | `production` | Disables the local-only development OTP log lines. |
| `APP_DEBUG` | `false` | A debug page prints configuration, SQL and secrets. |
| `LOG_LEVEL` | `warning` or higher | `debug` logs request detail. |
| `SMS_DRIVER` | `generic_http` (never `log`) | The `log` driver sends nothing; outside production it writes the code to the log, and in production it logs only a masked number, so users never get their code. The application refuses to boot in production with `log` (`ProductionDeliveryGuard`). |
| `MAIL_MAILER` | a real transport (never `log` or `array`) | Password-reset and verification codes must reach people. The application refuses to boot in production with `log` or `array`. |
| `APP_URL` | the public `https://` API origin | Legal links, signed URLs and the website origin in the apps derive from it. |
| `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` | the dashboard domain only | Limits cookie scope. |
| `DASHBOARD_SESSION_SECRET` (or `DASHBOARD_SESSION_SECRETS` with an active kid) | a long random value, rotated on a schedule | Signs the dashboard session. |
| `APP_KEY` | set once, backed up | Gateway credentials in `payment_gateways.gateway_settings` are encrypted with it; losing it makes them unreadable. |
| Dashboard cookies | `secure` and `httpOnly` | Already set in code when `NODE_ENV=production`; serve the dashboard over HTTPS only. |
| Storage | `storage:link` done; face photos on the private `local` disk | Face photos must never be reachable from the public disk. |
| Scheduler | `schedule:run` every minute | Runs `face-profile:purge` (photos and analysis results of clients deleted over the retention period). |
| Queue | a long-lived worker | Face analysis, notifications and mail. |

## Release checks

1. Run `php artisan test` in `backend`.
2. Run mobile analysis and tests in `frontend/mobile`.
3. Run `npm ci && npm run build` in `frontend/web/dashboard`, plus `npm run lint`, `npm run typecheck` and `npm test`.
4. Apply migrations, deploy the API and queue worker, then inject Firebase files
   during signed mobile builds.
