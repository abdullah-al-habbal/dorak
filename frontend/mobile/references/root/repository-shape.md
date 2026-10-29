Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 2. Repository shape

Dart pub workspace + Melos. Everything lives under `frontend/mobile/`.

```
apps/
  client_app/      end-user app — feature-rich reference application
  business_app/    branch operations, jobs, floor plan, affiliations, profile, reviews
  stylist_app/     today list, cancel, schedule, portfolio, profile, affiliations, jobs
packages/
  core/            networking, storage, session, DTOs, config
  design_system/   tokens, theme, shared widgets
  localization/    ARB + generated AppLocalizations (en, ar)
docs/              specs, flows, tracks, Stitch exports
tool/              check_taxonomy.dart
```

Dependency direction is strictly bottom-up:

```
apps/*  ->  feature_*  ->  core | design_system | localization
```

- `design_system` MUST NOT depend on `core` or `localization`. Shared widgets
  take strings as constructor parameters.
- `core` MUST NOT import `design_system` or any app code.
- Packages MUST NOT import `apps/*`.

The sibling `../../backend/` is a **Laravel 13** service, out of scope for
mobile changes. Its contract is summarised in §8.

---

