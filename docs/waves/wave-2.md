---
codeanchors:
  - backend/
  - frontend/
---

# Wave 2: sign-in and exposure

Routes: [wave tracker](index.md) · [runbook](runbook.md) · [backlog](../backlog/index.md)

**State:** doing.

**Goal:** One-time codes and tokens cannot be reused, and public endpoints expose and accept only what they should.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W2.1 | BG-28 | One shared service that consumes a code once; hash stored codes ([file 04](../booking-concurrency/04-hashing-and-tokens.md)) | parallel test: one success; wrong guesses stay within the limit | done |
| W2.1a | BG-60 | A password set in an app ends dashboard sessions too, in one transaction with the account lock | reset and signed-in change revoke every session; a failed revocation changes nothing | done |
| W2.1b | BG-61 | Refuse a password on the two profile routes | 422; password and sessions unchanged | done |
| W2.1c | BG-62 | Require the current password to change the email there; client app asks for it | Pest and `melos verify` pass | done |
| W2.1d | BG-63 | A branch password set by an admin or owner ends that branch's sessions | every old session is refused; other branches keep theirs | done |
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
- BG-28 needs a shared cache store. What dev sets `CACHE_STORE` to isn't verified (2026-11-28); check the value of that one key before the next backend deploy. No schema change, so no reset; codes pending at the deploy stop working.

## Log

| Date | Commit | Action and evidence |
|---|---|---|
| 2026-11-28 | BG-28 `fix(auth)` commit | W2.1 done. Parallel tests for seven flows: 14 passed; with the cache lock and the email-change row lock removed, all 14 failed (extra requests got 200). New tests for failed writes and the owner verify timing path failed before their fix. Timing itself wasn't measured |
| 2026-11-28 | BG-60 `fix(auth)` commit | W2.1a done, taken over from uncommitted work (owner). On an export of the previous commit, a dashboard session survived all three app resets and the client's signed-in change. The three reset cases of the new revocation-failure test failed before the transaction was added (new password kept). No parallel test of the account lock |
| 2026-11-28 | BG-61 `fix(auth)` commit | W2.1b done. Six cases (client and barber; a value, empty and null) failed before the fix. The client and stylist apps' profile calls send no password, and the dashboard doesn't call these routes. What released app builds send wasn't checked |
| 2026-11-28 | BG-62 `fix(auth)` commit | W2.1c done. Pest: 3090 passed; `melos run verify`: exit 0. The client app asks for the current password when the email is edited; released builds don't, so an email change from them gets 422. Not tried on a device. Follow-ups: BD-20, BD-21, BG-64 |
| 2026-11-28 | BG-63 `fix(auth)` commit | W2.1d done. Five of the six new tests failed before the fix. Pest: 3096 passed. Found on the way, not changed: BG-65, BG-66, BG-67 |
