---
nodeid: backend.16-deployment-operations
parentnode: backend.docs
childnodes:
  - backend.16-deployment-operations.part-2
  - backend.16-deployment-operations.part-3
  - backend.16-deployment-operations.part-4
  - backend.16-deployment-operations.part-5
  - backend.16-deployment-operations.part-6
  - backend.16-deployment-operations.part-7
  - backend.16-deployment-operations.part-8
  - backend.16-deployment-operations.part-9
  - backend.16-deployment-operations.part-10
  - backend.16-deployment-operations.part-11
codeanchors:
  - backend/modules/
---

# 16 — Deployment Operations & Known Limitations

Scope: the atomic-release deployment in `.github/workflows/deploy.yml` and the
issues deliberately **not** solved by it. Written during the deployment repair
that fixed the `config:cache`-before-swap bug.

Each section below is a standing record, not a task list for that repair.

---

## Root cause this deployment repair fixed

`config:cache` ran **before** the atomic swap. Laravel serialises absolute
filesystem paths, so the cached config baked
`…/dev_release_<timestamp>/storage/…`. The next line renamed that directory to
`dev`, leaving every baked path dangling. Laravel's local driver then recreated
the release directory on first write — the "ghost release".

Confirmed on the live server, not inferred:

```text
dev/bootstrap/cache/config.php          20 distinct *_release_* paths
  logging single path   -> …/dev_release_20260820_011154/storage/logs/laravel.log
  view compiled         -> …/dev_release_20260820_011154/storage/framework/views
  public disk root      -> …/dev_release_20260820_011154/storage/app/public
  onboarding source[0]  -> …/dev_release_20260820_011154/database/seeders/assets/…jpg
                           exists? NO   (real file exists under dev/)

dev_release_20260820_011154/            NOT a git repository, 14 files:
  storage/framework/views/*.php         13 compiled Blade files
  storage/logs/laravel-2026-08-20.log   9289 bytes, actively written
dev/storage/logs/                       only .gitignore (14 bytes)
```

The ghost contains exactly the three baked paths that get *written* to. Nothing
else was ever there.

## Continued in

- [Part 2: TODO 44 — Composer security advisories (separate task)](16-deployment-operations-part-2.md)
- [Part 3: Production / main isolation — designed, deliberately not imp](16-deployment-operations-part-3.md)
- [Part 4: What would break if main were naively enabled](16-deployment-operations-part-4.md)
- [Part 5: Migration safety — the expand/contract policy (enforced)](16-deployment-operations-part-5.md)
- [Part 6: Enum and cast changes are contract operations](16-deployment-operations-part-6.md)
- [Part 7: Database rollback policy](16-deployment-operations-part-7.md)
- [Part 8: What happens when migrations have run and the deployment the](16-deployment-operations-part-8.md)
- [Part 9: Recovery procedure](16-deployment-operations-part-9.md)
- [Part 10: Compiled-view retention — investigated, no cleanup needed](16-deployment-operations-part-10.md)
- [Part 11: Evidence](16-deployment-operations-part-11.md)
