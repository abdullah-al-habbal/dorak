# Task 32: Add Client Profile Read Endpoint and Session Restore

**Phase:** Auth & Account · **Priority:** P1 · **Depends on:** Task 09 · **Audit source:** Mobile audit (profile restore after restart); product-spec audit — Auth (`backend/docs/04_house-rules.md:86`)

## Overview & Root Cause
The client API has no read endpoint for the authenticated client's own profile — only `PATCH client/profile`. On a cold start the mobile session bloc can only refresh the token (the backend returns `{token}`), so `client` stays `null` and the profile screens show an empty name and phone until the user edits something. Every client surface that needs "who am I" after restart is affected.

## Evidence
- `backend/modules/Client/Routes/Api/V1/client.php:32` — only `Route::patch('/profile', …)`; no GET profile or `me` route.
- `frontend/mobile/packages/core/lib/src/session/session.bloc.dart:61` — `_onRestore` calls `refreshToken()` and sets `authenticated` with the client cleared (`clearClient: true`).
- `frontend/mobile/packages/core/lib/src/network/endpoints/profile.endpoints.dart:4` — only `update = '/client/profile'`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `GET /api/v1/client/profile` (`auth:client`) returning the same client payload shape as login (see Task 33 for the field set).
- New action/query/handler/resolver under `backend/modules/Client/` following the module's CQRS layout; reuse the client resource used by login.
### Dashboard (BFF / React)
- None — the dashboard does not authenticate clients.
### Mobile (Flutter / Repositories)
- Add `ProfileEndpoints.show` in `packages/core/lib/src/network/endpoints/profile.endpoints.dart` and `getProfile()` in `packages/core/lib/src/network/repositories/profile.repository.dart`.
- In `packages/core/lib/src/session/session.bloc.dart` `_onRestore`, call `getProfile()` after a successful token refresh and store the returned `ClientDto` in state.

### Implemented contract
- Shared code path: `ClientModel::authPayload()`, used by `LoginHandler`, `RegisterHandler`, `SocialLoginHandler` and the new `GetProfileAction` (`GetProfileQuery` → `GetProfileHandler` → `GetProfileEloquentResolver`).
- Scope of the rule: `GET /api/v1/client/profile` behind `auth:client` + `EnsureClientAccountAccess` (active, verified accounts).
- Request: none.
- Failure: 401 without a token or with a barber/branch token; 403 `ACCOUNT_NOT_ACTIVE` for non-active accounts.
- Success: HTTP 200, `data` = `id`, `name`, `email`, `phone`, `email_verified` (identical to login's `data.client`).
- Dashboard: none (does not authenticate clients; typecheck/lint/Vitest/build re-run green). Mobile: `core` (`ProfileEndpoints.show`, `ProfileRepository.getProfile`, `SessionBloc` takes a `ProfileRepository` and loads the client after refresh; 401/403 → guest, offline/other errors → authenticated without client), `client_app` (`DorakApp` wires `DioProfileRepository`, optional `profileRepository` injection). `business_app`/`stylist_app` use `StaffSessionBloc` and need no change. Docs: decisions-required, backend + mobile feature-index, `docs/core/session.md`.
- Deviations from the original spec text: the payload also carries `email_verified` (login's shape, which the spec says to match). Known follow-up: the session client is not refreshed after a profile edit (the PATCH payload lacks `email_verified`); belongs with Task 33.

## Acceptance Criteria
- [x] `GET /api/v1/client/profile` with a valid client token returns 200 with `data.id`, `data.name`, `data.email`, `data.phone`.
- [x] Same request without a token returns 401; with a barber or branch token returns 401.
- [x] Feature test `tests/Feature/Client/GetProfileTest.php` (or equivalent) covers 200 and 401 cases.
- [x] After a cold start with a stored token, `SessionState.client` is non-null; a bloc test asserts `_onRestore` emits a state with the client populated.
- [x] `php artisan test` and `melos run test` pass; Pint clean for touched backend files (PHPStan intentionally skipped per the user's instruction for this task).

## Out of Scope
- Extra payload fields (`preferred_universe`, `avatar`, `email_verified_at`) — Task 33.
- Account status enforcement — Task 09.
