---
nodeid: backend.16-deployment-operations.part-4
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-3.md) · [Next](16-deployment-operations-part-5.md)

### What would break if `main` were naively enabled

Adding `main` to the push branches and relaxing the guard, without new
infrastructure, gives every one of these:

| Variable | Value | Consequence for a `main` deploy |
|---|---|---|
| `DORAK_TARGET` | `…/dev-dorak-backend.io/public_html/dev` | production code **overwrites the dev release** |
| `DORAK_SHARED_DIR` | `…/dev-dorak-backend.io/shared` | production boots on the **dev `.env`** — dev `APP_KEY`, dev DB `u685718414_dev_dorak_db`, `APP_DEBUG=true`, `MAIL_MAILER=log` |
| `DORAK_HEALTH_URL` | `https://dev-dorak-backend.io/…` | health check passes against the **wrong site** |
| `DORAK_ENVIRONMENT` | `development` | production reports itself as development |
| storage | dev `shared/storage` | production uploads land in **dev** storage |

`APP_DEBUG=true` alone would expose stack traces and configuration on a
production host.

One thing is already safe: the migration lock is
`/tmp/laravel_migrate_$(basename "$TARGET").lock`, which yields `…_dev.lock` vs
`…_main.lock`. Distinct targets cannot block each other.

### Required design before `main` is ever enabled

```text
dev-dorak-backend.io/                <prod-domain>/
├── shared/                          ├── shared/
│   ├── .env      (dev)              │   ├── .env      (production)
│   └── storage/  (dev)              │   └── storage/  (production)
└── public_html/dev                  └── public_html/main
```

No shared state of any kind between the two — separate `.env`, separate
`APP_KEY`, separate database and credentials, separate storage, separate logs,
separate health URL.

**Use a separate workflow file, not conditional logic in this one.**
`deploy-production.yml` with its own hardcoded `DORAK_*` values and its own
guard requiring `main`. Branching a single workflow on `github.ref_name` puts
both environments' paths in one file, one editing mistake away from each other;
two files make cross-contamination structurally impossible. The remote script
can be kept identical.

Checklist to enable production:

1. Provision the production domain and database.
2. Create `<prod>/shared/.env` — `APP_ENV=production`, `APP_DEBUG=false`, a
   freshly generated `APP_KEY`, production DB credentials, real mail transport.
   Mode `600`, as the dev one already is.
3. Add `deploy-production.yml` with production `DORAK_*` values and a
   `!= "main"` guard.
4. Confirm the expand/contract migration policy is being followed — production
   is where a contract migration actually costs something.
5. Strip the development-only OTP logging (see the pre-existing issues section).
6. Resolve `APP_DEBUG` and any other dev-only settings.

**Nothing implemented for this.** The guards that matter already exist and are
verified; the rest is infrastructure that does not yet exist to configure.

---
