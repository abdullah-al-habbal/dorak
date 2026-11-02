---
nodeid: backend.12-implementation-prd.part-3
parentnode: backend.12-implementation-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 4 · [12 — Implementation PRD: From Current State to MVP](12-implementation-prd.md) · [Previous](12-implementation-prd-part-2.md) · [Next](12-implementation-prd-part-4.md)

### API Pattern (per existing convention)

Each endpoint follows the existing **Action → Handler → EloquentResolver** pattern:

```
modules/{Name}/
  Http/
    Actions/{Name}{Action}Action.php       # Invokable, thin
    Requests/{Name}{Action}Request.php      # Validation
  Handlers/{Name}{Action}Handler.php        # Business logic
  Repositories/{Name}{Action}EloquentResolver.php  # Eloquent only
  Presenters/{Name}Resource.php             # API response shape
```

Acceptance criteria:
- [ ] Each endpoint has passing feature test (happy path + validation error + auth failure)
- [ ] `phpstan analyse` clean at level max
- [ ] Response follows existing API conventions (JSON:API-style, camelCase fields)
- [ ] No `env()` call in API files — config only
- [ ] `declare(strict_types=1)` on every file

---

## 4. Frontend — Client App Gaps

The Flutter app (`dorak_client_app`) needs screens for the new API endpoints.

| Module | Screen Needed | Depends on API |
|--------|--------------|---------------|
| **Brand** | BrandListScreen, BrandDetailScreen, BrandFormScreen | Brand API (B.3.1) |
| **Chair** | ChairListScreen (embedded in floor plan) | Chair API (B.3.1) |
| **BarberAffiliation** | AffiliationInviteScreen, AffiliationStatusScreen | BarberAffiliation API (B.3.1) |
| **JobPosting** | JobListScreen, JobDetailScreen, ApplicationFormScreen | JobPosting API (B.3.2) |

These follow the existing Clean Architecture + `BaseScreenBodyState` pattern.

Acceptance criteria:
- [ ] Each screen uses `BaseScreenBodyState` for loading/error state
- [ ] Each screen `extends BaseScreenBodyState` and uses `executeApiCall`
- [ ] Widgets extracted into typed subfolders (Cards/, Lists/, Buttons/, etc.)
- [ ] `dart analyze` clean

---
