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
  - **Decision (resolved, best option): a client with a derived owner capability — [ADR 0001](../adr/0001-brand-owner-as-client.md).** `brands.owner_id` already points at `clients` and brand create/update already run under `auth:client`; a separate authenticatable would duplicate credentials, verification and bans for the same person.
- Add `DashboardActor::OWNER` with brand scope; extend dashboard authorization middleware and policies so an owner can manage all branches, chairs, services and bookings of brands they own and nothing else.
- Dashboard login must accept owner credentials and issue a claim with `brand_id`.
### Implemented contract
- Shared code path: `Modules\Dashboard\Support\DashboardActor::scopedBranchIds()`, `scopedBrandIds()`, `canAccessBranch()`, `canManageBrand()`, used by every dashboard operations action (bookings list/show/status/cancel/reschedule/walk-in, branches list/show/store/update/destroy, chairs, services, stylists, overview). The owner actor is built only by `Modules\Dashboard\Repositories\DashboardOwnerActorResolver` (login, request middleware, refresh rotation). Booking scope uses the new `BookingModel::forBranches(list)`.
- Scope of the rule: admin unrestricted; branch manager = its branch (and cannot change its branch's `brand_id`); brand owner = every branch whose `brand_id` is a brand it owns, recomputed per request; barber has no operations access (unchanged).
- Request: `POST /api/v1/dashboard/login` `actor_type` now also accepts `owner` (client email/password).
- Failure: wrong password, no owned brand, unverified or disabled client → 401 `invalid_credentials`; banned client → 403 `ACCOUNT_BANNED`; a mobile client token on dashboard routes → 401; another brand's branch/booking/chair/service/stylist → 404 on reads (scoped query) and 403 on writes (store/update/destroy branch, store chair/service, walk-in); refresh after the client stops owning brands → 401 and the refresh token is revoked.
- Success: login returns the usual `{claim, expires_in, token, refresh_token, refresh_expires_in}`; claim `actor_type = owner`, `role = brand_owner`, `brand_id`, `brand_ids`. `GET dashboard/me` adds `brand_id` and `brand_ids` (null/[] for other actors). Owners may create, update (only within owned brands) and delete branches; lists and overview aggregate across the brand's branches.
- Dashboard: `owner` added to `AUTH_ACTORS`, `BACKEND_ACTOR_TYPES`, `DASHBOARD_ROLES` and the new `OPERATIONS_ACTORS`; owner claim validation in `jwt.util.ts`; `AuthSession.brandIds`; `/owner/login` and the `/owner/*` portal (overview, branches incl. create/edit, bookings incl. walk-in, services, chairs, stylists, profile) built from the existing factories; navigation entries for owner come from `PORTAL_NAVIGATION`; the brand lookup returns only owned brands to owners; notification bell hidden for owners; en/ar copy. Mobile: none (no app calls dashboard routes). Docs: this spec, ADR 0001, `docs/decisions-required.md`, `backend/docs/feature-index.md`, `frontend/dashboard/docs/architecture/frontend-auth-contract.md`, `frontend/dashboard/AGENTS.md`, Task 12/49/77 notes.
- Deviations from the original spec text: the brand switcher is deferred to Task 77 (brand management UI); owners see the branches of all owned brands together and the branch form's brand select lists only owned brands. Fixed in passing: a branch manager could move its own branch into another brand via `PUT dashboard/branches/{branch}` (`brand_id`), which now returns 403 (H7).

### Dashboard (BFF / React)
- Add an `owner` portal entry in `frontend/dashboard/src/config/routes.constant.ts` (`PORTAL_NAVIGATION`) with brand switcher, branches list and per-branch views reusing existing manager components.
- `frontend/dashboard/src/app/api/auth/login/route.ts` must handle the owner actor.
### Mobile (Flutter / Repositories)
- None for this task — the business app shell (Task 84) decides whether owners also use the business app.

## Acceptance Criteria
- [x] Owner login via dashboard returns a session with `actor = owner` and the owned brand id(s).
- [x] Owner can list/create/update branches of their own brand (200/201) and gets 403 for another brand's branch (Feature tests for each verb).
- [x] Owner can read bookings across all branches of their brand; branch actors still see only their branch.
- [x] Owner portal renders branches of the brand; navigation entries visible only for `owner`.
- [x] `php artisan test` and `npm run test` pass; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Branch manager create/delete restriction and last-branch guard — Task 12.
- Brand feature flags — Task 50.
