# Batch I: Money and currency naming

Status: [x] Done (money and currency slice); remaining Batch I items are listed under Deferred.

## Tasks
- [x] `currency_id` FK columns become `currency_code` (string(10), FK to `currencies.code`): `base_currency_code`, `display_currency_code`, `from_currency_code`, `to_currency_code`. Models use `belongsTo(CurrencyModel::class, <col>, 'code')`; Requests validate `exists:currencies,code`; the API sends and accepts codes such as `SAR`.
- [x] `base_minor`, `commission_minor`, `total_minor`, `price_minor` become `base_amount_minor`, `commission_amount_minor`, `total_amount_minor`, `price_amount_minor`.
- [x] Payouts: `approved_by` becomes `approved_by_id`; `period_start` / `period_end` (timestamps) become `period_started_at` / `period_ended_at`.
- [x] Dashboard: wire keys, form fields (`currencyCode`), schemas and mapper tests; currency lookup options now use the code as their id.
- [x] Mobile: `currencyCode` / `displayCurrencyCode` DTO fields, regenerated `*.g.dart`, settings dropdown values, fixtures.
- [x] Schema edited in place (pre-release precedent, `migrate:fresh --seed`).

- [x] `exchange_rates.rate` to `rate_ratio` (wire key `rate_ratio`; the currency-convert response keeps its computed `rate`).
- [x] `payouts.reference` to `external_reference` (request, resource, dashboard `externalReference`).
- [x] `commission_rules.value` split (decision: split columns) into `value_bps` (percent rules) and `value_amount_minor` (flat rules). Requests require exactly the column matching `type` and prohibit the other; `rule_snapshot` stores both keys; the dashboard form still takes one input and sends the matching key.

## Deferred (same batch, not yet done)
- `offered_services.price` (decimal) to `price_amount_minor` (integer) and `CommissionRecorder` input.

## Verification
`php artisan migrate:fresh --seed`, `vendor/bin/pint --test`, `composer test` (1331 passed); dashboard `npm run lint`, `npm run test` (506 passed), `npm run build`; mobile `dart run melos run verify`.
