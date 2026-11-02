# Final Batch: Schema Guardrails and Repo-Wide Sweep

Status: Done

## Scope

- `backend/tests/Unit/Core/SchemaNamingConventionTest.php` scans every module
  migration and `database/migrations` and fails when a column breaks the contract:
  - minor units must be `*_amount_minor` (no bare `*_minor`);
  - booleans start with `is_`, `has_`, `allows_` or `requires_`; no `*_enabled`;
  - `cancelled` spelling only (no `canceled`);
  - `currency_code` only (no `*currency_id`);
  - foreign keys (`foreignUuid`, `foreignId`, `foreign`) end in `_id` or `_code`;
  - no bare `*_by` actor columns (use `*_by_id`).
- Repo-wide `rg` sweep for every old column and wire name from Batches I to M
  across code, tests, docs and translation keys.

## Sweep results

- Code: `meta.canceled_booking_ids` became `meta.cancelled_booking_ids`
  (`ChairStatusChangeResult::$cancelledBookingIds`, chair/branch/dashboard actions,
  tests); no client consumed the old key.
- Mobile l10n: `bookingStatusCanceled` became `bookingStatusCancelled`, English text
  "Cancelled"; generated localization files updated.
- Dashboard: `canceledLabel` prop became `cancelledLabel`.
- Docs: `backend/docs/feature-index.md`, `06_entity-model-abstract.md`,
  `11_backend-architecture.md`, `backend/docs/features/*`, `docs/REMEDIATION_PLAN.md`,
  `docs/decisions-required.md`, `docs/mvp-gap-analysis-and-monorepo-roadmap.md`,
  `backend/process/KANBAN.md` and the mobile docs now use the current names.

## Intentionally unchanged

- Dashboard camelCase view-model names such as `priceMinor`, `totalMinor`, `baseMinor`
  (internal TypeScript names; the wire keys are `*_amount_minor`).
- The `photo_url` wire key on history media (a computed signed URL; the column is
  `image_path`).
- `backend/phpstan-baseline.neon` (PHPStan is not a required gate; stale entries are
  harmless) and the historical Before/After snippets in
  `backend/.claude/skills/laravel-native-abstractions/examples/dorak-refactors.md`.
- `commission_rules.scope` / `type` and `payment_gateways` status-style columns, which
  were never in the roadmap scope.

## Gates

Backend `migrate:fresh --seed`, `pint --test`, `composer test` (1339 passed); dashboard
`lint`, `test` (510 passed), `build`; mobile `melos run verify`. All passed.
