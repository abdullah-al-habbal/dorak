---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Backend-Driven Default Page Size (`pagination.per_page`)

Status: `DEFERRED` — not implemented. Codified for future execution.

## Problem

Pagination calls in `packages/core` hardcode a default page size at the call
site (`perPage = 15` in `getPaginated` query params). The value `15` is
duplicated in the client and cannot change without an app
release. The backend already returns the authoritative page size in every
paginated envelope (`meta.pagination.per_page`), so the client should learn
it once and reuse it everywhere.

## Goal

On app start, the client fetches the small set of application-wide settings
it needs (starting with `pagination.per_page`) from a new backend
`ApplicationSetting` key-value store. Pagination then defaults to
the server-provided `per_page` instead of a hardcoded literal.

## Backend — `Modules\ApplicationSetting`

New module, following the existing module pattern (cf. `Modules\Onboarding`,
`Modules\Currency`).

### Model

`modules/ApplicationSetting/Models/ApplicationSettingModel.php`

| Column | Type | Notes |
| :--- | :--- | :--- |
| `key` | string | Unique, dotted path, e.g. `pagination.per_page`. |
| `value` | json | Typed value (string / int / bool / json). |
| `group` | string? | Optional grouping, e.g. `pagination`. |
| `is_public` | boolean | App-facing key; only public keys are served. |
| `is_active` | boolean | Soft enable/disable of a key. |

Enforce `key` uniqueness at the database level.

### Migration

`modules/ApplicationSetting/Database/Migrations/2026_MM_DD_HHMMSS_create_application_settings_table.php`

Creates `application_settings` with the columns above + timestamps.

## Continued in

- [Part 2: Seeder](per-page-part-2.md)
- [Part 3: Client — packages/core + apps/client_app](per-page-part-3.md)
