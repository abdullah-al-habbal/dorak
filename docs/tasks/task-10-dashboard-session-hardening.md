# Task 10: Harden Dashboard Session Claim (HttpOnly Cookie, jti, Rotation)

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Feature audit, DASHBOARD Task 1; `docs/DASHBOARD_IMPLEMENTATION_PLAN.md:19-20` ("rotation-capable dashboard session secret; set HttpOnly, Secure, SameSite, Path, and expiry cookie attributes")

## Overview & Root Cause
The backend signs the dashboard session claim, an HS256 JWT, with **one static secret**. It returns the claim in the JSON login body. The claim has no `jti` and no key identifier, so:
- the secret cannot be rotated without logging everyone out;
- an individual claim cannot be revoked before it expires.

**Correction to the audit:** the "no cookie" finding only describes the backend response. The Next.js BFF already stores the claim in `httpOnly`, `sameSite: lax`, path-scoped cookies (`secure` in production). The cookie requirement is met at the BFF layer. The real remaining gaps are secret rotation and revocability.

The secret is shared between backend and BFF (`DASHBOARD_SESSION_SECRET`), and the BFF verifies claims locally. Rotation therefore has to work on both sides.

## Evidence
- `backend/modules/Dashboard/Support/DashboardSessionClaim.php:20-21`: single `config('dashboard.dashboard.session_secret')`.
- `backend/modules/Dashboard/Support/DashboardSessionClaim.php:28-39`: payload has `actor_type`, `exp`, `iat`, `iss`, `role` and `sub`, with no `jti` and no `kid` header.
- `backend/modules/Dashboard/Http/Actions/DashboardLoginAction.php:34-35`: claim returned in the JSON body.
- `backend/modules/Dashboard/Config/dashboard.php:8`: `env('DASHBOARD_SESSION_SECRET')`.
- `frontend/dashboard/src/services/api/auth/cookies.ts:7-10`: `httpOnly: true`, `sameSite: "lax"`, `secure` only when `NODE_ENV === "production"`, path-scoped.
- `frontend/dashboard/src/services/api/auth/session.util.ts`: BFF-side `verifySessionClaim`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Support a keyed secret set, for example `DASHBOARD_SESSION_SECRETS` as a JSON or comma list of `kid:secret` pairs plus `DASHBOARD_SESSION_ACTIVE_KID`. Keep the single-secret env as a fallback with kid `default`.
- Sign with the active kid and put `kid` in the JWT header.
- Add `jti` (a random UUID) to the payload.
- Persist revoked JTIs until `exp` (cache or table). Logout revokes the current JTI, and `RefreshSessionAction` revokes the old one when it issues a new one.
- `MeAction` and the dashboard authorization middleware reject revoked JTIs with 401.

### Dashboard (BFF / React)
- `frontend/dashboard/src/services/api/auth/session.util.ts`: verify using the `kid` header against a keyed secret set (same env format), so the old and new secrets are both accepted during rotation.
- `frontend/dashboard/src/app/api/auth/logout/route.ts`: call the backend logout so the JTI is revoked, not only the cookies cleared.
- Document the rotation procedure in `frontend/dashboard/.env.example` and `backend/.env.example`.

### Mobile (Flutter / Repositories)
- None. Mobile apps use Sanctum tokens, not dashboard claims.

## Acceptance Criteria
- [ ] Issued claims contain a `kid` header and a `jti` claim (unit test on `DashboardSessionClaim`).
- [ ] With secrets `{k1, k2}` and k2 active, a claim signed with k1 is still accepted. After k1 is removed, it is rejected with 401.
- [ ] After `POST /api/v1/dashboard/logout`, reusing the same claim on `GET /api/v1/dashboard/me` returns 401.
- [ ] After a session refresh, the previous claim's JTI returns 401.
- [ ] The BFF verifier accepts both active and previous kids (vitest in `frontend/dashboard/tests/services/`).
- [ ] The cookie attributes stay `httpOnly`, `sameSite=lax`, `secure` in production and path-scoped (existing cookie test).
- [ ] `php artisan test` and dashboard `npm run test` pass; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Client-side token refresh retry: Task 73.
- BFF proxy method allow-listing: Task 11.
