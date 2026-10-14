# Task 14: Align Service Catalog ID Type with API Contracts

**Phase:** 2 — Data Integrity & Broken Pipelines · **Priority:** P0 · **Depends on:** Task 04 · **Audit source:** Product audit, Admin/Moderation (catalog linking with non-guessable IDs); feature audit BE-03/17 DocDrift; `backend/docs/02_prd.md:149` ("entities use non‑guessable identifiers")

## Overview & Root Cause
All five catalog tables use auto-increment bigint IDs (`$table->id()`), and the foreign keys to them are `foreignId`. Every consumer expects string or UUID IDs:
- **Dashboard API:** `ServiceRequest` validates `catalog_item_id` as `uuid`, so linking an offered service to a catalog item can **never** pass validation.
- **Dashboard form schema:** also requires a UUID.
- **Mobile DTOs:** parse catalog and history catalog IDs with `json['id'] as String`, so an integer from the API throws a type error at runtime (not yet reproduced against a live API).

The PRD requires non-guessable identifiers, so the fix is to migrate the catalog tables to UUIDs rather than loosen the clients.

## Evidence
- `backend/modules/ServiceCatalog/Database/Migrations/2026_01_01_000002_create_service_catalog_items_table.php:14`: `$table->id()` (also migrations `000001`, `000003`, `000004` and `000005`).
- `backend/modules/OfferedService/Database/Migrations/2026_07_18_000001_add_catalog_item_id_to_offered_services_table.php:14`: `foreignId('catalog_item_id')`.
- `backend/modules/ClientHistory/Database/Migrations/2026_07_19_000001_create_client_service_histories_table.php:20`: `foreignId('catalog_item_id')`.
- `backend/modules/Dashboard/Http/Requests/ServiceRequest.php:14`: `'catalog_item_id' => ['nullable', 'uuid', Rule::exists('service_catalog_items', 'id')]`.
- `backend/modules/ServiceCatalog/Http/Resources/Shared/ServiceCatalogItemResource.php:14`: `'id' => $this->id` (an integer today).
- `frontend/dashboard/src/services/api/dashboard/service-form.schema.ts:11`: `catalogItemId: z.string().uuid().nullable()`.
- `frontend/mobile/packages/core/lib/src/network/dto/catalog_item.dto.g.dart:11`: `id: json['id'] as String`.
- `frontend/mobile/packages/core/lib/src/network/dto/service_history.dto.g.dart:13`: `catalogItemId: json['catalog_item_id'] as String?`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Write a migration that converts the PKs of `service_catalog_categories`, `service_catalog_items`, `service_catalog_item_tags`, `service_catalog_item_tag_assignments` and `service_catalog_media` to UUID. Include a mapping for existing rows and rewrite every FK:
  - the internal catalog FKs;
  - `offered_services.catalog_item_id`;
  - `client_service_histories.catalog_item_id`;
  - `catalog_item_ids` stored inside saved-filter JSON (`ClientInteraction`).
- Add `HasUuids` to the catalog models and update the factories and seeders.
- Change `exists:` rules that assume integers (for example `ListClientServiceHistoryRequest`, and Explore `catalog_item_ids[]`) to `uuid` plus `exists`.

### Dashboard (BFF / React)
- None beyond verification: `service-form.schema.ts` already expects a UUID. Add a vitest case linking a UUID catalog item.

### Mobile (Flutter / Repositories)
- None beyond verification: the DTOs already expect strings. Add a DTO parsing test with a UUID `id`, in `frontend/mobile/packages/core/test/`.

## Acceptance Criteria
- [x] `GET /api/v1/service-catalog/items` returns string UUID `id`s for items, categories and tags.
- [x] `POST /api/v1/dashboard/services` with a valid `catalog_item_id` UUID returns 201, and `offered_services.catalog_item_id` is persisted.
- [x] After the migration, every existing `offered_services` and `client_service_histories` catalog reference points to the same logical item (migration test with seeded data).
- [x] `GET /api/v1/explore/branches?catalog_item_ids[]=<uuid>` filters correctly.
- [x] Mobile `CatalogItemDto.fromJson` parses the API payload without a TypeError (unit test).
- [x] `php artisan test`, dashboard `npm run test` and `melos run test` pass; PHPStan (max) and Pint are clean for touched files.

## Implementation Notes
- `2026_10_14_000001_convert_service_catalog_ids_to_uuid` rebuilds the five catalog tables (snapshot rows, recreate with UUID keys, reinsert) so it runs on both MySQL and the SQLite test database. It remaps the internal catalog FKs, `offered_services.catalog_item_id`, `client_service_histories.catalog_item_id`, `catalog_item_ids` in saved filters, face-analysis `recommended_catalog_item_ids`, catalog media owners, and `catalog_item` morph references in favorites, interaction logs and recommendation edges. Stale JSON ids that point to no catalog row are dropped.
- Tag assignments use the `ServiceCatalogItemTagAssignmentModel` pivot so attached rows receive UUIDs.
- `catalog_item` and `catalog_category` are registered in the enforced morph map; without them, loading catalog `media` on `GET /service-catalog/items/{id}` threw.
- The Explore catalog filters queried a non-existent `active` column on catalog items; they now use `is_active`.

## Out of Scope
- Tag assignment API, inactive filtering and enum validation: Task 61.
- Catalog authorization: Task 04.
