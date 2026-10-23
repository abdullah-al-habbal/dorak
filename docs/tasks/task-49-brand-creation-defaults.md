# Task 49: Apply Brand Creation Defaults

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 12, Task 38 · **Audit source:** Product-spec audit (Branch/Brand), feature-spec audit (BE-06, 12_impl §5); `backend/docs/04_house-rules.md:10-11` (A1/A2), `backend/docs/12_implementation-prd.md` §5

## Overview & Root Cause
Brand creation only inserts the `brands` row. House rule A1 requires that creating a brand also creates exactly one branch, and A2 requires a brand to always have at least one branch. The API also cannot set `universe` (the column defaults to `men`), so a women's brand cannot be created even though Explore filters on universe. The brand list never loads `branches`, so `branches_count` is never returned. There is no brand `slug`.

## Evidence
- `backend/modules/Brand/Eloquent/Resolvers/Client/CreateBrandEloquentResolver.php:14` — `BrandModel::create([...])` only; no branch created.
- `backend/modules/Brand/Http/Requests/Client/CreateBrandRequest.php:12-20` — rules cover name, base_currency_id, logo, description; no `universe`.
- `backend/modules/Brand/Database/Migrations/0001_01_01_200010_create_brands_table.php:21` — `universe` defaults to `'men'`; no slug column.
- `backend/modules/Brand/Eloquent/Resolvers/Shared/ListBrandsEloquentResolver.php:15` — eager loads `owner`, `baseCurrency` only.
- `backend/modules/Brand/Http/Resources/Shared/BrandResource.php:26` — `branches_count` is `whenLoaded('branches')`, so it is always absent from the list.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Inside one DB transaction, `CreateBrandEloquentResolver` creates the brand plus its first branch. The branch's name and coordinates come from the request; its credentials or manager link follow Task 38. Note (Task 38): branches stay separate login accounts (email + password); the brand owner manages them from the dashboard `owner` portal, so the first branch still needs branch credentials or a generated placeholder.
- Add `universe` (`men|women|unisex`, after Task 44 adds `unisex`) to `CreateBrandRequest` and `UpdateBrandRequest`.
- Add a unique `slug` column, generated from `name.en` and de-duplicated with a suffix. Expose it in `BrandResource`.
- Use `withCount('branches')` in `ListBrandsEloquentResolver` and return `branches_count` from the count attribute.
- Guard against deleting the last branch (A2) is handled in Task 12; reference it, don't duplicate it.
- Decision required: which first-branch fields are mandatory at brand creation (address/coordinates now or later via Task 51).

### Dashboard (BFF / React)
- None in this task. Brand CRUD UI is Task 77, which must consume `universe`, `slug` and `branches_count`.

### Mobile (Flutter / Repositories)
- None. No mobile app creates brands today; the brand-owner flow is in Task 38.

## Acceptance Criteria
- [ ] `POST /api/v1/brands` returns 201, and exactly one `branches` row exists with the new `brand_id` (Feature test `CreateBrandCreatesFirstBranchTest`).
- [ ] If branch creation fails, no `brands` row is persisted (transaction rollback test).
- [ ] `POST /api/v1/brands` with `universe=women` persists `women`. An invalid value returns 422.
- [ ] Two brands named the same get distinct slugs. `slug` is unique at DB level.
- [ ] `GET /api/v1/brands` items include an integer `branches_count`.
- [ ] `php artisan test` passes; PHPStan max + Pint clean for touched files.

## Out of Scope
- Last-branch delete guard and manager scope (Task 12).
- `unisex` enum value (Task 44).
- Storefront fields (Task 51) and feature flags (Task 50).

> Note (Task 44): the venue universe now lives on `branches.universe`; `brands.universe` is only the default a new branch inherits — allow `unisex` there when the brand API sets it.
