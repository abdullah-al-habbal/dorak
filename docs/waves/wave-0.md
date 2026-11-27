---
nodeid: docs.waves.wave-0
parentnode: docs.waves
childnodes: []
codeanchors:
  - backend/
  - frontend/
---

# Wave 0: release and discover

Routes: [wave tracker](index.md) · [runbook](runbook.md) · [backlog](../backlog/index.md)

**State:** done 2026-11-26.

**Goal:** Release the pending work and find out what is broken.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W0.1 | BG-47 | Make the floor plan channel private and release it | deployed to dev | done |
| W0.2 | RR-1 | Run backend, dashboard and Playwright gates | results recorded | done, except local `melos verify` |
| W0.3 | RR-2 | `npm audit` and a Dart dependency check | results recorded | done |
| W0.4 | audit | Fix small blockers (Symfony advisories) | `composer audit` clean | done |
| W0.5 | BG-46, BG-47 | Check channel approval live on dev | results and gaps recorded | done, with gaps |
| W0.6 | RR-7 | T13 close-out | all T13 steps pass | partly; rest in Wave 6 |

## Notes

Evidence is in [dev environment status](../deployment/dev-environment-status.md), Snapshots 11 and 12. Playwright ran before the Symfony update.

## Log

| Date | Commit or run | Action and evidence |
|---|---|---|
| 2026-11-26 | `35cdba0d4` | BG-47 fixed; Pest 3004 passed; Backend and Mobile CI passed |
| 2026-11-26 | `a712aca7f`, deploy `45834871043` | released to dev without a reset; delivery rule and decisions recorded |
| 2026-11-26 | Dashboard CI `45835784334` | passed; Playwright 487 passed locally; lint, typecheck and 1243 unit tests passed |
| 2026-11-26 | dev | suspend and reactivate check on channel approval passed; brand restored; no seated stylist, owner channel not tested |
| 2026-11-26 | `96d2f797e`, deploy `45848023311` | five Symfony advisories cleared; Pest 3004 passed; CI and smoke test passed |
| 2026-11-26 | `cda1ae68a` | findings recorded (BG-49, BG-50); RR-9 note corrected |
