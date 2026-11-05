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

## Release checks

1. Run `php artisan test` in `backend`.
2. Run mobile analysis and tests in `frontend/mobile`.
3. Run `npm ci && npm run build` in `frontend/web/dashboard`, plus `npm run lint`, `npm run typecheck` and `npm test`.
4. Apply migrations, deploy the API and queue worker, then inject Firebase files
   during signed mobile builds.
