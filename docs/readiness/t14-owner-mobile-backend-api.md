---
nodeid: docs.readiness.t14
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Dashboard/
  - backend/modules/Brand/
  - backend/modules/Branch/
---

# T14. Brand owner mobile API (backend)

Status: done · Phase 5 · Depends on: none · Reuses: the pattern in `Dashboard/Routes/Api/V1/mobile.php`

Why: an owner is a client account (ADR 0001) and can already sign in with `/client/login`, but brand and branch operations require the
`X-Dashboard-Session` header, which a mobile bearer token never carries. Follow the branch and barber precedent: a bearer-token route group that
reuses the dashboard Actions, with the actor derived from the authenticated model, so mobile tokens never gain the `dashboard` ability.

- [x] T14.1 Audit: list the owner-facing dashboard Actions (brands list, show, update, logo, resubmit; branches list, create, update, switch on and off; subscription; payouts; services; stylists; earnings) and confirm each reads the actor only from `dashboard_actor` (no session-claim dependency).
- [x] T14.2 Extend `MobileDashboardActorMiddleware` with a `client` guard that resolves the actor through `DashboardOwnerActorResolver::forClient`; return 403 for a client with no brand.
- [x] T14.3 Add a `Route::prefix('owner')` group in `mobile.php` with `auth:client`, `EnsureClientAccountAccess`, the preferred-locale middleware and the actor middleware, plus the existing owner and brand authorization middleware per route.
- [x] T14.4 Expose, under `owner/*`: `GET me` (brand count, pending state), brands list, show, update, logo upload, resubmit; branches list, create, update, switch on and off; subscription and payouts (read); services and stylists (read, owner writes services per decision C); earnings.
- [x] T14.5 Keep every existing guard: `DashboardWriteGuard` (Suspended read-only), D11 limits for a pending owner (one branch of setup, no stylists, invitations or bookings), tenant scope by brand.
- [x] T14.6 Document the contract and error codes in `backend/docs`; keep the response shape identical to the dashboard Actions so the DTOs match.

Tests (Pest): 401 without a token, 403 for a client with no brand, 403 for a branch or barber token, cross-tenant 404 on another brand's branch, 422, pending-brand limits, suspended-brand read-only, a mobile token cannot call `dashboard/*`, and the dashboard session routes are unchanged.
Acceptance: an owner bearer token can manage their own brand and branches through `owner/*` and nothing else; gates pass.

## Implementation notes

- Audit (T14.1): the reused Actions read only `dashboard_actor`; `dashboard_model` and `dashboard_token` are used by `MeAction`, profile, logout and notification Actions only, none of which are exposed under `owner/*`.
- `owner/me` is outside the actor gate so a plain client can ask whether it owns a brand (T15 uses it to pick the experience). Brand creation (`POST brands`), branch delete, bookings and job board are not exposed in this phase.
- Tokens: the existing global gate already rejects a token without the surface ability with 403 `TOKEN_ABILITY_MISSING` (not 401), so the tests assert that.
- Tests: `tests/Feature/Mobile/OwnerMobileRoutesTest.php` (30 tests); Dashboard, Mobile, Architecture, Contract and route-coverage suites pass (1179 tests).
