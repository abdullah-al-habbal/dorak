# 03 F-05 dashboard session lifecycle (trace, not executed)

> Decided 2026-11-14: **D-01** the claim header is mandatory for every Dashboard token and `sub` and `actor_type` are bound to the authenticated actor;
> **D-02** refresh keeps the previous access token. Before S1, **T-01** must verify the matrix below by running it and resolve the evidence conflicts listed in
> [10](10-prerequisites-t01-t04.md). The "Today" column is trace-based.

Separate technical and security requirement; it does not reopen decision A. The documented contract
(`docs/planning/existing-frontend-audit-part-2.md:20`) is "the `X-Dashboard-Session` claim header, when sent, must validate",
so the optional header is intentional; what remains is a defense-in-depth gap.

## 1. Lifecycle
| Step | Mechanism | Evidence |
|---|---|---|
| Login | `DashboardLoginHandler`: admin `isActive` and password; branch password only; barber not banned and Enabled; owner not banned then `forClient` | handler |
| Issue | `DashboardSessionIssuer::issue` returns `claim`, `token`, refresh token | issuer |
| Access token | Sanctum `dashboard-session`, ability `dashboard`, expiry setting `DashboardSessionTtlSeconds` (default 28800 s = 8 h, range 900 to 604800) | `SettingsConstants.php:54-58` |
| Claim | HS256 JWT-like (`DashboardSessionClaim::issue`): `sub`, `actor_type`, `role`, `branch_id`, `brand_ids`, `iss`, `iat`, `exp`, `jti`; key from `dashboard.session_secrets` and `active_kid`. Generated independently, **not bound to the Sanctum token** | `DashboardSessionClaim.php` |
| Refresh token | 64 random chars, sha256 stored in `DashboardRefreshTokenModel`, single use, default 2592000 s = 30 d (range 3600 to 7776000); validator requires refresh TTL at least session TTL | `DashboardRefreshTokenResolver` |
| Transport | Next.js BFF keeps token, claim, refresh in HttpOnly cookies, refuses to forward without a valid claim cookie, sends `Authorization` and `X-Dashboard-Session` on every call; browser never calls the backend | `proxy/forward.ts`, `auth/backend-client.ts`, `auth/server-session.ts` |
| Validation | `DashboardAuthorizationMiddleware`: if the header is a string and `isValid` fails, 401; **no header means no check**; then guards `admin_api`, `branch_api`, `barber`, `client`, ability `dashboard` | middleware |
| `isValid` | 3 parts, alg, issuer, `kid`, `jti`, `exp`, HMAC, not revoked. Does **not** compare `sub` or `actor_type` with the authenticated model | `DashboardSessionClaim::isValid` |
| Revocation store | `cache()` key `dashboard:revoked-jti:{jti}` (default `CACHE_STORE=database`; a cache flush un-revokes claims) | `DashboardSessionClaim.php:91-97` |
| Logout | deletes current access token, revokes claim (from the request body `claim`), revokes the given or all refresh tokens | `LogoutAction`; test `DashboardAuthApiTest.php:244-278` |
| Refresh | revokes the previous claim, rotates the refresh token, issues new claim, token and refresh. **The previous access token is not deleted** | `RefreshSessionAction`; test `:173-205` |
| Password change or reset | `DashboardCredentialRevoker` revokes other tokens and refresh tokens | `DashboardPasswordChangeSessionTest` |
| Admin deactivation | deletes access tokens; refresh refused | test `:207` |
| Ban (client or barber) | `BanObserver` deletes Sanctum tokens; dashboard refresh tokens untouched | `BanEnforcementTest` covers mobile refresh only |

## 2. Header and session state versus response
> Trace-based. **Section 5 (T-01, executed 2026-11-14) supersedes this table** with measured statuses; the rows marked "trace" here were all
> confirmed by that run, and the run found one decisive result the trace missed (old token plus the new claim: 200).

| Request | Today | Verified by |
|---|---|---|
| Live token plus valid claim | 200 | `DashboardAuthApiTest.php:93-96` |
| Live token, no header | 200 (continues to role checks) | `:55-59`, `:118-125`, `:140-146` (bearer only, `/me` 200); `:170` only shows a role 403 |
| Live token, empty header | 401 | trace |
| Live token, malformed, expired, bad signature, unknown `kid` | 401 | `:100-103` (retired kid), rest by trace |
| Live token, revoked claim | 401 | trace |
| Old token after refresh, old claim sent | 401 | trace only; `:198-200` sends the old claim **without a bearer**, so it does not prove claim revocation (T-01) |
| Old token after refresh, no header | 200 until token expiry | trace, not tested |
| Valid claim of actor B plus token of actor A | 200 (no binding) | trace, not tested |
| Valid claim, no bearer | 401 | `:271-273` |
| Logout then token reuse | 401 | `:267-269` |

## 3. Findings
- **F-05a** A dashboard-ability token works without the header, so claim revocation and key retirement cannot kill a live
  token whose holder omits the header. Window: access TTL (default 8 h, up to 7 d). Precondition: attacker already holds a
  valid access token (HttpOnly server-side cookie). Low to Medium. Confirmed.
- **F-05b** Refresh leaves the previous access token alive (`RefreshSessionAction`). Low; amplified by F-05a. Accepted for now (D-02); the previous claim is revoked on refresh.
- **F-05c** Claim not bound to actor server-side. Low (actor always comes from the token); the BFF cross-checks the claim against `/me`.
- **F-05d** Test gaps: old token after refresh without header, mismatched claim, empty header, revoked claim with live token.
- **F-05e** Revocation store depends on cache persistence (database default is persistent; a cache flush or an array
  driver loses revocations). Note only; unverified for production config.

## 4. Compatibility facts for a mandatory header
- BFF always sends it (login result is stored with the claim; `forward.ts`, `server-session.ts`, `password/change`, `logout`).
- No mobile app calls `/api/v1/dashboard` (searched `frontend/mobile`).
- `tests/TestCase.php:75` helper sends the header automatically; `OwnerApiTest.php:72` and `DashboardPasswordChangeSessionTest.php:42,58`
  also send it.
- Tests that send a bearer **without** the header and would need updating: `DashboardLoginApiTest.php:40`,
  `DashboardProfileApiTest.php:33,49,58,74,80`, and `DashboardAuthApiTest.php:55,118,140,170,194`.

## 5. T-01 verification (audit, executed 2026-11-14; no application code changed)

### 5.1 Method and limits
- Source trace of login, claim, issuer, middleware, refresh, logout and route registration, then a **throwaway Pest probe** run once with
  `php artisan test` against `dorak_test` (MySQL 127.0.0.1:3307, `CACHE_STORE=array` from `phpunit.xml:51`). The probe file lived in the session
  scratchpad, outside the repository; nothing was added to `backend/tests`. `git status` was clean before and after the run.
  `.env`, `.env.testing`, the development database and all application code were not touched.
