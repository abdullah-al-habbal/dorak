# Task 84: Build Business App Shell (Login, Router, Session)

**Phase:** Phase 14 — Mobile · **Priority:** P1 · **Depends on:** Task 09 (status enforcement at login), Task 12 (branch manager scope) · **Audit source:** Mobile audit — "Branch login (business): Missing Mobile Flow"; structure note "business_app … one screen: home is `BranchOperationsScreen`"

## Overview & Root Cause
`business_app` cannot authenticate. It reads `SecureBranchTokenStorage`, but no code writes it, and there is no login screen or router. The `MaterialApp` `home` is hard-wired to `BranchOperationsScreen`, so the already-built `ManualBarberScreen` is unreachable, and later features (Task 85) have no navigation structure.

## Evidence
- `frontend/mobile/apps/business_app/lib/app.dart:33` — `_tokenStorage = widget.tokenStorage ?? SecureBranchTokenStorage();` is read-only, with no write anywhere in `apps/business_app`.
- `frontend/mobile/apps/business_app/lib/app.dart:80` — `home: BranchOperationsScreen(bloc: _operations)`.
- `frontend/mobile/apps/business_app/lib/src/features/barbers/manual_barber.screen.dart:13` — `ManualBarberScreen` is never referenced outside its own file and tests.
- Backend route exists: `POST api/v1/branch/login`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None — `POST branch/login` exists. Status/ban rejection comes from Tasks 08/09.

### Dashboard (BFF / React)
- None — mobile-only app shell.

### Mobile (Flutter / Repositories)
- `packages/core`: add `BranchAuthRepository.login(email, password)` / `logout()` and `BranchAuthEndpoints.login = '/branch/login'`.
- `apps/business_app`: add `src/core/navigation/app.router.dart` (go_router, following `client_app` conventions) with `/login`, `/operations` (existing `BranchOperationsScreen`) and `/barbers/new` (existing `ManualBarberScreen`). Replace `home:` with `MaterialApp.router`, and add a redirect guard on token presence.
- Session bloc: write to `SecureBranchTokenStorage` on login, clear it on logout or 401. Register the push device token only after login.
- Add a navigation entry from operations to "Add barber" so `ManualBarberScreen` becomes reachable.

## Acceptance Criteria
- [x] Repository test: `login` sends `POST /branch/login` and writes the token to `SecureBranchTokenStorage`.
- [x] Router test: with no token the app lands on `/login`; with a token it lands on `/operations`.
- [x] Widget test: from operations, tapping "Add barber" renders `ManualBarberScreen`.
- [x] Session test: a 401 clears the token and redirects to `/login`.
- [x] Existing `apps/business_app/test/manual_barber_screen_test.dart` still passes; `melos run analyze` and `melos run test` pass.

### Implemented contract
- Audit finding: the shell described under Evidence already existed in code by the time this task ran (`BusinessAppRouter` with `/login`, `/operations`, `/barbers/new` and a session redirect guard; `BusinessLoginScreen`; `StaffSessionBloc` over `SecureBranchTokenStorage`; push registration only in `_onAuthenticated`; the operations app bar has an "Add barber" action). The Evidence line numbers were stale.
- Gap closed: no test covered the shell. Added `apps/business_app/test/business_shell_flow_test.dart` (no token -> `/login`, token -> `/operations`, guest blocked from `/barbers/new`, "Add barber" opens `ManualBarberScreen`, 401 clears the token and returns to `/login`).
- Login request and token write are covered by the existing `packages/core/test/staff_auth_repository_test.dart` (`POST /branch/login`) and `staff_session_bloc_test.dart` (token written to the injected `TokenStorage`, cleared on logout/401).
- Backend, dashboard and production mobile code: unchanged.

## Out of Scope
- Branch feature screens (job postings, floor plan, chair toggle, affiliations, profile, reviews) — Task 85.
