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

- [x] `offered_services.price` (decimal) becomes `price_amount_minor` (unsigned integer). API: services send and accept `price_amount_minor`; `display_price` is `{amount_minor, currency_code}` (`PriceConverter` multiplies minor units by the stored rate and rounds); explore `price_range.min` / `price_range.max` (and saved-filter `price_range`) are integer minor units. Dashboard revenue aggregates keep their major-unit decimal wire values via `Modules\Currency\Support\MinorUnits::toMajor` (replaces `Commission\Support\MinorUnits::fromDecimal`). Dashboard service form still edits major units and converts at the payload boundary; mobile adds `core` `MinorUnits` and DTO fields `priceAmountMinor` / `amountMinor`, with the discovery filter state held in minor units and the slider converting for display.
- Out of scope here: `service_catalog_items.price_range` (JSON catalog hint) is unchanged and left to Batch M.

## Verification
`php artisan migrate:fresh --seed`, `vendor/bin/pint --test`, `composer test` (1331 passed); final run after the price change: backend 1331, dashboard 508, mobile melos verify green; dashboard `npm run lint`, `npm run test` (506 passed), `npm run build`; mobile `dart run melos run verify`.
