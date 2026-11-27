---
codeanchors:
  - backend/
  - frontend/
---

# Wave 5: notifications and privacy

Routes: [wave tracker](index.md) · [runbook](runbook.md) · [backlog](../backlog/index.md)

**State:** todo.

**Goal:** People control their notifications and their data is handled with consent.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W5.1 | BD-15 | Turning off `allows_push_notifications` stops push sends; find every sender first | Pest: no send when off, on every path | todo |
| W5.2 | BG-13 | Verify the price display fix and check mobile price display | evidence recorded; backlog row updated | done 2026-11-27 (closed by the documentation audit; display difference logged as TD-24) |
| W5.3 | BG-37 | Verify each browser push risk, then fix the confirmed ones | each risk marked confirmed, fixed or not reproducible | todo |
| W5.4 | BG-14 | Consent record for face photos, marketing opt-out, data export | the owner approves the scope first; then Pest and client updates | todo |
| W5.5 | BG-38 | Choose how to handle the Firebase advisories (BD-14 pins the version) | the owner picks an option; gates pass | todo |
| W5.7 | BG-53 | Reproduce whether a payload fault reaches the token-deletion branch, then narrow it | Pest: a payload error keeps the token; a bad token is still deleted | done 2026-11-27 (pushed, not deployed) |
| W5.6 | release | Wave close ([tracker](index.md#wave-close)) | released, documented, reported | todo |

## Notes

- Reference: [push notifications](../architecture/push-notifications.md).
- Real delivery checks need RR-16 and RR-8.

## Log

- 2026-11-27 W5.7, done early by owner decision. Reproduced with Pest: three payload errors in Firebase's documented shape deleted a healthy token. Fixed; `composer test` 3014 passed. Pushed by the owner the same day; not deployed.
- 2026-11-27 W5.2, closed by the audit. The fix is in `c386493f2`, an ancestor of `a712aca7f`, where the dashboard gates and the full Playwright run passed; `format-price` and `money` unit tests rerun: 8 passed. A source search found mobile amounts going through `MinorUnits.toMajor` (divide by 100) and no currency formatter.
