---
nodeid: docs.waves.wave-2
parentnode: docs.waves
childnodes: []
codeanchors:
  - backend/
  - frontend/
---

# Wave 2: sign-in and exposure

Routes: [wave tracker](index.md) · [runbook](runbook.md) · [backlog](../backlog/index.md)

**State:** todo.

**Goal:** One-time codes and tokens cannot be reused, and public endpoints expose and accept only what they should.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W2.1 | BG-28 | One shared service that consumes a code once; hash stored codes ([file 04](../booking-concurrency/04-hashing-and-tokens.md)) | parallel test: one success; wrong guesses stay within the limit | todo |
| W2.2 | BG-29 | Refresh proceeds only when it deleted exactly one token (Client, Barber, Branch `RefreshTokenHandler.php`) | parallel test: one 200, one 401, one live token | todo |
| W2.3 | BG-30 | `UnverifiedSignupPurger` rechecks under the client lock | parallel test: a verified client survives | todo |
| W2.4 | BG-16 | Throttle unauthenticated GET routes | a 429 test per named limiter | todo |
| W2.5 | BG-4 | Remove the `email` shim from the public barber resource; update the apps in the same task | contract tests, `melos verify` and dashboard gates pass | todo |
| W2.6 | BG-49 | Reproduce the English answers to Arabic requests; check the other sign-in routes | Pest checks Arabic answers; the stored-language rule for signed-in mobile routes is kept or the owner is asked | todo |
| W2.7 | BG-50 | Apply the non-breaking `npm audit fix` with any dashboard change | dashboard gates and Playwright pass | todo |
| W2.8 | release | Wave close ([tracker](index.md#wave-close)) | released, documented, reported | todo |

## Notes

- Shared patterns: [fix order](../booking-concurrency/10-fix-order.md) (conventions 4 and 5).
- Parallel tests go in `backend/tests/Concurrency/` (TS-8).
- BG-28 needs a shared cache store; check what dev uses without reading secret values. A schema change for hashed codes may need a dev reset.

## Log

No entries yet.
