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
- [x] `POST /api/v1/service-catalog/items` (admin) with `face_shapes: ["triangle-x"]` returns 422. Valid enum values return 201.
- [x] `tag_ids` persist rows in the assignment table, and `GET` returns a `tags` array.
- [x] A client `GET /api/v1/service-catalog/items` excludes items with `is_active=false`.
- [x] `?face_shape=oval`, `?tag=` and `?universe=` filters return only matching items (Feature tests).
- [x] `GET /api/v1/service-catalog/categories` returns 200.
- [x] Creating a service with an inactive `catalog_item_id` returns 422.
- [x] `php artisan test` passes; Pint clean. (PHPStan is explicitly exempted as a gate in this repo per `backend/CLAUDE.md`.)

### Implemented contract
- Enum validation: `CreateCatalogItemRequest`/`UpdateCatalogItemRequest` validate `face_shapes.*` with `Rule::enum(FaceShapeEnum::class)` and `hair_textures.*` with `Rule::enum(HairTextureEnum::class)`; an invalid value returns 422 with a `face_shapes.<n>`/`hair_textures.<n>` field error.
- Tags: both requests accept `tag_ids[]` (`uuid`, `exists:service_catalog_item_tags,id`). `CreateCatalogItemHandler`/`UpdateCatalogItemHandler` call `$item->tags()->sync($command->tagIds)` through the existing `ServiceCatalogItemModel::tags()` `BelongsToMany` (pivot `service_catalog_item_tag_assignments`, already modeled by `ServiceCatalogItemTagAssignmentModel` from Task 14). `ServiceCatalogItemResource` exposes `tags` (id/name/slug/group) and `media` (id/type/path/alt/sort_order) via `whenLoaded`.
- Visibility: `ListCatalogItemsEloquentResolver` filters `is_active = true` unless `ListCatalogItemsQuery::$includeInactive` is set; `ListCatalogItemsRequest::toQuery()` sets it from `$this->user('admin_api') !== null`, so only an authenticated admin sees inactive items in the list (the item-level `GET /items/{id}` show route is unchanged/out of scope here).
- Filters: `ListCatalogItemsQuery` gained `tag` (matches `tags.slug`), `universe` (matches `category.universe`, validated against `Core\Enums\VenueUniverse`), and `faceShape` (`whereJsonContains('face_shapes', ...)`).
- New fields: migration `2026_10_26_000001_add_duration_and_universe_to_service_catalog` adds `service_catalog_items.default_duration_minutes` (nullable `unsignedSmallInteger`) and `service_catalog_categories.universe` (`string(16)`, default `unisex`, indexed, cast to `VenueUniverse`).
- Categories endpoint: `GET /api/v1/service-catalog/categories` (public, `ListCategoriesAction` → `ListCategoriesHandler` → `ListCategoriesEloquentResolver`) returns top-level categories (`whereNull('parent_id')`) with `children` eager-loaded, same active/admin visibility rule as items.
- CAT-2: `Modules\Dashboard\Http\Requests\ServiceRequest` and `Modules\OfferedService\Http\Requests\Barber\BarberServiceRequest` both constrain `catalog_item_id`'s `Rule::exists('service_catalog_items', 'id')` with `->where('is_active', true)`, so linking a new dashboard or barber service to an inactive item now returns 422 on that field. Existing links to items later deactivated are untouched (only the create/update validation path is affected).
- Dashboard: no code change. `frontend/dashboard/src/app/api/lookups/[resource]/route.ts` forwards the dashboard actor's own bearer token to the now-admin-aware `GET /service-catalog/items`; a manager/owner token never resolves through the `admin_api` guard, so the existing catalog picker already returns active-only items. (An admin actor hitting this same BFF lookup would see inactive items too, but that picker is only reachable from manager/owner service-creation screens today — not a regression, and the full admin catalog UI with explicit active/inactive handling is Task 77.)
- Mobile: `ServiceCatalogRepository.getCatalogItems` gained `categoryId`/`search`/`tag`/`universe`/`faceShape` query params; a new `getCategories()` method hits `GET /service-catalog/categories`. New generated DTOs `CatalogCategoryDto`, `CatalogTagDto`, `CatalogMediumDto` (barrel-exported); `CatalogItemDto` gained `tags`, `media`, `defaultDurationMinutes`.
- Fixed in passing: three `ServiceCatalog` factories (`ServiceCatalogItemFactory`, `ServiceCatalogCategoryFactory`, `ServiceCatalogItemTagFactory`) used an inline `\Str::slug()` FQCN, which violates the repo-wide "imports stay at the top" rule; replaced with a top-level `use Illuminate\Support\Str;` import.
- No decisions needed beyond following established repo conventions.

## Out of Scope
- Admin-only authorization (Task 04). ID type alignment (Task 14).
- Admin catalog UI (Task 77).

> Note (Task 43): explore `q` already matches catalog-item and tag names, and `tag_ids[]` filters by tag; the client app's catalog chips still use `int.tryParse` on UUID ids and never render.
