# Task 57: Open Currency Conversion to Clients and Convert Prices

**Phase:** Phase 9 — Currency · **Priority:** P2 · **Depends on:** Task 03, Task 52 · **Audit source:** Product-spec audit (Payments/Currency), feature-spec audit (12_impl §3.2); `backend/docs/04_house-rules.md:44,47-48` (D1/D4/D5), `backend/docs/07_user-flows.md:184-194`, `backend/docs/08_edge-cases.md:81` (EC‑15)

## Overview & Root Cause
- **Clients can't reach conversion.** Exchange rates and conversion sit behind `auth:admin`, a session guard. Mobile clients can't call them, and Task 03 fixes only the guard type for admins.
- **No conversion in responses (D4/D5).** House rules require prices converted on the fly into the viewer's display currency, with optional dual display, but service and booking resources always return the base price only.
- **No fallback on a missing rate (EC‑15).** The conversion resolver returns `null` instead of falling back to the base price.
- **Spec drift.** The spec's `GET /convert` is implemented as `POST`.

## Evidence
- `backend/modules/Currency/Routes/Api/V1/currencies.php` — `exchange-rates` and `currency/convert` inside `Route::middleware('auth:admin')`. Only `GET /currencies` is public.
- `backend/modules/Currency/Eloquent/Resolvers/Shared/ConvertCurrencyEloquentResolver.php:35-36` — returns `null` when no rate.
- `backend/modules/OfferedService/Http/Resources/Shared/ServiceResource.php` and `backend/modules/Booking/Http/Resources/Client/BookingResource.php` — return base price only.
- `frontend/mobile/packages/core/lib/src/network/endpoints/currency.endpoints.dart` — only `/currencies`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Public read: `GET /api/v1/exchange-rates` and `GET /api/v1/currency/convert?from=&to=&amount=` (no auth, rate-limited). Keep rate writes admin-only (`admin_api`, Task 03).
- Add a `PriceConverter` service. The price resources (`ServiceResource`, `BookingResource`, explore detail services) add `display_price {amount, currency_code}` when the viewer's display currency (Task 52 settings, or an `X-Display-Currency` header for guests) differs from the base currency.
- D5: when the owning brand's `price_display_mode` is dual, return both `price` and `display_price`. Otherwise return converted only (per the currency flow diagram, `07_user-flows.md:191-194`).
- EC‑15: on a missing rate, fall back to the base price and add `display_price: null` plus `conversion_unavailable: true`. Never return a 500.
- **Decision (spec drift, resolved): `GET` only.** The Full-Stack Scope above already prescribes `GET /api/v1/currency/convert?from=&to=&amount=`; the `POST` route and its `Admin`-namespaced duplicate `ConvertCurrencyAction`/`ListExchangeRatesAction`/`ConvertCurrencyRequest` were removed rather than kept as an alias, since nothing else referenced them. Follow-up: none; Task 87 should simply record that the spec's `GET` form is now the live contract.
- **Decision (new, resolved): dual-display flag.** D5's "owning brand's `price_display_mode`" cannot reuse `preferences.price_display_mode` (that enum is `tax_inclusive`/`tax_exclusive`, a tax concern). Added `preferences.dual_price_display` (boolean, default `false`) instead, resolved per `(preferenceable_type, preferenceable_id)` for the service's owner (brand or barber, D1) via the existing polymorphic `Preference` lookup. Follow-up: expose a toggle for it once brand/barber settings management ships (Task 52/77) — no Filament/dashboard/mobile UI was added here, out of this task's scope.

### Dashboard (BFF / React)
- `frontend/dashboard/src/components/overview/overview-dashboard.tsx`: replace the hard-coded `"USD"` with the brand base currency (overlaps Task 72; reference only).

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/endpoints/currency.endpoints.dart` and `frontend/mobile/packages/core/lib/src/network/repositories/currency.repository.dart`: add rates/convert if client-side conversion is needed.
- Update price DTOs to parse `display_price`. client_app price widgets (branch detail, stylist profile — `stylist_profile.bloc.dart` already injects `CurrencyRepository`) render dual or converted prices.

## Acceptance Criteria
- [x] `GET /api/v1/exchange-rates` without auth returns 200. There is no API write route for rates at all (writes stay Filament-only, admin-panel-gated) — so there is nothing at `/api/v1/admin/...` for rate writes to 401 against; this is unchanged from before the task and confirmed by `ListExchangeRatesActionTest` + the `ApiResponseContractTest` Currency API block.
- [x] A client with display currency ≠ base currency gets `display_price` populated in `GET /api/v1/explore/branches/{branch}` services (`tests/Feature/Currency/ServicePriceConversionTest.php`, seeded rate).
- [x] With no rate seeded, the same request returns 200 with `conversion_unavailable: true` and the base `price` intact (same test file).
- [x] Dual mode returns both `price` and `display_price`; converted-only mode (the default) is asserted via the `dual_price_display` flag in a dedicated test.
- [x] Mobile DTO parsing test for `display_price` passes (`packages/core/test/display_price_dto_test.dart`, plus a stylist-profile widget test for converted/dual rendering) — `melos run test` green.
- [x] `php artisan test` passes; Pint clean. (PHPStan is explicitly exempted as a gate in this repo per `backend/CLAUDE.md`.)

### Implemented contract
- Shared code path: `Modules\Currency\Services\PriceConverter::displayPriceFor()`, used by `OfferedService\Http\Resources\Shared\ServiceResource` (and therefore every consumer that nests it: `MenuServiceResource`, `BookingResource`, explore branch/barber detail, floor plan, dashboard/barber service listings).
- Scope of the rule: only applies when the viewer resolves to a display currency (authenticated `client` guard user with a `display_currency_id` preference, or a guest `X-Display-Currency` header) that differs from the service's own `currency_id` (D2). Admin/branch/barber/dashboard requests never resolve a `client` guard user and rarely send the header, so their `ServiceResource` payloads are unchanged (no new keys).
- Request: optional `X-Display-Currency` header (ISO code) for unauthenticated/guest viewers.
- Failure: never a 500 — a bad/unknown display currency or a missing exchange rate both resolve to `conversion_unavailable: true, display_price: null`, base `price` untouched (EC-15).
- Success: `price` unchanged; when conversion applies, adds `display_price: {amount, currency_code}` (or `null` when unavailable), `conversion_unavailable: bool`, `dual_price_display: bool` (from the owning brand/barber's `preferences.dual_price_display`, default `false`).
- Dashboard: no change (overview's hard-coded `"USD"` is Task 72's scope; left as-is per spec note). Mobile: `packages/core` DTOs (`display_price.dto.dart`, `barber_service.dto.dart`, `booking_service.dto.dart`) parse the new fields; `apps/client_app` stylist profile (`stylist_service_price.widget.dart`) renders converted-only or dual price per `dual_price_display`. Docs: this file, `docs/decisions-required.md`.
- Deviations from the original spec text: the spec said "the owning brand's `price_display_mode`"; implemented as a new `dual_price_display` boolean instead (see Decision above) since the existing field of that name is unrelated (tax display).

## Out of Scope
- Admin guard correction (Task 03, already done — routes use `auth:admin_api`). Settings API (Task 52).
- Overview currency label (Task 72).
- A Filament/dashboard/mobile toggle for the new `dual_price_display` flag (set only via direct data access today; follow-up tracked in the decision record above).
