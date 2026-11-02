---
nodeid: backend.16-deployment-operations.part-3
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-2.md) · [Next](16-deployment-operations-part-4.md)

## Production / `main` isolation — designed, deliberately not implemented

**Current state: `main` cannot deploy, and there is nothing for it to deploy to.**

### The production environment does not exist

Verified on the server:

```text
/home/u685718414/domains/
├── dev-dorak-backend.io/     ← this project (dev only)
│   ├── shared/               .env + storage
│   └── public_html/dev
└── internationalboard.uk/    ← unrelated project
```

There is no production domain, no `public_html/main` anywhere, and no
production database. `main` exists in git (`940d9e7`, 0 commits ahead of `dev`,
15 behind) but has no target.

So this is not "production shares dev state" — production has not been built.
Implementing a production deployment now would be infrastructure for something
that does not exist.

### What protects `main` today — two independent layers, both verified

1. **Trigger scope.** `deploy.yml` has `on: push: branches: ["dev"]`. A push to
   `main` does not start the workflow at all.
2. **Runtime branch guard.** `workflow_dispatch` accepts no `branches:` filter
   in GitHub Actions — the key is silently ignored — so the guard is the real
   control:

   ```bash
   if [ "$BRANCH_NAME" != "dev" ]; then
     echo "❌ This workflow only deploys the dev branch (got: $BRANCH_NAME)"
     exit 1
   fi
   ```

   Proven on the real path, not just locally: dispatching the workflow on a
   throwaway branch produced
   `❌ This workflow only deploys the dev branch (got: tmp/yaml-probe)`
   and exited before any server work.

`backend-ci.yml` does run on `main` (push and PR). That is correct and carries
no risk — it never touches the server.
