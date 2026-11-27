---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Authentication Flow

Status: `DONE` — login, registration, email verification and password recovery
(Stitch 011–014) are all wired against the live backend.

## Backend contract

Laravel 13 + **Sanctum opaque bearer tokens** (not JWT), base `/api/v1`.
Endpoint constants live in `packages/core/.../endpoints/auth.endpoints.dart`.

| Call | Route | Notes |
| --- | --- | --- |
| Register | `POST /client/register` | 201. Requires `password_confirmation` (Laravel `confirmed`). Returns `{token, client}` — **the user is authenticated immediately, before verifying.** |
| Login | `POST /client/login` | `{email, password}` → `{token, client}`. 401 on bad credentials. Email only — there is no phone login. |
| Refresh | `POST /client/refresh-token` | `auth:client`. Revokes the current token, returns a replacement. Used as the session-validity probe. |
| Send code | `POST /client/email/verify/send` | `auth:client`. 6-digit code, 10-minute TTL. |
| Verify | `POST /client/email/verify` | `auth:client`, `{code}` with `size:6`. 422 on a wrong code. |
| Logout | `POST /client/logout` | `auth:client`. 200 with **no `data` key**. |

## Screen flow

```text
Auth Entry (006)
├── Log In        -> Login (007)  --success-->  Home
│                        └── Forgot Password?
│                              -> Forgot Password (011)
│                              -> Recovery Code   (012)
│                              -> New Password    (013)
│                              -> Reset Success   (014) --> Login (007)
├── Create Account-> Sign Up (008) --success--> Verify (009) --+--> Home
└── Continue as Guest -> onboarding tour       (skip) ---------+
```

Recovery is the one branch that does **not** end at Home — it returns to Login, so
the user signs in with the new password. Details, and the three backend constraints
that shape it: `password-recovery.md`.

Wiring lives in `apps/client_app/lib/src/core/navigation/app.router.dart`
(`AppRouter`). Every success path ends in `router.go(AppRoutes.home)`, which
clears the stack by construction.

Logging in **bypasses the onboarding tour** — a returning user is assumed not to
need the introduction.

## Continued in

- [Part 2: Verification is non-blocking](auth-flow-part-2.md)
