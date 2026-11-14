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
