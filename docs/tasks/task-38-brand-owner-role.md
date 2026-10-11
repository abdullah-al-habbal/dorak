# Task 38: Implement Brand Owner Role

**Phase:** Auth & Account · **Priority:** P1 · **Depends on:** Task 12 · **Audit source:** Product-spec audit — Auth (`backend/docs/04_house-rules.md:83`, `backend/docs/02_prd.md:136`, `backend/docs/07_user-flows.md:69-71`, `backend/docs/06_entity-model-abstract.md:81`)

## Overview & Root Cause
The specs define a Brand Owner who manages branches, chairs, services, bookings and analytics across their brand (Flow 4). In code the owner is just a `Client` referenced by `brands.owner_id`; the only owner actions are `POST/PUT brands` under `auth:client`. The dashboard knows only `admin`, `branch` and `barber` actors, and each branch is itself the login account, so there is no person-level manager and no brand-wide view.

## Evidence
- `backend/modules/Brand/Routes/Api/V1/brands.php:14-16` — owner can only create/update a brand.
- `backend/modules/Brand/Database/Migrations/0001_01_01_200010_create_brands_table.php:16` — `owner_id` → `clients`.
- `backend/modules/Dashboard/Support/DashboardActor.php:9-13` — actors `admin`, `branch`, `barber` only.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Decision required: model the owner as a new authenticatable (own guard, e.g. `owner_api`) or as a client with an owner capability that can obtain a dashboard session. Record the decision in an ADR.
- Add `DashboardActor::OWNER` with brand scope; extend dashboard authorization middleware and policies so an owner can manage all branches, chairs, services and bookings of brands they own and nothing else.
- Dashboard login must accept owner credentials and issue a claim with `brand_id`.
### Dashboard (BFF / React)
- Add an `owner` portal entry in `frontend/dashboard/new/src/config/routes.constant.ts` (`PORTAL_NAVIGATION`) with brand switcher, branches list and per-branch views reusing existing manager components.
- `frontend/dashboard/new/src/app/api/auth/login/route.ts` must handle the owner actor.
### Mobile (Flutter / Repositories)
- None for this task — the business app shell (Task 84) decides whether owners also use the business app.

## Acceptance Criteria
- [ ] Owner login via dashboard returns a session with `actor = owner` and the owned brand id(s).
- [ ] Owner can list/create/update branches of their own brand (200/201) and gets 403 for another brand's branch (Feature tests for each verb).
- [ ] Owner can read bookings across all branches of their brand; branch actors still see only their branch.
- [ ] Owner portal renders branches of the brand; navigation entries visible only for `owner`.
- [ ] `php artisan test` and `npm run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Branch manager create/delete restriction and last-branch guard — Task 12.
- Brand feature flags — Task 50.