- The first run was **discarded**: Laravel's `withHeaders()` accumulates headers on the test instance, so earlier bearers and claims leaked into later
  calls (for example "token B, no header" returned 401 because a revoked claim leaked from the previous call). The probe was fixed (`flushHeaders()`
  before every call) and rerun; only the second run is reported. Every request used `GET /api/v1/dashboard/me` unless stated, with a real
  `POST /dashboard/login`, `/refresh` and `/logout`. The guards were reset between calls.
- Limits: one actor type (admin) for the session scenarios, a barber for the cross-type claim; the claim code path is identical for all four actor
  types. Production cache driver unknown (`.env.example` says `database`); a cache flush un-revokes claims there, not tested.

### 5.2 Authentication flow (verified)
| Step | Evidence |
|---|---|
| Login creates the Sanctum token **and** the claim as two independent artifacts | `DashboardSessionIssuer::issue` (`Support/DashboardSessionIssuer.php:20-28`): `claim->issue($actor)`, then `handler->createToken($actor)` |
| Token: ability `dashboard`, expiry = session TTL | `DashboardLoginHandler::createToken` (`Handlers/DashboardLoginHandler.php:37-46`) |
| Claim payload has `sub`, `actor_type`, `role`, `jti`, `exp`; **no token id, no session or refresh-generation id** | `DashboardSessionClaim::issue` (`Support/DashboardSessionClaim.php:16-39`) |
| Middleware step 1: only `is_string($header) && ! isValid()` returns 401; **an absent header skips the check** | `DashboardAuthorizationMiddleware.php:34-37` |
| Middleware step 2: guards `admin_api`, `branch_api`, `barber`, `client`, ability `dashboard`, builds the actor **from the token's model only**; `sub` and `actor_type` of the claim are never read | `DashboardAuthorizationMiddleware.php:39-67`; `isValid` (`DashboardSessionClaim.php:132-161`) checks shape, issuer, `kid`, `exp`, HMAC, revocation only |
| Refresh (unauthenticated route, throttle 10/min): revokes the **body** claim, rotates the refresh token, issues a new claim and a **new** token; the previous access token row is not deleted (D-02) | `RefreshSessionAction.php:22-46`; `dashboard.php:33` |
| Logout: revokes the **body** claim (not the validated header claim), deletes only the current access token, revokes the given or all refresh tokens | `LogoutAction.php:22-42` |
| Revocation: `cache()` key `dashboard:revoked-jti:{jti}` with TTL to claim expiry | `DashboardSessionClaim.php:89-98` |

### 5.3 Routes covered by the middleware (T-01 item 1)
`DashboardAuthorizationMiddleware` is attached per group, always **first**, before the role middleware: `dashboard.php:45` (`/me`, `/logout`, profile,
notifications), `dashboard-admin.php:104`, `dashboard-owner.php:28,32,37,42`, `dashboard-operations.php:67`. Public routes (`/login`, `/refresh`,
password forgot or reset, owner register, code resend, verify and brand) are outside it by design.
`Dashboard/Routes/Api/V1/mobile.php` is **not** behind it (`auth:branch_api` or `auth:barber` plus `MobileDashboardActorMiddleware`, tokens keep
`branch-app` or `barber-app`). `EnforceTokenScope` (`bootstrap/app.php:25-26`, `Core/Http/Middleware/EnforceTokenScope.php:51-54`) already returns 403
`TOKEN_ABILITY_MISSING` for any token without ability `dashboard` on `api/v1/dashboard/*`, and mobile tokens never carry `dashboard`. So a mandatory
claim touches the dashboard groups only.

### 5.4 Measured results (second, clean run; "expected" is the behaviour required by D-01 and the F-05 goal)
| # | Scenario | Token | Claim sent | Expected | **Actual** | Verdict |
|---|---|---|---|---|---|---|
| S1 | **Critical:** old access token A after refresh, with the **new** valid claim B of the same actor | A (not deleted) | B | 401 | **200** | **gap** |
| S2 | Old token A with the revoked claim A | A | A (revoked on refresh) | 401 | 401 | ok |
| S1b | Old token A, no header | A | none | 401 under D-01 | **200** | gap until D-01 ships |
| S1c | New token B with claim B (baseline) | B | B | 200 | 200 | ok |
| S1d | New token B with revoked claim A | B | A | 401 | 401 | ok |
| S1e | New token B, no header | B | none | 401 under D-01 | **200** | gap until D-01 ships |
| S1f | No bearer, valid claim B | none | B | 401 | 401 | ok |
| S3 | Token of admin 1 with a valid claim of admin 2 (`sub` differs) | B | admin 2 claim | 401 | **200** | **gap** |
| S4a | Admin token with a barber's claim (`sub` and `actor_type` differ) | B | barber claim | 401 | **200** | **gap** |
| S4b | Admin token with a claim of the same `sub`, `actor_type=barber` | B | forged-type claim | 401 | **200** | **gap** |
| S4c | Admin token with a validly signed claim whose `role` differs (`brand_owner`) | B | role-mismatch claim | 401 | **200** | gap (`role` is never read) |
| S4d | Admin 1 token on `/dashboard/profile` with admin 2's claim | B | admin 2 claim | 401 | **200** | **gap** |
| S5a | Missing header | B | none | 401 under D-01 | **200** | gap until D-01 ships |
| S5b | Empty header | B | `""` | 401 | 401 | ok |
| S5c | Malformed (`abc`) | B | `abc` | 401 | 401 | ok |
| S5d | Bad signature | B | tampered | 401 | 401 | ok |
| S5e | Unknown `kid` | B | signed, `kid=nope` | 401 | 401 | ok |
| S5f | Expired, validly signed | B | `exp` in the past | 401 | 401 | ok |
| S5g | Wrong issuer, validly signed | B | `iss=other` | 401 | 401 | ok |
| S5h | Another valid unrevoked claim of the **same** actor (other session) | B | second claim | 401 with token binding | **200** | gap (no token binding) |
| L1 | After logout: token B with claim B | B (deleted) | B (revoked) | 401 | 401 | ok |
| L2 | After logout: token B, no header | B (deleted) | none | 401 | 401 | ok |
| L3 | After logout: **old token A** (never deleted) with another actor's valid claim | A | admin 2 claim | 401 | **200** | **gap** |
| L4 | After logout: old token A, no header | A | none | 401 | **200** | gap (D-02 residual, amplified by the missing header rule) |

Source-trace verdicts that the run confirmed: header-less tokens pass (S1b, S1e, S5a), empty and invalid claims are rejected (S5b to S5g), refresh
revokes the previous claim (S2, S1d), logout deletes only the current token (L3, L4), and a claim cannot authenticate by itself (S1f).
Row S4c, S5h and L3 are new facts the trace did not show.

