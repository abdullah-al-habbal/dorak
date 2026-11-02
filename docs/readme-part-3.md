---
nodeid: repo.readme.part-3
parentnode: repo.readme
childnodes: []
codeanchors:
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

Part 3 of 3 · [Dorak Operations Monorepo](../README.md) · [Previous](readme-part-2.md)

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
workflow is documented in [the deployment guide](deployment-guide.md).

## Contributing and agent guidance

Read [AGENTS.md](../AGENTS.md) and the applicable subsystem guide before making
changes. Follow the path/import rules there, preserve API and package
boundaries, and update decision documentation when work changes their
status.

Keep local work local unless the user explicitly requests a remote Git action.
