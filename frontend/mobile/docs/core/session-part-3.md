---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 3 of 5 · [Session Management](session.md) · [Previous](session-part-2.md) · [Next](session-part-4.md)

## Restoration

Validity is checked by rotating the token through
`POST /client/refresh-token`, which sits behind `auth:client`. After a
successful rotation the bloc loads the client with `GET /client/profile`
(`ProfileRepository.getProfile()`), so `SessionState.client` is populated after
a cold start.

```text
token = await tokenStorage.read()

read() throws            -> guest  (error recorded)   <- fail-safe
token == null            -> guest
refreshToken() succeeds  -> persist rotated token, getProfile(), authenticated + client
  (getProfile() failures follow the same 401/403 / network / other split below)
  ApiException 401/403   -> clear token, guest
  NetworkException       -> authenticated  (token kept)
  other ApiException     -> authenticated  (token kept)
```

**`_onRestore` must always leave `AuthStatus.unknown`.** `ready` completes only
when the status resolves, and `AppRouter._leaveSplash` awaits `ready` — so a
handler that exits with the status still `unknown` hangs the splash forever with
no error shown. `flutter_secure_storage` can throw on Android (keystore
failures), so the read is guarded and the accumulator is seeded to `guest`
before any I/O: an unreadable token is not an authenticated session.

The transport-failure branch is deliberate: Sanctum tokens have **no
server-side expiry** (`SANCTUM_EXPIRATION` is unset), so an unreachable server
is no evidence the session ended. Logging the user out on a flaky start would be
strictly worse.

Note that Laravel's guard returns a bare `{"message":"Unauthenticated."}` rather
than the API envelope, so `ApiClient` maps it to `ApiException(401, 'UNKNOWN')`.
Branch on `isUnauthorized`, never on `code`. A response whose body is not a JSON
object keeps its status too, with code `INVALID_RESPONSE` (see
[exceptions](exceptions.md)).
