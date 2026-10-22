# Task 77: Add Brand and Service Catalog Management UI

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** Task 04, Task 14, Task 38, Task 49, Task 61 · **Audit source:** Dashboard BFF/UI audit (Brands CRUD, Service catalog CRUD — only list proxied as lookup)

## Overview & Root Cause
The dashboard uses brands and service-catalog items only as dropdown lookups through `app/api/lookups/[resource]/route.ts`. Creating and editing brands, and creating, editing and deleting catalog items, has no UI. Backend authorization is also wrong for both. Catalog mutations accept any branch or client token (Task 04). Brand create and update are `auth:client` (the owner-as-client model), so an admin token cannot manage brands at all (Task 38). Note (Task 38): the owner-as-client model is confirmed by ADR 0001; the dashboard owner portal exists, and its brand switcher was deferred to this task.

## Evidence
- `frontend/dashboard/src/app/api/lookups/[resource]/route.ts:9-13` — `LOOKUP_PATHS` covers brands, currencies and service-catalog-items, GET only.
- `backend/modules/ServiceCatalog/Routes/Api/V1/service-catalog.php:15-18` — `auth:branch_api,admin_api,client` on POST/PUT/DELETE `service-catalog/items`.
- `backend/modules/Brand/Routes/Api/V1/brands.php:14-16` — `auth:client` on `POST /brands` and `PUT /brands/{brand}`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Catalog: admin-only mutations (delivered by Task 04). UUID IDs (Task 14). Tags, universe and duration fields (Task 61).
- Brands: Decision required. Either add admin brand management under `auth:admin_api`, or let the brand owner manage brands through the dashboard once the Brand Owner role exists (Task 38). This UI follows that decision.
### Dashboard (BFF / React)
- Admin "Service catalog" pages: list with search, create, edit, deactivate/delete; tag and face-shape fields per Task 61. Query key `["dashboard","catalog-items"]`; mutations also invalidate `["lookups","service-catalog-items"]`.
- "Brands" pages (admin and/or owner per the decision): list, detail, create, edit (name, description, logo, base currency, universe from Task 49). Mutations invalidate `["lookups","brands"]`.
- Lookup route stays read-only. Management goes through new explicit BFF paths (Task 11 rules).
### Mobile (Flutter / Repositories)
- None. The client app consumes the catalog read-only.

## Acceptance Criteria
- [ ] Admin creates a catalog item: 201, it appears in the list, and it appears in the service form's catalog dropdown after `["lookups","service-catalog-items"]` is invalidated.
- [ ] A manager session cannot create, update or delete catalog items: the UI hides the actions and the backend returns 403 (feature test from Task 04 re-asserted through the BFF).
- [ ] Brand create and edit work for the role chosen in the decision, and return 403 for other roles.
- [ ] Linking a dashboard service to a catalog item succeeds end to end (ID-type mismatch fixed by Task 14).
- [ ] `php artisan test` and `npm run test` pass; eslint and tsc are clean.

## Out of Scope
- Catalog domain rules such as inactive-item referencing and tag assignment (Task 61).