### 5.5 What the Claim is bound to
| Binding | Bound? | Evidence |
|---|---|---|
| Authenticated actor (`sub`, `actor_type`) | **No** (as audited 2026-11-14; fixed by S1, section 6) | S3, S4a, S4b, S4d |
| The specific access token or session | **No** (as audited 2026-11-14; fixed by S1, section 6) | claim has no token id; S1, S5h, L3 |
| The current refresh generation | **No** (as audited 2026-11-14; fixed by S1, section 6) | S1: claim B (generation 2) accepted with token A (generation 1) |
| Current revocation state | **Yes, per `jti` only**, in cache | S2, S1d, L1; not durable across a cache flush on a persistent store |
| Anything about the token's own state (expiry, deletion) | Delegated to Sanctum | L1, L2 |

Consequence: the claim does not authenticate and does not narrow the token. Any valid claim minted by this backend (the attacker's **own**
account claim included) satisfies the header for any stolen token, so the claim adds nothing against token theft (S3, L3). Approved D-01 closes S3
and S4 and the header-less rows, but **not S1, S5h and L3 (same actor, other claim)**.

### 5.6 Conflict found in the approved design (needs the owner, does not reopen D-01 or D-02)
- `04` section E (D-02 residual) and `decisions-required.md` say that with D-01 "an old access token is useless without a valid, unrevoked claim" and
  accept the residual "old token plus the new claim of the same actor". `05` S1 acceptance says "old token dead after refresh" and the S1 test list
  says "old token after refresh 401". With D-01 and D-02 **exactly as written** (claim bound to `sub` and `actor_type` only) the last two statements
  are **false**: S1 returns 200. The residual is therefore not "accepted and small": the previous token stays fully usable with the current
  claim for the rest of its TTL (default 8 h, up to 7 days), also after logout (L3, L4), because logout deletes only the current token.
- Which statement wins is a choice for the owner: either keep the residual and rewrite the S1 acceptance (smaller change, F-05b stays open), or add
  token binding (below) and keep the S1 acceptance as written. The binding below does not delete anything on refresh, so it is compatible with D-02.

### 5.7 Design comparison and recommendation (not implemented)
| Option | Closes S1 / S5h / L3 | Closes S3 / S4 | Cost and risk | Compatibility |
|---|---|---|---|---|
| **A. Token-identifier binding (recommended):** claim carries `tid` = Sanctum token id; middleware requires `tid === currentAccessToken()->getKey()` besides `sub` and `actor_type`; issuer creates the token first, then the claim | yes: the claim only fits the token it was minted with; old token A + claim B mismatches; after logout the claim is revoked and the token deleted | yes (with `matches`) | No schema change. Changes `DashboardSessionIssuer`, `RefreshSessionAction`, the other callers of `createToken` (owner verify and brand creation), `DashboardSessionClaim::issue/matches`, and the test helper | Dashboard only. Existing in-flight claims have no `tid`: either force re-login or accept a claim without `tid` until its `exp` behind the rollback flag (a time-boxed hole equal to the session TTL) |
| B. Session generation or version (a `sid` per login chain, a `gen` counter incremented on refresh, stored server-side) | yes | yes | Needs a store (table or cache) and a lookup per request; refresh must bump it; cache storage inherits F-05e | Dashboard only; same legacy-claim question |
| C. Server-side session state (session row keyed by `sid`, token linked to it, revoke by row) | yes, plus durable revocation (also F-05e) | yes | Largest: migration, resolver, expiry cleanup, replaces cache revocation; more change than F-05 needs | Dashboard only; heavier rollout |
| D. D-01 only (bind `sub` and `actor_type`, header mandatory) | **no** | yes | Smallest | None |
**Smallest secure correction: option A on top of D-01.** It keeps D-02 literally (the previous token row is not deleted) while making that token
unusable, needs no migration, and uses data the middleware already has (`$token = $model->currentAccessToken()` at `DashboardAuthorizationMiddleware.php:49`).
Option D alone leaves the critical scenario open; B and C are worth it only if durable server-side revocation (F-05e) is also wanted.
Side effects to plan for: `authenticateDashboardActor` (`tests/TestCase.php:61-82`) mints token and claim separately and is called in
**82 test files (550 call sites)**; it must create the token first and sign `tid` into the claim, which keeps all of them working with one change.
The remaining direct `createToken('dashboard-session', ...)` sites (6) must be reviewed in the S1 slice.

### 5.8 Other confirmed weaknesses and uncertainties
- **Confirmed, low:** `LogoutAction` and `RefreshSessionAction` revoke the claim taken from the **body**, not the header the middleware validated and not
  proven to belong to the caller. Whoever holds any valid claim string can revoke it; refresh does so before the refresh token is checked
  (`RefreshSessionAction.php:25-30`). Recommend revoking the validated header claim in logout in S1.
