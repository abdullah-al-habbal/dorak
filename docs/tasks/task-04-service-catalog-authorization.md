# Task 04: Restrict Service Catalog Mutations to Admins

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Backend route audit (`PUT`/`DELETE service-catalog/items/{id}`: NoTest, NoAuthz); `backend/docs/02_prd.md` SC-1 (catalog is admin-managed)

## Overview & Root Cause
The service catalog is a platform-wide list with no owner column. The PRD says only admins manage it. Today, though:
- `ServiceCatalogItemPolicy::create()` allows any `BranchModel`;
- `update()` and `delete()` just reuse `create()`.

So any branch can create, edit or soft-delete global catalog items, and the edits and deletes have no tests at all.

## Evidence
- `backend/modules/ServiceCatalog/Policies/ServiceCatalogItemPolicy.php:14-16`: `create()` returns true for `BranchModel` or `AdminModel`.
- `backend/modules/ServiceCatalog/Policies/ServiceCatalogItemPolicy.php:19-21`: `update()` returns `$this->create($actor)`; `delete()` (line 24) follows the same pattern.
- `backend/modules/ServiceCatalog/Routes/Api/V1/service-catalog.php:15-18`: the mutation routes accept the `branch_api`, `admin_api` and `client` guards.
- `backend/modules/ServiceCatalog/Http/Actions/Client/UpdateCatalogItemAction.php` and `DeleteCatalogItemAction.php`: no feature tests exist for them.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Policy `create`, `update` and `delete` return true only for `AdminModel`.
- Change the mutation route group to `auth:admin_api` only.
- Decision required: whether branches may **propose** catalog items for admin approval. If yes, this becomes a separate endpoint and is out of scope here.
- Optional hygiene: move the three mutation actions from `Http/Actions/Client/` to `Http/Actions/Admin/` (BE-18 convention; see Task 67).

### Dashboard (BFF / React)
- None in this task. The admin catalog management UI is Task 77 and must call these routes with the admin token.
- `frontend/dashboard/new/src/app/api/lookups/[resource]/route.ts` (read-only list) is unaffected.

### Mobile (Flutter / Repositories)
- None. `frontend/mobile/packages/core/lib/src/network/repositories/service_catalog.repository.dart` only reads.

## Acceptance Criteria
- [ ] `POST`, `PUT` and `DELETE` on `/api/v1/service-catalog/items[/{id}]` with a branch or client token return 401 or 403, and the DB is unchanged.
- [ ] The same requests with an `admin_api` token return 201, 200 and 200 (or 204) respectively.
- [ ] Unit test `tests/Unit/ServiceCatalog/Policies/ServiceCatalogItemPolicyTest.php` asserts that only admins pass `create`, `update` and `delete`.
- [ ] Feature tests cover `PUT` and `DELETE` (closing two of the uncovered routes listed in Task 17).
- [ ] `php artisan test` passes; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Catalog ID type migration: Task 14.
- Tags, inactive filtering and enum validation: Task 61.
