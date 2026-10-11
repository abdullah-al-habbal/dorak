# Task 67: Conform Modules to Context Namespacing

**Phase:** Phase 12 — Backend Hygiene · **Priority:** P3 · **Depends on:** Tasks 01–63 (run last among backend tasks to avoid merge churn) · **Audit source:** Feature spec vs backend (BE-18 row); `backend/docs/features/BE-18-context-driven-namespacing.md`

## Overview & Root Cause
BE-18 requires every HTTP-layer file (Actions, Requests, Resources, Handlers, Resolvers) to live under `modules/{Module}/{Layer}/{Client|Barber|Business|Shared}/`, and it claims this is done "across all 17 modules". Five modules still have files directly under the layer folder. The module count has also grown, so the doc claim is stale.

## Evidence
- `backend/docs/features/BE-18-context-driven-namespacing.md` — the convention, e.g. `modules/Client/Http/Actions/Client/UpdateProfileAction.php`.
- `backend/modules/Dashboard/Http/` — 59 PHP files outside a context subdir, e.g. `Dashboard/Http/Actions/ListBookingsAction.php` and `Dashboard/Http/Actions/UpdateBookingStatusAction.php`.
- `backend/modules/ClientInteraction/Http/Resources/` — 3 files, e.g. `ClientFavoriteResource.php`.
- `backend/modules/ClientHistory/Http/Resources/ClientServiceHistoryResource.php`
- `backend/modules/ClientFaceProfile/Http/Resources/` — 2 files.
- `backend/modules/Core/Http/` — `Actions/BaseApiAction.php` and `Middleware/*.php` (4 files).

## Full-Stack Scope
### Backend (API / DB / Policies)
- Move the files into context subdirs and update namespaces, `use` statements and route files. The Dashboard module's context is `Business` (or `Shared` for login/refresh/me). Client modules use `Client`.
- Decision required: whether Core base classes and middleware are exempt from BE-18. If they are, document the exemption in BE-18.
- Add an architecture test asserting that no PHP file sits directly under `modules/*/Http/{Actions,Requests,Resources}/` (except documented exemptions).
### Dashboard (BFF / React)
- None — internal PHP namespaces only; HTTP contracts are unchanged.
### Mobile (Flutter / Repositories)
- None.

## Acceptance Criteria
- [ ] Running `find backend/modules/*/Http -maxdepth 3 -type f -name '*.php'` under the layer folders returns only documented exemptions.
- [ ] `php artisan route:list --path=api --json` gives the same method+URI set before and after the move (diff is empty).
- [ ] The architecture test exists and passes.
- [ ] BE-18 doc updated: the "17 modules" claim is corrected and exemptions are listed.
- [ ] `php artisan test` passes; PHPStan max and Pint are clean.

## Out of Scope
- Behaviour changes in any moved class.
- Other doc drift (Task 87).
