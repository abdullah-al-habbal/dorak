# Batch I: Money and currency naming

Status: [x] Done (money and currency slice); remaining Batch I items are listed under Deferred.

## Tasks
- [x] `currency_id` FK columns become `currency_code` (string(10), FK to `currencies.code`): `base_currency_code`, `display_currency_code`, `from_currency_code`, `to_currency_code`. Models use `belongsTo(CurrencyModel::class, <col>, 'code')`; Requests validate `exists:currencies,code`; the API sends and accepts codes such as `SAR`.
- [x] `base_minor`, `commission_minor`, `total_minor`, `price_minor` become `base_amount_minor`, `commission_amount_minor`, `total_amount_minor`, `price_amount_minor`.
- [x] Payouts: `approved_by` becomes `approved_by_id`; `period_start` / `period_end` (timestamps) become `period_started_at` / `period_ended_at`.
- [x] Dashboard: wire keys, form fields (`currencyCode`), schemas and mapper tests; currency lookup options now use the code as their id.
- [x] Mobile: `currencyCode` / `displayCurrencyCode` DTO fields, regenerated `*.g.dart`, settings dropdown values, fixtures.
- [x] Schema edited in place (pre-release precedent, `migrate:fresh --seed`).

## Deferred (same batch, not yet done)
- `offered_services.price` (decimal) to `price_amount_minor` (integer) and `CommissionRecorder` input.
- `exchange_rates.rate` to `rate_ratio`.
- `commission_rules.value` is polymorphic (basis points or flat minor units); split or rename needs a design decision.
- `payouts.reference` to `external_reference`.

## Verification
`php artisan migrate:fresh --seed`, `vendor/bin/pint --test`, `composer test` (1331 passed); dashboard `npm run lint`, `npm run test` (506 passed), `npm run build`; mobile `dart run melos run verify`.
