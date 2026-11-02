# Handover: Semantic Schema Audit and Cross-Layer Naming Sync

Audience: the next AI agent session (Claude Code, Codex or similar). Read this first, then
`AGENTS.md`, `CLAUDE.md`, `docs/INDEX.md`, `docs/refactor-roadmap/index.md` and the subsystem
guides (`backend/AGENTS.md`, `backend/CLAUDE.md`, `frontend/dashboard/AGENTS.md`,
`frontend/mobile/CLAUDE.md`). Repo rules win over anything here.

## 1. Goal

Make database naming consistent and rule-compliant across the whole monorepo (Laravel backend,
Next.js dashboard, Flutter mobile), and keep every consumer in sync **in the same commit** as
each schema change: Form Requests, Resources, Seeders, Factories, Pest tests, dashboard
mappers / Zod schemas / forms / tests, Flutter DTOs (`@JsonKey`, regenerated `*.g.dart`) and
fixtures.

### Naming rules (the contract)
1. English `snake_case`; one term per concept (client, never customer); no ambiguous abbreviations; no type suffixes; do not repeat the table name in a column.
2. Booleans: `is_*` (state), `has_*` (existence), `allows_*` (permission), `requires_*` (requirement). No `*_enabled`, no negatives.
3. Timestamps `*_at`; calendar dates `*_date`; time of day `*_time`; durations name + unit (`duration_minutes`).
4. Lifecycle `*_status` (separate tracks get separate columns); categorisation `*_type`, `*_category`, `*_mode`, `*_priority`.
5. PK `id`; FK `[relation]_id` (`approved_by_id`); provider ids `provider_payment_id`; human numbers `order_number`.
6. Counts `*_count` / `items_count`; quantities `quantity`; ordering `sort_order` / `position`.
7. Money `*_amount_minor` + `currency_code`; rates `*_percent` (0-100), `*_ratio` (0-1), `*_bps`.
8. Units in names where fixed (`weight_grams`, `distance_meters`, `file_size_bytes`).
9. Content: `name`, `title`, `description`, `body`, `slug`, `rejection_reason`.
10. URLs `*_url`; storage `*_path` / `storage_key`; JSON named by business content, never `data` / `misc` / `metadata`-style generic names.

## 2. Decisions already made with the user
- `currency_id` becomes `currency_code` (string(10), FK to `currencies.code`). API sends and accepts codes (`SAR`).
- Delivery in domain batches, one local commit each (`refactor(<scope>): ... (Batch X)`), with the Co-Authored-By trailer from the session reminder. Commit headers must be 100 characters or fewer (commitlint). Never push.
- Schema is edited **in place** in the create-migrations (pre-release precedent, no backfill, verify with `migrate:fresh --seed`). Do not add alter migrations.
- Judgement calls approved: bookings `status` to `booking_status` and `time_slot` to `starts_at`; unify the spelling to `cancelled` (`canceled_at`, enum case `Canceled`; verify the serialized value before changing it); branch hours `weekday` to `day_of_week`, `opens_at` / `closes_at` to `opens_time` / `closes_time`; unit suffixes (`_km` etc.) are derived from how the code uses the value, not guessed.
- Out of scope: framework tables (jobs, failed_jobs, personal_access_tokens, notifications, cache, sessions, `agent_conversations`), morph base columns that are already fine, and columns already compliant (`rating_count`, `expires_at`, `is_*` / `has_*`).
- Deviation to keep: payout period columns became `period_started_at` / `period_ended_at` (they are timestamps) instead of the originally planned `*_date`.

