# Task 03: Correct Admin API Authentication Guards

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Backend route audit (AuthMisconfig rows)

## Overview & Root Cause
Three API routes use `auth:admin`. That guard uses the **session** driver, but these routes are mounted in the stateless `api` middleware group, so token-based admin clients cannot authenticate. The existing feature tests pass only because they call `actingAs($admin, 'admin')`, which skips real token authentication. The token guard is `admin_api` (Sanctum), and the Activation module's admin routes already use it.

## Evidence
- `backend/modules/Review/Routes/Api/V1/reviews.php:16-17`: `auth:admin` on `PATCH /admin/reviews/{review}/resolve`.
- `backend/modules/Currency/Routes/Api/V1/currencies.php:12-14`: `auth:admin` on `GET /exchange-rates` and `POST /currency/convert`.
- `backend/modules/Core/Config/auth.php`: the `admin` guard uses the `session` driver; `admin_api` uses `sanctum`.
- `backend/modules/Activation/Routes/Api/V1/activation.php:9`: the correct pattern, `auth:admin_api`.
- These tests use the session guard: `tests/Feature/Review/ReviewDisputeTest.php`, `tests/Feature/Currency/Http/Actions/ConvertCurrencyActionTest.php` and `tests/Feature/Currency/Http/Actions/ListExchangeRatesActionTest.php`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Change both route groups to `auth:admin_api`.
- Update the three tests to authenticate with a Sanctum admin token (`Sanctum::actingAs($admin, [], 'admin_api')` or a real bearer token) instead of `actingAs(..., 'admin')`.
- Add an architecture test that fails when `auth:admin` appears in any `modules/*/Routes/Api/**` file.

### Dashboard (BFF / React)
- None in this task. Admin UI for review resolution and exchange rates is Task 76; it must call these routes with the admin bearer token.

### Mobile (Flutter / Repositories)
- None. Mobile only calls the public `GET /currencies`, so its contract does not change. Client access to conversion is Task 57.

## Acceptance Criteria
- [ ] `PATCH /api/v1/admin/reviews/{id}/resolve` with an `admin_api` bearer token returns 200.
- [ ] The same request with a client, barber or branch token returns 401 or 403.
- [ ] `GET /api/v1/exchange-rates` and `POST /api/v1/currency/convert` with an `admin_api` token return 200.
- [ ] No route file under `backend/modules/*/Routes/Api/` contains `auth:admin'` (enforced by an architecture test).
- [ ] The updated tests authenticate through `admin_api`, not the session guard.
- [ ] `php artisan test` passes; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Exposing exchange rates and conversion to clients: Task 57.
- Dispute workflow changes (shop flagging, 48-hour window): Task 41.
