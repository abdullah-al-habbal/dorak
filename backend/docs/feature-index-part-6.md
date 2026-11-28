---
codeanchors:
  - backend/modules/
---

Part 6 of 8 · [Feature Index — Dorak Backend](feature-index.md) · [Previous](feature-index-part-5.md) · [Next](feature-index-part-7.md)

### Password Change
- `ChangePasswordAction` [PATCH /api/v1/client/password] — validates `current_password` + new password, updates and ends every session, dashboard included (BG-60). Auth:client
- `ChangePasswordRequest` — `current_password` validated via `current_password:client` rule
- 3 contract tests

### Translation Keys Added
- `core::messages.email_verification_sent`, `core::messages.email_verified`, `core::messages.invalid_verification_code`, `core::messages.verification_code_expired`, `core::messages.verification_code_required`
- `core::messages.password_reset_sent`, `core::messages.password_reset_success`, `core::messages.invalid_reset_code`, `core::messages.reset_code_expired`, `core::messages.current_password_incorrect`, `core::messages.password_changed`
- `core::exceptions.email_already_verified`, `core::exceptions.account_deleted_with_active_bookings`
- All keys in both `en/core.php` + `ar/core.php`

### Contract Tests Updated
- `ApiResponseContractTest` — 267 passing tests (was 236), 1482 assertions (was 1212)
- New tests cover: upload avatar, delete account, send email verification, verify email, forgot password, reset password, change password
- Client module: 13 endpoints now covered (was 6)

### Application Resource Enriched
- `ApplicationResource` — added `job_posting_title` (bilingual map) via `whenLoaded('jobPosting')` so frontend can display job title in application list

---

### Context-Driven Namespacing
- All HTTP-layer files (Actions, Handlers, Resolvers, CQRS, Requests, Resources) moved into `{Client|Barber|Business|Shared}/` subdirs across all 17 modules
- `Api/V1/` prefix dropped from file paths (versioning at route layer)
- `scripts/migrate_context.php` — migration tool (note: does NOT auto-update `tests/`)
- 282 tests pass, full cleanup verified

### AI SDK & PostgreSQL Setup
- **Database**: PostgreSQL + pgvector — `DB_CONNECTION=pgsql` active, HNSW indexes supported
- **AI SDK**: `laravel/ai` v0.9.1 installed via composer; `config/ai.php` published with 15 providers (OpenAI, Anthropic, Gemini, etc.)
- **Migrations**: `agent_conversations` + `agent_conversation_messages` tables published & migrated
- **Artisan commands**: `make:agent`, `make:tool`, `make:agent-middleware` available

### ServiceCatalog Module (PRD Phase 1 — Complete)
- 5 Models: `ServiceCatalogCategoryModel`, `ServiceCatalogItemModel`, `ServiceCatalogItemTagModel`, `ServiceCatalogItemTagAssignmentModel`, `ServiceCatalogMediumModel`
- 5 Enums: `FaceShapeEnum`, `HairTextureEnum`, `MaintenanceLevelEnum`, `StylePeriodEnum`, `FormalityEnum`
- 2 ValueObjects: `PriceRangeValueObject`, `ServiceCatalogItemMetadataValueObject`
- 2 Casts: `PriceRangeCast`, `ServiceCatalogItemMetadataCast`
- CQRS: Create/Update/Delete/List/Get commands+queries, handlers, resolvers
- Admin CRUD in the dashboard: Categories, Items, Tags
- `OfferedServiceModel.catalog_item_id` FK + migration
- Registered in `bootstrap/providers.php`
- Task 14: all catalog tables keyed by UUID (`HasUuids`); API `id`/`category_id`/`catalog_item_id(s)` are UUID strings and validated with `uuid`; morph aliases `catalog_item`/`catalog_category`

### PRD Phase 2 — ClientHistory Module (Complete)
- 2 Models: `ClientServiceHistoryModel`, `ClientServiceHistoryMediaModel`
- 1 Enum: `HistoryMediaType` (before/after/reference)
- 1 ValueObject: `ServiceHistoryMetadataValueObject` (productsUsed, lengthSettings, colorCodes)
- 1 Cast: `ServiceHistoryMetadataCast`
- 3 Commands: `CreateClientServiceHistoryCommand`, `AttachHistoryMediaCommand`, `RebookFromHistoryCommand`
- 1 Query: `ListClientServiceHistoryQuery`
- 4 Resolvers + 4 Handlers following Action→Handler→EloquentResolver pattern
- 3 Client API endpoints:
  - `GET /api/v1/client/history` — paginated timeline with barber/branch/catalogItem/media relations
  - `POST /api/v1/client/history/{history}/media` — attach before/after/reference photo
  - `POST /api/v1/client/history/{history}/rebook` — rebook with same barber+service
- `BookingCompletedObserver` — auto-creates history record when BookingModel booking_status transitions to `completed`
- Registered in `bootstrap/providers.php`
