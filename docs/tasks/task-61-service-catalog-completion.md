# Task 61: Complete Service Catalog Module

**Phase:** Phase 10 — Client Intelligence · **Priority:** P2 · **Depends on:** Task 04, Task 14, Task 44 · **Audit source:** Feature-spec audit (BE-11), product-spec audit (Admin/Moderation, Discovery); `backend/docs/02_prd.md:245,249` (SC-2/SC-6), `backend/docs/04_house-rules.md:139` (CAT-2)

## Overview & Root Cause
The catalog supports item CRUD and a list filtered by category or search. Gaps:
- **Tags can't be assigned.** There's a tag model and an assignment table, but no model or API to assign tags.
- **Inactive items leak into the list.** The list returns them to clients.
- **Media is missing from the resource.**
- **Weak enum validation.** `face_shapes` and `hair_textures` accept any string even though `FaceShapeEnum` and `HairTextureEnum` exist.
- **Missing fields.** Items have no default duration (SC-2), and categories have no universe.
- **Browsing is limited.** Clients can't browse by tag, universe or face shape (SC-6), and there is no categories endpoint.
- **Inactive items can still be referenced (CAT-2).** New offered services can link to them.

## Evidence
- `backend/modules/ServiceCatalog/Http/Requests/Client/CreateCatalogItemRequest.php:33-36` — `face_shapes.*` and `hair_textures.*` are plain `string`; no tag field.
- `backend/modules/ServiceCatalog/Enums/FaceShapeEnum.php`, `backend/modules/ServiceCatalog/Enums/HairTextureEnum.php` — enums exist but are unused by validation.
- `backend/modules/ServiceCatalog/Eloquent/Resolvers/Shared/ListCatalogItemsEloquentResolver.php:18-23` — filters by category and search only; no `is_active` filter.
- `backend/modules/ServiceCatalog/Models/` — `ServiceCatalogItemTagModel` exists; no tag-assignment model.
- `backend/modules/ServiceCatalog/Database/Migrations/2026_01_01_000004_create_service_catalog_item_tag_assignments_table.php` — assignment table exists.
- `backend/modules/Dashboard/Http/Requests/ServiceRequest.php:14` — `catalog_item_id` checked with `exists` only, not `is_active`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `ServiceCatalogItemTagAssignmentModel` and a `tags()` relation. Accept `tag_ids[]` on create/update (admin-only per Task 04).
- Validate `face_shapes.*` with `Rule::enum(FaceShapeEnum::class)` and `hair_textures.*` with `Rule::enum(HairTextureEnum::class)`.
- Migration: `default_duration_minutes` on items; `universe` on categories.
- `GET /api/v1/service-catalog/items`: show active items only to non-admins. Add `tag`, `universe` and `face_shape` filters.
- Add `GET /api/v1/service-catalog/categories`.
- Include `tags` and `media` in `ServiceCatalogItemResource`.
- CAT-2: `catalog_item_id` on dashboard/barber service requests must reference an active item (422 otherwise). Existing links stay valid.

### Dashboard (BFF / React)
- Admin catalog UI (Task 77) must expose tags, default duration and the enum pickers.
- The service form catalog picker (`frontend/dashboard/src/services/api/dashboard/service-form.schema.ts`) lists active items only. The lookup goes through `frontend/dashboard/src/app/api/lookups/[resource]/route.ts`.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/service_catalog.repository.dart` and `frontend/mobile/packages/core/lib/src/network/endpoints/service_catalog.endpoints.dart`: add categories plus tag, universe and face_shape filter params, and parse `tags`/`media`.

## Acceptance Criteria
- [ ] `POST /api/v1/service-catalog/items` (admin) with `face_shapes: ["triangle-x"]` returns 422. Valid enum values return 201.
- [ ] `tag_ids` persist rows in the assignment table, and `GET` returns a `tags` array.
- [ ] A client `GET /api/v1/service-catalog/items` excludes items with `is_active=false`.
- [ ] `?face_shape=oval`, `?tag=` and `?universe=` filters return only matching items (Feature tests).
- [ ] `GET /api/v1/service-catalog/categories` returns 200.
- [ ] Creating a service with an inactive `catalog_item_id` returns 422.
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Admin-only authorization (Task 04). ID type alignment (Task 14).
- Admin catalog UI (Task 77).
