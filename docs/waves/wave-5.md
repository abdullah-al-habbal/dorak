---
nodeid: docs.waves.wave-5
parentnode: docs.waves
childnodes: []
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
| W5.2 | BG-13 | The row says the price display fix is uncommitted, but its test is in Git (`c386493f2`). Verify, then close or finish; check mobile price display | evidence recorded; backlog row updated | todo |
| W5.3 | BG-37 | Verify each browser push risk, then fix the confirmed ones | each risk marked confirmed, fixed or not reproducible | todo |
| W5.4 | BG-14 | Consent record for face photos, marketing opt-out, data export | the owner approves the scope first; then Pest and client updates | todo |
| W5.5 | BG-38 | Choose how to handle the Firebase advisories (BD-14 pins the version) | the owner picks an option; gates pass | todo |
| W5.7 | BG-53 | Reproduce whether a payload fault reaches the token-deletion branch, then narrow it | Pest: a payload error keeps the token; a bad token is still deleted | todo |
| W5.6 | release | Wave close ([tracker](index.md#wave-close)) | released, documented, reported | todo |

## Notes

- Reference: [push notifications](../architecture/push-notifications.md).
- Real delivery checks need RR-16 and RR-8.

## Log

No entries yet.