## 3. What is done
**Batch I (partial), commit `483e1465`**, story `docs/refactor-roadmap/batch-i-money-currency.md`:
- All `*_currency_id` columns are now `*_currency_code` FKs to `currencies.code` (brands, preferences, exchange_rates, subscription_plans, offered_services, commission_rules/entries, payouts), with models, Requests (`exists:currencies,code`), factories (closure returning `->code`), seeders, analytics joins and tests updated.
- `base_minor`, `commission_minor`, `total_minor`, `price_minor` are now `*_amount_minor`.
- Payouts: `approved_by_id`, `period_started_at`, `period_ended_at`.
- Dashboard: wire keys and form fields renamed to `currencyCode`, `baseCurrencyCode`, `displayCurrencyCode`; the currency lookup route (`src/app/api/lookups/[resource]/route.ts`) now returns the code as the option id.
- Mobile: DTO fields `currencyCode` / `displayCurrencyCode`, regenerated `*.g.dart`, settings dropdown value is the code, fixtures use `SAR`.
- Gates all passed at commit time (backend 1331 tests, dashboard 506, mobile melos verify).

Earlier batches A-H (enums, branch hours, weekday constants) are listed in `index.md`.

**Batch I (complete)**, commits `c096dc42` (rate_ratio, external_reference, commission value split into `value_bps` / `value_amount_minor`) and the service price commit (`offered_services.price_amount_minor`, integer minor units across backend, dashboard and mobile; explore `price_range` is minor units).

**Batch J part 1 (complete)**: `*_radius_km`, `commission_percent`, `confidence_ratio`, `weight_ratio`, `attempts_count`. **Batch J part 2 (complete)**: `rating_average`, `duration_minutes`, `allows_*` booleans, `favorited_*`. Batch J is finished; next is Batch K.

## 4. Full roadmap (remaining work)

### Batch I remainder
Done; see section 3.

### Batch J: rates, units, counts, booleans
`commission_rate` to `commission_percent` (bps-vs-percent: check the 0-100 validation); `travel_radius`, `default_radius` (add unit from code); `rating_avg` to `rating_average`; `offered_services.duration` to `duration_minutes`; `attempts` to `attempts_count`; `weight` to `weight_ratio`; `confidence_score` to `confidence_ratio`; `is_notification_enabled` to `allows_notifications`; `is_dual_price_display_enabled` to `allows_dual_price_display`; `email_enabled` / `push_enabled` / `booking_enabled` / `system_enabled` to `allows_*_notifications`; `show_unavailable` to `allows_unavailable_results`; `favorable_*` morph to `favorited_*`.

### Batch K: time and lifecycle
`bookings.status` to `booking_status`; `bookings.time_slot` to `starts_at`; `canceled_at` to `cancelled_at` (plus enum case and `SubscriptionStatus`); branch hours (`weekday`, `opens_at`, `closes_at`) and `override date` to `override_date`; `bans.banned_from` / `banned_until` to `banned_at` / `expires_at`; `testimonials.display_order` to `sort_order`; `resolved_by` to `resolved_by_id`; `replaced_by_id` to `replaced_by_token_id`; `history_id` to `client_service_history_id`; `admin_id` on activation logs / bans to `activated_by_id` / `banned_by_id`; `PayoutStatus::Canceled` spelling.

### Batch L: type, category, mode
`job_postings.type` to `employment_type`; `sections.type` to `section_type`; `service_catalog_media.type` to `media_type`; `device_tokens.platform` to `platform_type`; `payouts.direction` to `direction_type`; `languages.direction` to `text_direction`; `formality` to `formality_level`; `style_period` to `style_period_type`; `preferences.theme` to `theme_mode`; `features.scope` / `value` to `scope_type` / `feature_value`; tag `group` to `group_name`; `guard` to `guard_name`. Update the matching Backed Enums, model casts and `Rule::enum`, plus `@JsonEnum` on mobile.

