---
nodeid: backend.features.be-18-context-driven-namespacing
parentnode: backend.feature-index
childnodes: []
codeanchors:
  - backend/modules/
---

# BE-18 — Context-Driven Namespacing (Refactor)

## Status: ✅ Complete
## Frontend Consumer: — (code organization refactor, no API changes)

## What Was Built
- All HTTP-layer files (Actions, Handlers, Eloquent/Resolvers, CQRS, Requests, Resources) moved into `{Client|Barber|Business|Shared}/` subdirs.
- `Api/V1/` prefix dropped from file paths — versioning handled at route layer via `BaseModuleServiceProvider::prefix('api/v1')`
- `scripts/migrate_context.php` — automated migration tool (moves file, updates namespace, updates all `use` imports in `modules/`, `bootstrap/`, `config/`)
- ~150+ files reorganized with zero API behavior changes
- **Task 67 (2026-10-26):** corrected the stale "all 17 modules" claim below (the module count
  has grown well past 17 since this was first written, and conformance was never audited
  per-module — see the "Conformance" note) and closed the remaining gaps an audit found:
  `Dashboard/Http/{Actions,Requests}` (flat files split into `Business/` — bookings,
  branches/chairs/services/stylists glue, dashboard profile — and `Shared/` — login, logout,
  me, refresh, i.e. session bootstrapping common to every dashboard actor type), three
  modules' `Http/Resources/` (`ClientInteraction`, `ClientHistory`, `ClientFaceProfile`, all
  flat, all moved to `Resources/Client/`), `Barber/Http/Resources/` (`BarberResource` — reused
  by Booking, Chair, Branch, Explore and Dashboard, so `Shared/`; `BarberPortfolioPhotoResource`
  — Barber-only, so `Barber/`), and `Preference/Http/{Requests,Resources}`
  (`UpdateSettingsRequest`/`SettingsResource` — reused identically by Client, Barber, Branch
  and Dashboard actions, so `Shared/`). None of these were in the original audit evidence
  (written when the module count was lower); the architecture test below caught them. An
  architecture test
  (`tests/Feature/Architecture/HttpLayerContextNamespacingTest.php`) now enforces this going
  forward instead of relying on a point-in-time audit.

### Context Map
| Context | Modules |
|---------|---------|
| Client | Client (all), Booking (4 actions), Brand (2), Chair (1), ServiceCatalog (3), Review (1), Ban (1), ClientInteraction (all), ClientHistory (all), ClientFaceProfile (all) |
| Barber | BarberAffiliation (4), JobPosting (3), Barber (`BarberPortfolioPhotoResource`) |
| Business | Activation (2), Dashboard (bookings, branches, chairs, services, stylists, profile) |
| Shared | Explore (4), Brand (2), Chair (2), Currency (3), ServiceCatalog (2), OfferedService (1), Branch (1), JobPosting (2), Review (1), Marketing (2), Core (1), Website (3), Dashboard (login, logout, me, refresh), Barber (`BarberResource`), Preference (`UpdateSettingsRequest`, `SettingsResource`) |

This map is a snapshot, not an exhaustive live listing — the architecture test above is the
source of truth for whether a given module conforms, not this table. Update the relevant row
when adding a context subdir to a module not yet listed, but do not treat an omission from
this table as evidence of non-conformance.

### Naming Convention
```
modules/{Module}/{Layer}/{Client|Barber|Business|Shared}/{ClassName}.php
```
Example: `modules/Client/Http/Actions/Client/UpdateProfileAction.php`

### Key Decisions
- `Modules\Client` vs `Client` context: when module == context name, subdir creates `Client/Client/` — applied uniformly
- Base classes (`BaseApiAction`, `BaseApiFormRequest`) are exempt and remain at the layer
  root: they are abstract infrastructure extended by every module, carry no route of their
  own, and moving them into a context subdir would give them a context they don't have.
  Nothing else under `Http/{Actions,Requests,Resources}` is exempt.
- A module's own resource-grouping subdirectories (e.g. Dashboard's pre-existing
  `Actions/{Branches,Chairs,Profile,Services,Stylists}/`) are not a BE-18 violation merely for
  not being named after a context — the rule this doc and its architecture test enforce is
  "no file directly under the layer root", not "every subdirectory must be a context name".
  Task 67 did not restructure these; only files that were actually flat were moved.
- `scripts/migrate_context.php` does NOT scan `tests/` — manual namespace fixup required post-migration

## API Endpoints (none — refactoring only)
No API changes. All existing routes and behavior preserved.

## Response Schemas (none)
## Tests: 282 passing, 1532 assertions (full suite — zero regressions)
