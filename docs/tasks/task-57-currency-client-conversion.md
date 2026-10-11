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
- Decision required: keep `POST /currency/convert` (and update the spec) or add a `GET` alias. Record the outcome in Task 87.

### Dashboard (BFF / React)
- `frontend/dashboard/src/components/overview/overview-dashboard.tsx`: replace the hard-coded `"USD"` with the brand base currency (overlaps Task 72; reference only).

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/endpoints/currency.endpoints.dart` and `frontend/mobile/packages/core/lib/src/network/repositories/currency.repository.dart`: add rates/convert if client-side conversion is needed.
- Update price DTOs to parse `display_price`. client_app price widgets (branch detail, stylist profile — `stylist_profile.bloc.dart` already injects `CurrencyRepository`) render dual or converted prices.

## Acceptance Criteria
- [ ] `GET /api/v1/exchange-rates` without auth returns 200. `POST /api/v1/admin/...` rate writes without an admin_api token return 401.
- [ ] A client with display currency ≠ base currency gets `display_price` populated in `GET /api/v1/explore/branches/{branch}` services (Feature test with a seeded rate).
- [ ] With no rate seeded, the same request returns 200 with `conversion_unavailable: true` and the base `price` intact.
- [ ] Dual mode returns both `price` and `display_price`. Converted-only mode is asserted in a test.
- [ ] Mobile DTO parsing test for `display_price` passes (`melos run test`).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Admin guard correction (Task 03). Settings API (Task 52).
- Overview currency label (Task 72).