### Batch M: content, files, JSON
`reviews.comment` to `body`; `testimonials.quote` to `body`; `brands.logo` to `logo_url`; `clients.avatar` to `avatar_path`; `*.path` to `image_path`; `alt` to `alt_text`; dedupe `photo_path` / `photo_url`; `payment_gateways.config` to `gateway_settings`; `chairs.ui_metadata` to `layout_settings`; generic `metadata` / `context` columns to business names (`styling_details`, `service_details`, `provider_profile`, `embedding_metadata`, `interaction_context`, `edge_context`); `filter_config` to `filter_criteria`; `sections.content` to `body`; `bookings.at_home_location` to `home_address`; `notification_deliveries.error` to `error_message`; platform settings `key` / `value` to `setting_key` / `value_integer`.

### Final batch: guardrails and sweep
- Add a Pest schema-lint test scanning migrations: no `*_minor` without `_amount_minor`, no `*_enabled`, no bare `*_by`, no `canceled`, no `currency_id`.
- Repo-wide `rg` sweep for every old name (code, docs, `backend/docs/features/*`, i18n keys), then update `docs/refactor-roadmap/index.md` and `docs/decisions-required.md` as needed.
- Run the full gate set once more.

## 5. Per-batch procedure
1. Grep the old column in `backend/modules/<Module>` (Migrations, Models `#[Fillable]` and casts, Enums, Resources, FormRequests, Commands/Queries, Handlers, Resolvers, Factories, Seeders, Filament resources, `Lang`) and in `backend/tests`.
2. Edit the migration in place, keeping indexes and FKs consistent.
3. Rename in all backend consumers. Follow `backend/CLAUDE.md`: `declare(strict_types=1)`, `final` classes, attributes, constants instead of magic strings, no relative imports, imports at top.
4. Dashboard (`frontend/dashboard`): `src/services/api/**/*.mapper.util.ts`, `*.constant.ts`, `*.query.ts`, `schemas/`, forms, `tests/services/api/**`. Mappers use lenient helpers (`record()`, `num()`, `text()`), so a missed key silently becomes `undefined` or `0`. Grep every old wire key down to zero hits and add or adjust mapper tests.
5. Mobile (`frontend/mobile`): edit `*.dto.dart`, run `dart run build_runner build --delete-conflicting-outputs` in `packages/core` (the 62 `*.g.dart` files are committed), update repositories and fixtures (`packages/core/test`, `apps/client_app/test/helpers/fakes.dart`, `apps/stylist_app/test/helpers/stylist_fakes.dart`).
6. Write or update the batch story `docs/refactor-roadmap/batch-<x>-<scope>.md` and the index row.
7. Run the gates, then `git add` only the touched files and commit locally.

## 6. Gates (run all before each commit)
```bash
cd backend && php artisan migrate:fresh --seed && vendor/bin/pint --test && composer test
cd frontend/dashboard && npm run lint && npm run test && npm run build
cd frontend/mobile && dart run melos run verify
```
The Husky pre-commit also runs eslint/prettier on staged TS files and `tsc --noEmit`; commit-msg runs commitlint (header max 100 chars).

## 7. Pitfalls learned
- Blanket `sed` for FK-to-code renames also rewrites test lines like `$brand->id`; scope replacements to the `currency_code` expression and re-run tests. Use closures in factories (`fn () => CurrencyModel::factory()->create()->code`).
- Tests and seeders that passed `$currency->id` must now pass `->code`; Requests that had `'uuid'` on currency fields must drop it.
- Do not use `git stash` for experiments here; it touches the whole working tree.
- Removing a duplicate key after a rename can leave two identical object keys in TS fixtures (`tsc` fails); check mapper tests.
- Mobile fixtures that mapped currency ids to codes through a lookup map need the code directly.
- Wire-key renames are breaking for any deployed client. The repo looks pre-release (no production data evidence found); confirm with the user if that has changed.
- Ask the user before inventing semantics (units, polymorphic columns such as `commission_rules.value`).

## 8. Suggested first steps for the next session
1. Read this file and `batch-i-money-currency.md`; run `git log --oneline -5` and confirm `483e1465` is present and the tree is clean.
2. Finish Batch I (price to minor units first), then proceed J, K, L, M, final.
3. After each batch, update this file's "What is done" section.