- **Confirmed, low:** each refresh adds a live access token (default 8 h each) that nothing prunes until expiry (D-02).
- **Claim `role` is never compared** (S4c). It is not an authorization input today (the actor is rebuilt from the token's model), so this is
  informational; bind it too if `matches` is written.
- **Uncertain:** the BFF verifies the claim locally in `proxy.ts` and refreshes when the claim cookie is missing or invalid. Whether a 401 from the
  backend caused by a legacy claim without `tid` triggers that refresh was not exercised (no Playwright in this task). The transition plan must be
  tested in S1, or legacy claims accepted until `exp`.
- **Uncertain:** production `CACHE_STORE`; with `database` revocations persist, with `array` or after a flush they do not (F-05e). `.env` was not read.
- **Not applicable (checked):** mobile apps never call `/api/v1/dashboard/*` through this middleware and their tokens are blocked by
  `EnforceTokenScope`; shared mobile routes in `mobile.php` are outside the claim. A mandatory claim therefore has **no mobile impact**; only the
  dashboard BFF and tests are consumers.
- **T-01 item 4 (rollback flag):** `dashboard.require_session_claim` does **not exist in code**. `grep` finds it only in `05` and `10`. It must be
  created in S1 (`modules/Dashboard/Config/dashboard.php`, default `true`, rollback only; shipping it disabled needs the owner's approval).

### 5.9 Regression tests required (S1, new `DashboardSessionClaimEnforcementTest` plus helper change)
1. Old token A + new claim B after refresh: 401 (S1). Old token A + revoked claim A: 401 (S2).
2. Token + claim of another actor of the same type, and of another type: 401 (S3, S4a, S4b); claim `sub` equal but `actor_type` or `role` different: 401.
3. Header missing: 401 for every actor type and for `/logout` and `/refresh`-adjacent calls; empty, malformed, bad signature, unknown `kid`,
   expired, wrong issuer: 401 (S5a to S5g).
4. Same actor, second valid claim of another session: 401 (S5h). Token B + claim B: 200 for admin, branch, barber and owner (the four guards).
5. After logout: token A (kept) with any valid claim: 401; token B deleted: 401 (L1 to L4).
6. Claim revoked then the cache cleared: documents the F-05e limit (or asserts the durable store if option B or C is chosen).
7. Mobile no-change: branch and barber app tokens on the `mobile.php` routes (`branch/services`, `branch/earnings`, `barber/earnings`, mounted at `/api/v1`) keep working with **no** header;
   a mobile token on `/dashboard/me` stays 403 `TOKEN_ABILITY_MISSING`.
8. Update the header-less callers listed in section 4 (`DashboardLoginApiTest.php:40`, `DashboardProfileApiTest.php:33,49,58,74,80`,
   `DashboardAuthApiTest.php:55,118,140,170,194`) and fix the test at `DashboardAuthApiTest.php:198-200`, which sends the old claim without a bearer.
9. Rollback flag off: header optional again, binding skipped, nothing else changes.

### 5.10 Remaining implementation work (S1, after owner approval)
Owner decision on section 5.6, then: config flag; `matches` (and `tid` when approved) in `DashboardSessionClaim`; middleware enforcement; issuer and
refresh reordered (token first); logout revokes the header claim; test helper and the nine test items above; update
`docs/planning/existing-frontend-audit-part-2.md:20`; run the backend gates, the dashboard gates and Playwright (session-expiry specs).

## 6. Implementation of the approved fix (2026-11-14, uncommitted)

Owner decision: **(b) bind the claim to the access token id (`tid`)**. D-01 (mandatory claim, `sub` and `actor_type` bound) and D-02 (refresh never deletes the
previous access token) are preserved. Sections 1 to 5 describe the state *before* this change; the "Today" columns there are historical.

### 6.1 Backend (implemented)
| Change | File |
|---|---|
| `createToken(): string` replaced by `createAccessToken(): NewAccessToken` | `Handlers/DashboardLoginHandler.php` |
| `issue(actor, tokenId)` writes `tid` (string); new `matches(claim, tokenId, actor)` checks signature, `kid`, issuer, expiry, revocation **and** `tid`, `sub`, `actor_type`; `isValid` and `matches` share one private `verifiedPayload()` | `Support/DashboardSessionClaim.php` |
| `issueAccess()` creates the token **first**, then the claim for `accessToken->getKey()`; `issue()` adds the refresh token | `Support/DashboardSessionIssuer.php` |
| Refresh uses `issueAccess()`; the body claim is still revoked first; the previous token row is untouched (D-02) | `Http/Actions/Shared/RefreshSessionAction.php` |
| Logout revokes the **validated header claim** (the body `claim` is ignored), deletes the current token, revokes refresh tokens | `Http/Actions/Shared/LogoutAction.php` |
| Header mandatory: missing, empty, invalid, expired, revoked claim is 401; after the actor is known the claim must `matches` the current `PersonalAccessToken`; a non-Sanctum (transient) token is 401; ability, guard and role checks unchanged | `Http/Middleware/DashboardAuthorizationMiddleware.php` |
| Header name constant `DASHBOARD_SESSION_CLAIM_HEADER` | `Constants/DashboardSessionConstants.php` |

Legacy claims (no `tid`, or a non-string `tid`) are rejected; there is **no transition acceptance and no rollback flag**. `dashboard.require_session_claim` from
the S1 plan was deliberately not created: it would be a switch back to the weaker behaviour, D-01 makes the claim mandatory, and rollback is a revert.
Mobile is untouched: `mobile.php` routes are outside the middleware and mobile tokens never carry `dashboard` (`EnforceTokenScope`).

### 6.2 Dashboard BFF (traced; one change)
| Path | Behaviour | Evidence |
|---|---|---|
| Login, owner verify and brand creation | `tokensFromBackendData` verifies the claim locally and stores claim, access and refresh cookies together in one response (`setSessionCookies`), so the pair cannot diverge | `login-data.util.ts`, `cookies.ts` |
| Every API call | `forward.ts` sends `Authorization` and `X-Dashboard-Session` from the two cookies; the BFF never forwards without a locally valid claim | `forward.ts`, `backend-client.ts` |
| Refresh | `proxy.ts` and `app/api/auth/refresh/route.ts` call the backend only when the claim cookie fails local verification; the response replaces all three cookies atomically; a failed refresh clears them | `proxy.ts`, `refresh/route.ts` |
| Logout | sends the header claim (and still a body claim, ignored by the backend now) | `logout/route.ts` |
| Password change | forwards the same pair plus the refresh token | `password/change/route.ts` |
| **Change** | `sessionClaimSchema` now requires `tid` (non-empty string) | `src/schemas/session-claim.zod.ts` |

**Legacy sessions and migration.** A browser holding a claim without `tid` now fails local verification, so the proxy and the refresh route use the refresh
cookie and the backend issues a new token and a `tid` claim: **users with a valid refresh token (up to 30 days) migrate silently on their next page load;
users without one, or whose refresh token expired, sign in again.** Without the schema change a locally valid legacy claim would have reached the backend,
returned 401, and `refresh` would have answered `refreshed:false` (claim "live"), ending in a forced logout. Deployment order: backend and dashboard in one release, backend first if staged (the new BFF rejects claims without `tid`, which the old backend still issues; the new backend rejects the old BFF's header-only sessions with 401).

**Loops and races (traced, not changed).** `client.ts` retries a 401 exactly once (`refreshOnce`, deduplicated by `inflightRefresh`) and then signs out; no loop
exists. A locally valid claim that the backend rejects (revoked by logout in another tab, or a mismatched pair) is not refreshed but ends the session
(documented limitation). Two truly concurrent refreshes with one refresh token (proxy plus route) can still lose the race and clear the cookies; that is
pre-existing single-use rotation behaviour and is not made worse by `tid`.

### 6.3 Tests
| Area | Implemented | Executed |
|---|---|---|
| `authenticateDashboardActor` (82 files, 550 call sites): token first, then `issue($actor, $tokenId)` | one change in `tests/TestCase.php`; no call site changed | run 2026-11-15 (section 8.6) |
| Helpers that sent a bearer without a claim updated: `DashboardAuthApiTest` (login, me, branch me, ability, barber, refresh, logout, key rotation), `DashboardLoginApiTest`, `DashboardProfileApiTest`, `SettingsApiTest` | yes | not run |
| New `DashboardSessionClaimEnforcementTest` (17 `it` blocks, several expanded by datasets over admin, branch, barber, owner): binding, missing, empty, malformed, bad signature, unknown kid, expired, wrong issuer, legacy no `tid`, non-string `tid`, revoked, cross actor, cross type, sub and type mismatch with matching `tid`, refresh (A + B, A + revoked A, A without header, A kept in DB), logout (header claim, body claim ignored, claim required), mobile isolation | yes | not run |
| Vitest: `jwt.util.test.ts` (tid exposed; legacy, empty, numeric `tid` rejected), new `tests/app/api/auth/refresh/refresh.route.test.ts` (live claim no backend call, legacy migrates and sets the pair, refreshed legacy claim refused, backend refusal clears cookies, no refresh cookie) | yes | **122 files, 603 tests passed** |
| In-memory harness (real middleware and claim service, no inserts, only a settings SELECT on `dorak_test`; script kept in the session scratchpad) | 25 scenarios | **25 of 25 as expected** (200 only for the bound claim; 401 for A + B, revoked A, missing, empty, malformed, tampered, unknown kid, expired, wrong issuer, legacy, non-string tid, other sub, other type, cross actor, no ability, transient token) |

### 6.4 Security review and residual risks
- Scenario S1 (old A + new B), S3, S4a/b, S5h and L3 from section 5.4 now return 401 in the harness; header-less (S1b, S1e, S5a, L4) too.
  Statically, over HTTP, refresh and logout are covered by the new Pest cases, which were **not executed**.
- **Cache-backed revocation (F-05e) applied when section 6 was written; superseded by section 8** (the superseded token now expires in the database). Original text: Claim revocation is a cache key. If the cache is flushed (or the store is `array`), a revoked claim A becomes valid
  again until `exp` and, with token A kept (D-02), the pair A + claim A authenticates again. `tid` does not fix this; durable revocation (a session table or
  deleting the previous token, both outside D-01/D-02) would. Production `CACHE_STORE` is unknown.
- A holder of a stolen **current** token plus its own claim is not stopped: both live in HttpOnly cookies and are issued together. `tid` removes mixing and
  stale generations, not theft of the pair.
- Every refresh still leaves one more live access token row until its expiry (D-02); with `tid` it is unusable once its claim is revoked.
- `role` and `branch_id` in the claim are still not compared with the server-side actor (the actor is rebuilt from the token's model).
- Refresh revoked the body claim before the refresh token was checked (low). **Fixed, section 8.**

### 6.5 What was not run and the authorization needed
> Historical (written before the gates). All of it was run on 2026-11-15 after the owner's authorization: see section 8.6.
Pest feature tests use `RefreshDatabase` (`migrate:fresh` on `dorak_test`), which is a database write, so **no Pest test was executed** in this task; neither were
Playwright, `composer test`, nor the backend suite. To close that gap the owner must authorize `cd backend && composer test:db:up && vendor/bin/pest tests/Feature/Dashboard tests/Feature/Preference tests/Feature/Mobile tests/Feature/Core`
(then the full `composer test`) on `dorak_test` only, plus the dashboard Playwright session-expiry specs with the legacy-cookie case. Until then the backend
HTTP behaviour is statically verified and harness-verified, not Pest-verified.

## 7. Final security review: revocation durability, concurrent refresh, refresh order, Pest requirements (audit 2026-11-15; documentation only)
> **Status 2026-11-15 (later):** the owner directed the fixes to be implemented; the decisions D-05 to D-07 and the implementation are in section 8. This section keeps the audit evidence as found, before the fixes.
Scope: audit and documentation. **No application code, test, database, `.env*` or Git change was made.** Nothing below is an approved decision: every
recommendation is **proposed** and waits for the owner (decisions D-05 to D-07 in [04](04-decisions-and-open-questions.md) section G). Evidence labels:
**Proven** = read in code or measured; **Assumption** = not proven. No Pest, no database access and no HTTP request ran in this review (the `dorak_test` container is
stopped, see 7.5).

### 7.1 F-05e Persistent session revocation
**Facts (proven by code).**
- Revocation is one cache key per claim: `DashboardSessionClaim::revoke()` `cache()->put('dashboard:revoked-jti:'.$jti, true, ttl)` (`Support/DashboardSessionClaim.php:96-100`),
  read by `isRevoked()` `cache()->has(...)` (`:91-94`), consulted in `verifiedPayload()` (`:184`). The store is `CACHE_STORE` (`modules/Core/Config/cache.php:8`);
  `.env.example:46` ships `database`; `phpunit.xml:51` forces `array`. Production value: **assumption** (`.env` files are not read).
- A revoked entry vanishes on: `php artisan cache:clear` or `optimize:clear`, truncating the `cache` table, a Redis restart or key eviction (if Redis is used), or a
  switch of `CACHE_STORE`. With the `array` store it never survives a request. `deploy.yml:337-341` forbids `optimize:clear` in the deploy, so the pipeline does not flush it;
  a manual operator flush is the realistic trigger. Fail mode if the cache store is down: `has()` throws, the request fails (closed).
- Refresh revokes the previous claim (`RefreshSessionAction.php:27`) and keeps token A (D-02). Logout **deletes** the token (`LogoutAction.php:32-34`), so a logged-out
  pair stays dead after a flush. Only **refresh-replaced** pairs are affected.
**Answer to the question.** Yes: after a flush, old token A plus old claim A authenticates again (`matches()` passes: `tid`, `sub`, `actor_type` all equal, the claim is
unexpired and un-revoked) until the earlier of claim `exp` and token expiry. Both use `DashboardSessionTtlSeconds` (`Handlers/DashboardLoginHandler.php:46,123-126`,
`DashboardSessionClaim::expiresIn`), so the window is at most one session TTL (setting value not read here).
**Exploitability.** Needs (1) a copy of an old token A **and** claim A (both HttpOnly cookies; XSS cannot read them, so this means an intercepted or logged pair)
and (2) a cache flush inside the window. **Severity: Low to Medium. Confidence: High** for the mechanism (code), **Low** for likelihood (production store and operator habits unknown).
Not a vulnerability by itself on a clean system; it is a durability gap in a defense that D-01 depends on.
**Options.**
| Option | What | Security | Cost and impact | D-02 |
|---|---|---|---|---|
| A. Accept + operations rule | Document "never flush the cache store; use a dedicated store/connection for revocation keys" | unchanged | none | kept |
| B. Expire, do not delete, token A on refresh (proposed) | After a **successful** rotation, read `tid` from the verified body claim, check the token belongs to the rotated actor, and set that `personal_access_tokens.expires_at` to now (optionally now + a short grace, see 7.2). Row stays. | token A dies in the database; survives any cache flush; closes the F-05 stale-pair window; no per-request cost (Sanctum already checks `expires_at`) | one UPDATE per refresh; no new table or column; needs a small helper (resolver for token by id and actor); in-flight requests using A fail unless a grace is allowed | **Kept in letter** (row not deleted); changes the intent if D-02 exists to let in-flight requests finish. **Needs the owner's reading of D-02** |
| C. Durable revocation table | `dashboard_revoked_claims(jti or tid, expires_at)`; written with the cache key; checked on every request | survives flush; independent of tokens | new migration, one indexed query per dashboard request, a prune job | kept in full |
| D. Session table (`dashboard_sessions`, id = `tid`) | Authoritative server session, claim checked against it | strongest; enables "log out everywhere", listing, ban revocation (helps S6) | new table, per-request query, larger change | kept |
**Recommendation (proposed): B**, with A's operations rule recorded in any case. If the owner says D-02 means "the old token must remain usable", use C instead (D if S6 later
wants server sessions). Safest for the smallest maintained surface: B. **Open question for the owner (D-05):** what behavior does D-02 protect (row retention for audit, or
in-flight request overlap)? **Acceptance criteria:** with `cache:clear` run between refresh and the replay, old A + old claim A returns 401; token A row still exists;
current pair still works; refresh of another actor's claim does not touch that actor's tokens; logout unchanged. **Tests:** Pest feature test that flushes the cache after
refresh (needs MySQL, not run).

### 7.2 Concurrent refresh
**Backend (proven by code, not by a concurrent run).**
- `DashboardRefreshTokenResolver::rotate()` (`Repositories/DashboardRefreshTokenResolver.php:39-66`) runs in `DB::transaction`, selects the row with `lockForUpdate()` (`:42-45`),
  checks `isActive()` (`:47`), creates the successor (`:57`), revokes the old row and sets `replaced_by_token_id` (`:59-62`). Two simultaneous requests with the same refresh token
  serialize on the row lock; the second sees `revoked_at` set and returns `null` (401). **Both cannot succeed. Confidence: High** (InnoDB locking read returns the latest committed
  row). No existing Pest test runs two rotations concurrently (`DashboardAuthApiTest.php:184` covers sequential replay only; the `tests/Concurrency` group has no refresh case).
- Different refresh tokens of the same actor (two devices) rotate independently; no conflicting claim is possible because each claim is bound to its own `tid`.
- **Gap (Medium to Low, availability only):** the access token and claim are created **after** the transaction commits (`RefreshSessionAction.php:32-40`). If `issueAccess()` throws
  (settings or secret error), the refresh token is already consumed, the client gets a 500 and has no valid refresh token: the session is lost (fails closed, forced re-login).
  Fix: run rotation and issuance in one transaction (see 7.3).
- `/refresh` is throttled `10/min` per client (`Routes/Api/V1/dashboard.php:34`).
**BFF (proven by code; frequency not measured).**
- `frontend/web/dashboard/src/proxy.ts:28-33` and `src/app/api/auth/refresh/route.ts:15-25` call `refreshSession()` whenever the local claim is invalid, with the same refresh cookie.
  `client.ts` `refreshOnce()` de-duplicates **only inside one browser tab** (module variable `inflightRefresh`). Proxy runs per request on `/dashboard/:path*`, so parallel
  requests of one page load, two tabs, or the proxy plus a client retry can each present the **same** refresh cookie.
- Winner: new cookies. Loser: backend 401, then `route.ts:19-22` returns a failure with `clearSessionCookies(failure)` (cookie deletion), and `proxy.ts:32,49` clears cookies and
  redirects. Browsers apply `Set-Cookie` in arrival order, so a late loser response can **delete the winner's fresh cookies**: a valid session ends in a forced login and leaves an
  orphaned token row. **Confirmed by code, not by a run. Severity: Medium (false logouts, noisy), Confidence: High (mechanism) / Medium (frequency).** It is not a
  security bypass: nobody gains access; the old session is not kept alive.
- Old session after a race: the old refresh token is dead; the old access token A stays until expiry (D-02) but its claim is revoked, and the loser's body claim revoke is idempotent.
**Race-safe design (proposed, D-06).**
1. Keep the backend rotation strictly single-use with the row lock (security baseline).
2. BFF single-flight: a module-level `Map<refreshTokenHash, Promise<SessionTokens | null>>` in `services/api/auth/refresh.ts`, so concurrent callers in the same Node process share
   one backend call and each sets the same cookies. Keyed by the cookie value, so only a holder can join. Covers a single BFF instance (the dominant case).
3. Loser safety for multi-instance: a BFF 401 from refresh must not blindly delete cookies; re-read the request's cookies is impossible server-side, so the client
   (`refreshOnce`) retries once after a failed refresh before `reportSessionExpired()`; the retry carries the winner's cookies.
4. Rejected for now: a backend leeway window that replays the successor to the same refresh token (needs a recoverable encrypted successor secret; weakens single-use) and
   refresh-token reuse detection that revokes the whole family (turns this race into mass false logouts). Revisit both only together, with a grace window.
**Acceptance:** two parallel BFF refreshes with one cookie yield one backend call, both responses carry the same new cookies, no deletion `Set-Cookie`; a real replay later still
401 and clears cookies; backend: two concurrent `rotate()` calls give exactly one success (Pest `concurrency` group, MySQL).

### 7.3 Refresh validation order
**Actual order (proven, `RefreshSessionAction.php:24-42`):** (1) `revokeClaim($body claim)` at `:27`, which verifies signature, `kid` and unexpired `exp` only (`DashboardSessionClaim.php:102-132`);
(2) reject a non-string refresh token at `:28`; (3) `rotate()` at `:32`; (4) reject a null result at `:33`; (5) issue the new pair at `:39`. Request validation
(`RefreshSessionRequest`) runs first and accepts a missing `claim`.
**Answers.**
- *Is the refresh token validated before the old claim is revoked?* **No.** The claim is revoked at step 1, before steps 2 to 4. Proven.
- *Can an invalid request revoke a legitimate session?* Yes, by anyone who holds a **valid claim string** and sends any request with an invalid or missing refresh token: that claim is revoked, so
  the session's token+claim pair stops working (D-01). The claim is an HttpOnly cookie, so this needs a prior leak of the claim; it is not exploitable by a stranger. The BFF treats a
  locally valid but backend-revoked claim as `refreshed:false` (`route.ts:14`), so the user is signed out rather than silently renewed. **Severity: Low. Confidence: High** (code),
  **Low** (practical exploitability). Also the claim is not required to belong to the refresh token's actor, so a claim of actor X sent with a valid refresh token of actor Y revokes X's claim
  (cross-actor denial of service; needs X's claim string; Low).
- *Replay or concurrent requests, inconsistent state?* Replay of a rotated token returns 401 with no state change except the idempotent claim revoke. Concurrent: see 7.2. State
  inconsistency exists in one place: rotation commits, then issuance can fail (7.2 gap).
**Correct order (proposed, D-07).** (1) Validate the refresh token and rotate it inside one `DB::transaction`; (2) inside the same transaction create the access token (`createAccessToken`) and build the
claim, so any failure rolls the rotation back; (3) only after the transaction commits (`DB::afterCommit`), verify that the body claim's `sub` and `actor_type` equal the rotated actor and revoke it
(and, if D-05 chooses B, expire token `tid`); a mismatching or absent claim revokes nothing. Behavior changes: an invalid refresh request no longer has any side effect; a refresh with a
foreign claim does not revoke it. **Acceptance:** invalid refresh token + valid claim leaves the claim valid (Pest, no DB write beyond the test DB); valid refresh with another actor's claim leaves that claim valid;
a forced exception in issuance leaves the refresh token active.

### 7.4 Severity and confidence summary
| ID | Finding | Evidence | Severity | Confidence | Status |
|---|---|---|---|---|---|
| F-05e | Revoked claim valid again after cache flush; A + claim A regains access until TTL | `DashboardSessionClaim.php:91-100,184`; `cache.php:8` | Low to Medium | High (mechanism), Low (likelihood) | Proposed option B (D-05) |
| F-05f | Two concurrent refreshes cannot both succeed on the backend | `DashboardRefreshTokenResolver.php:39-66` | none (holds) | High (static) | Not runtime-verified |
| F-05g | BFF concurrent refresh can delete the winner's cookies (false logout, orphan token) | `proxy.ts:28-49`, `refresh/route.ts:15-25`, `client.ts` `refreshOnce` | Medium (availability) | High / Medium | Proposed single-flight + one retry (D-06) |
| F-05h | Body claim revoked before the refresh token is validated; foreign claim revocable | `RefreshSessionAction.php:27` | Low | High | Proposed order (D-07) |
| F-05i | Refresh token consumed before issuance; issuance failure loses the session | `RefreshSessionAction.php:32-40` | Low (availability) | High | Proposed single transaction (D-07) |
| F-05j | No reuse detection on replayed refresh tokens; no pruning of expired `personal_access_tokens` (no `sanctum:prune-expired` or `model:prune` for them found in `routes`, `bootstrap`, `ApplicationServiceProvider.php:87`) | grep, `RefreshTokenResolver` | Low | Medium (a scheduler elsewhere not excluded) | Recorded; reuse detection deferred with 7.2 item 4 |

### 7.5 Backend Pest execution requirements (answered, not executed)
- **Configuration:** `backend/phpunit.xml:43-55` forces `DB_CONNECTION=mysql`, host `127.0.0.1`, port `3307`, user/password `root`/`root`, database `dorak_test`, `DB_URL` empty, with `force="true"`,
  so a stray `DB_*` variable, `.env` or `.env.testing` cannot redirect it; `CACHE_STORE=array`, `QUEUE_CONNECTION=sync`, `SESSION_DRIVER=array`. `.env.testing` is not needed and must stay unchanged.
- **Guards:** `tests/TestCase.php:20-55` calls `TestDatabaseGuard::assertSafe` and `assertServer` in `refreshApplication()` and `setUpTraits()`, before `RefreshDatabase` runs `migrate:fresh`; they
  refuse any environment other than `testing`, any driver other than `mysql`, any host other than loopback, any database other than `^dorak_test$`, port other than 3307, server version other
  than 8.4 and parallel runners (`TestDatabaseGuard.php:20-39`). `scripts/reset_test_database.php` applies the same guard before `DROP DATABASE`/`CREATE DATABASE` and `migrate:fresh`.
- **Isolation is possible.** The dedicated container `dorak-test-db-mysql-1` (`backend/docker-compose.test.yml`: `mysql:8.4`, `127.0.0.1:3307->3306`, `tmpfs` data, database `dorak_test`) holds nothing else. A different
  MySQL listens on `127.0.0.1:3306` (the development server); it is **not** targeted because the port is forced to 3307 and the guard rejects other ports.
- **Current state (read-only checks, 2026-11-15):** the container exists and is `Exited (255)` since about two hours earlier (cause not investigated); nothing listens on 3307. The data is in `tmpfs`, so it is gone.
- **Exact authorization needed (owner, one explicit approval each):**
  1. Start the test container: `cd backend && composer test:db:up` (`docker compose -f docker-compose.test.yml up -d --wait`; creates/starts only `dorak-test-db-mysql-1`).
  2. Run Pest on `dorak_test` only: `vendor/bin/pest tests/Feature/Dashboard tests/Feature/Preference tests/Feature/Mobile tests/Feature/Core` (runs `migrate:fresh` and test writes inside `dorak_test`).
  3. For the full suite: `composer test` (first `composer test:reset`: `DROP DATABASE dorak_test` + `CREATE DATABASE` + `migrate:fresh`, then `php artisan test`), optionally `composer test:concurrency` for the new refresh race test.
  4. Afterwards `composer test:db:down` if the owner wants the container removed.
  No `.env` or `.env.testing` change, no seeding, and no touching of the 3306 server are required. Each step writes only to the throw-away tmpfs database.

### 7.6 Dependencies and tests required if the owner approves
- D-05 (B or C) depends on the D-02 reading; touches `RefreshSessionAction`, the refresh resolver or a new token helper, and `DashboardSessionClaim` (read `tid` without a full match). Mobile: no impact (mobile tokens are not issued by this flow).
- D-06 is BFF-only (`refresh.ts`, `client.ts`, Vitest) with an optional backend concurrency test; no contract change.
- D-07 is a reorder inside `RefreshSessionAction` plus one transaction; no response shape change.
- New tests: cache-flush replay (Pest), invalid refresh token leaves claim valid (Pest), foreign claim not revoked (Pest), forced issuance failure keeps refresh token (Pest), concurrent `rotate()` one winner (Pest concurrency),
  BFF single-flight (Vitest), client retry-once (Vitest), one Playwright run of two parallel navigations with an expired claim.
- All of these still wait for the Pest authorization in 7.5. These slices are an **extension of S1** and must not start without the owner's decisions.

## 8. Implementation of D-05 to D-07 (2026-11-15; all gates passed, see 8.6)
The owner's instruction clarified D-02: **keep the old database row, not its usability**. After a successful refresh the old token must not authenticate.

### 8.1 Decisions (final, from the owner's direction; rationale and rejected alternatives)
| ID | Decision | Why | Rejected |
|---|---|---|---|
| D-05 | On a successful refresh the superseded access token is **expired in the database** (`expires_at` one second in the past) when the previous claim proves it belongs to the rotated actor. The row stays (D-02). | Sanctum checks `expires_at` on every request straight from the row (`vendor/laravel/sanctum/src/Guard.php:129`, no cache), so it survives cache flush, eviction and restart; no new table, no extra query per request. Verified in-memory: an expired token is rejected, a live one accepted. | Operations warning alone (not a fix); durable revoked-claims table (one more query per request, new migration, same result); session table (larger change, kept for S6 if wanted); deleting the row (violates D-02) |
| D-06 | BFF **single-flight** per refresh token plus a short replay window (`REFRESH_REPLAY_WINDOW_MS`, 5 s, memory only) for a success. Failures are never kept. Backend rotation stays strictly single-use. | Parallel requests of one page load or two tabs present the same cookie; the loser must receive the winner's session, not a 401 that clears the cookies. | Backend replay window or reuse detection (weakens single-use, family revocation would turn the race into mass false logouts); deleting no cookies on failure (loops on dead sessions) |
| D-07 | Refresh order: validate and rotate the refresh token, expire the old token (DB) and issue the new pair inside **one transaction**; revoke the old claim in the cache **after commit**, tolerating a cache failure (reported, not fatal). A body claim is used only if its `sub` and `actor_type` match the rotated actor. | An invalid request changes nothing; a failure while issuing rolls the rotation back (the refresh token stays usable); the cache cannot take part in the transaction, so it runs last and cannot cost the user the new session because the database already killed the old token. | Revoking the claim before validation (the old behaviour); cache revocation inside the transaction (a rollback would leave the live session revoked) |

### 8.2 Backend changes
| File | Change |
|---|---|
| `modules/Dashboard/Handlers/DashboardRefreshSessionHandler.php` (new) | `refresh($refreshToken, $previousClaim)`: one `DB::transaction` for rotate, expire superseded token, issue new pair; claim cache revoke after commit in a try/catch with `report()` |
| `modules/Dashboard/Http/Actions/Shared/RefreshSessionAction.php` | thin: validated input to the handler, 401 when null; no revocation before validation |
| `modules/Dashboard/Handlers/DashboardLoginHandler.php` | `expireAccessToken($actor, $tokenId)`: updates only the actor's own token (`tokenable_type` and `tokenable_id` scope, verified in the generated SQL), never extends an expiry |
| `modules/Dashboard/Support/DashboardSessionClaim.php` | new `boundTokenId($claim, $actor)` (signature, issuer, `kid`, unexpired, `sub`, `actor_type`, `tid`; ignores revocation); `signedPayload()` shared by `verifiedPayload()`, `revokeClaim()` and `boundTokenId()` |
Unchanged: login, owner verify, logout (deletes the current token), the middleware, `matches()`, the claim format, the API response shape, the mobile apps (mobile tokens are not issued by this flow).

### 8.3 BFF changes
`src/services/api/auth/refresh.ts` (single-flight `Map` keyed by the presented refresh token, replay window, failures dropped), `src/config/refresh-coordination.constant.ts`. `proxy.ts` and `app/api/auth/refresh/route.ts` are unchanged and benefit because both call `refreshSession`.
Limit (stated plainly): coordination is **per server process**. Two BFF instances without sticky routing can still race; the backend rotation stays single-use, so the loser gets a 401 and its response can clear cookies. Closing that needs a backend replay window (rejected above) or sticky routing; it is recorded as the residual.

### 8.4 Acceptance criteria and test evidence
| Criterion | Test | Executed |
|---|---|---|
| After refresh and `Cache::flush()`, old A + claim A and A + claim B are 401, A row exists with a past `expires_at`, B works (all four actor types) | `DashboardSessionClaimEnforcementTest` "keeps old token A dead after a cache flush" | **Yes** (8.6) |
| A cache that fails the revocation write does not fail the refresh; A is still dead | same file, "does not lose the new session when the cache cannot store the revocation" | **Yes** (8.6) |
| Invalid refresh token + live claim revokes and expires nothing | same file, F-05h | **Yes** (8.6) |
| A foreign claim, or a forged `tid` naming another actor's token, touches no other actor's session | same file, F-05h | **Yes** (8.6) |
| The loser with a used refresh token gets 401 and the winner's session and next refresh work | same file, F-05h | **Yes** (8.6) |
| A failure while issuing rolls back the rotation: one refresh row, not revoked, old pair valid | same file, F-05i (mocked `DashboardSessionIssuer`) | **Yes** (8.6) |
| Parallel BFF refreshes share one backend call and one cookie set, no deletion | `refresh.single-flight.test.ts` (5 tests), `refresh.route.test.ts` (parallel case) | **Yes** (Vitest) |
| Claim helpers: `boundTokenId` for matching, foreign, legacy, int `tid`, expired, tampered, unknown `kid`, wrong issuer; revoked replay still names its token; tampered claim cannot revoke; Sanctum rejects an expired token | scratch harness (outside the repo, no database) | **Yes**, 16 checks pass |
| Real two-process concurrent `rotate()` | **not written** (needs committed rows and `migrate:fresh`, the `concurrency` group); the row lock is proven by code only | No |
Safe checks run: Vitest 123 files / 609 tests, `tsc --noEmit` (exit 0), eslint on touched files, `vendor/bin/pint --test`, `php -l`, `check-conventions.sh`, `git diff --check`.

### 8.5 Guarantees after the fix, and what remains
- Old token A cannot authenticate after a successful refresh, with or without the cache, as long as the refresh request carried a claim that proves A (the BFF always sends the claim cookie). **Residual:** a refresh sent **without** the old claim (cookie lost) leaves A unexpired; A still needs a matching valid claim (none exists for it), so it cannot authenticate, and it expires at its own TTL.
- An invalid or foreign refresh request has no side effect on any session.
- A failed issuance does not consume the refresh token. A cache outage after commit does not lose the session.
- Not prevented: theft of the current token plus its claim; the cache-based claim revocation is now defense in depth only; `role` and `branch_id` in the claim are not compared server-side; multi-instance BFF race (8.3); expired `personal_access_tokens` rows still accumulate (no prune job; F-05j recorded, outside this change).
- The residual risks above are accepted and recorded; the gates are in 8.6.

### 8.6 Gate results (2026-11-15, after the owner authorized the test database, Pest and Playwright)
- `composer test:db:up` started `dorak-test-db-mysql-1` (MySQL 8.4, `127.0.0.1:3307`, `dorak_test` only).
- First scoped Pest run (`tests/Feature/Dashboard`, `Preference`, `Mobile`, `Core`): **60 failed, 925 passed**. Cause: `TestCase::authenticateDashboardActor` called twice in one test; the guard kept the first request's user and token, so the second call's claim (`tid` of the new token) did not match. Fixed in the helper (`$this->app['auth']->forgetGuards()`), no application code. One new test also tried to mock the `final` `DashboardSessionIssuer`; rewritten to fail issuance for real (blank signing secret after the token row is created), which also proves the token insert rolls back.
- Scoped Pest after the fixes: **985 passed**. `DashboardSessionClaimEnforcementTest`: **45 passed**. Full `composer test` (resets `dorak_test`, then `php artisan test`): **2470 passed, 10528 assertions**.
- Vitest 123 files, 609 tests; eslint, `tsc --noEmit` clean.
- New Playwright spec `tests/e2e/session-refresh.spec.ts` (unusable claim cookie renewed from the refresh cookie; two parallel navigations with the same refresh cookie keep the session): 2 passed on the production build, `TZ=UTC`, app port 3100, API port 8000 (3000 and 3001 belong to another project and were not touched).
- Full Playwright suite (desktop, mobile-390, ultrawide-3440; production build, `TZ=UTC`, `dorak_test`): **441 passed** (39.6 min), including the new `session-refresh.spec.ts`.
- Still not covered: a real two-process concurrent `rotate()` test (row lock proven by code only), and the multi-instance BFF race (residual 8.3).
