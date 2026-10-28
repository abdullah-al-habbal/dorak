# Task 82: Build Stylist App Shell (Login, Router, Session)

**Phase:** Phase 14 — Mobile · **Priority:** P1 · **Depends on:** Task 37 (barber self sign-up; login works without it), Task 08 (ban enforcement at login), Task 09 (status enforcement at login) · **Audit source:** Mobile audit — "Barber login (stylist): Missing Mobile Flow"; structure note "stylist_app has no router or login and is a single screen built in `main.dart`"

## Overview & Root Cause
`stylist_app` cannot authenticate. Its `ApiClient` reads `SecureBarberTokenStorage`, but nothing in the app ever writes a token, and there is no login screen, router or session handling. The app is a single `StylistBloc`-driven screen built in `main.dart`, so every barber API call is unauthenticated (401), and features from Task 83 have nowhere to live.

## Evidence
- `frontend/mobile/apps/stylist_app/lib/main.dart:35` and `:63` — `tokenProvider: SecureBarberTokenStorage().read`. There is no write anywhere in `apps/stylist_app`.
- `frontend/mobile/packages/core/lib/src/storage/token.storage.dart` — `SecureBarberTokenStorage` definition.
- `frontend/mobile/apps/stylist_app/lib/src/features/operations/` — only `stylist.bloc.dart` / `stylist.state.dart`. There is no router file.
- Backend route exists: `POST api/v1/barber/login` (`Barber\Http\Actions\Barber\LoginAction`).

## Full-Stack Scope
### Backend (API / DB / Policies)
- None — `POST barber/login` exists. Ban/status rejection at login comes from Tasks 08/09; sign-up comes from Task 37.

### Dashboard (BFF / React)
- None — mobile-only app shell.

### Mobile (Flutter / Repositories)
- `packages/core`: add `BarberAuthRepository.login(email, password)`, `logout()` and `refreshToken()` (if a barber refresh route is added later; otherwise relogin on 401). Add `BarberAuthEndpoints.login = '/barber/login'`.
- `apps/stylist_app`: introduce `app.dart` + `src/core/navigation/app.router.dart` (go_router, matching `client_app` conventions) with `/login` and `/home` (the today/operations screen). Add a redirect guard based on token presence.
- Add a session bloc (reuse the `packages/core/lib/src/session` pattern) that writes the token to `SecureBarberTokenStorage` on login and clears it on logout or 401.
- Move the `ApiClient`/realtime/push construction out of `main.dart` into an app-services provider, as `client_app/lib/src/core/navigation/app_services.provider.dart` does. Register the device token only after login.
- Add a login screen using `design_system` components and localization keys. Note (Task 37): `/login`, `/home` and `/signup` routes, `StaffSessionBloc` wiring and the login screen already exist in `stylist_app`; Task 37 added the self sign-up route (`StylistSignUpScreen`/`StylistSignUpBloc`) and its onboarding-token handling in `app.dart`. Audit the remaining shell items against the code before re-implementing them.

## Acceptance Criteria
- [x] Repository test: `login` sends `POST /barber/login` and the returned token is written to `SecureBarberTokenStorage`.
- [x] Router test: with no stored token the app lands on `/login`; with a token it lands on `/home`.
- [x] Session test: a 401 from any barber call clears the token and redirects to `/login`.
- [x] Push device-token registration (`/user/device-token`) is not called before login (bloc/service test).
- [x] `apps/stylist_app/test/` contains login bloc and router tests; `melos run analyze` and `melos run test` pass.

## Out of Scope
- Barber features (schedule, portfolio, cancel and the rest) — Task 83.
- Barber self sign-up UI. Add it once Task 37 defines the endpoint.

## Implemented
- **Audit result:** the shell (`/login`, `/signup`, `/home`, redirect guard, `StaffSessionBloc`, `DioStaffAuthRepository`, `BarberAuthEndpoints.login`, app-level `ApiClient`/realtime/push wiring in `app.dart`) already shipped with Task 37 and earlier work; no production code changed.
- **Push gating:** `PushNotificationService.initialize()` (and so `/user/device-token`) is reachable only from `onAuthenticated`; `stylist_shell_flow_test.dart` asserts that callback never fires for a guest start or a rejected login. `PushNotificationService` uses static Firebase APIs, so the gate is tested at that seam rather than by faking the HTTP call.
- **Tests added** (`apps/stylist_app/test/stylist_shell_flow_test.dart`): no token → `/login`; token → `/home`; guest blocked from `/home`; login writes the token and opens `/home`; rejected login stays; 401 clears the token and the login screen shows. Repository/session coverage lives in `packages/core/test/staff_auth_repository_test.dart` and `staff_session_bloc_test.dart`.
