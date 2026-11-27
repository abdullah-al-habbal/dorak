---
nodeid: docs.waves.wave-1
parentnode: docs.waves
childnodes: []
codeanchors:
  - backend/
  - frontend/
---

# Wave 1: realtime

Routes: [wave tracker](index.md) · [runbook](runbook.md) · [backlog](../backlog/index.md)

**State:** released 2026-11-27. Open: W1.4, waiting for [decision 1](wave-1-decisions.md); W1.8 and W1.9, gaps found after the release.

**Goal:** Live updates behave correctly, proved locally with a real Reverb server and a queue worker.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W1.1 | setup | Run Reverb and a queue worker locally against `dorak_test`; add the commands to the [runbook](runbook.md) | an authorised client receives a broadcast event, and a refused one does not | done |
| W1.1a | BG-51 | Let Reverb accept app connections (found in W1.1) | the refusal reproduced, then fixed, with a test | done |
| W1.2 | BG-45 | Reproduce sign-out then sign-in without restart; fix the remembered channels in `branch_operations.bloc.dart` and `realtime.client.dart` (`disconnectForLogout`) | a failing test first, then passing; `melos verify` passes | done |
| W1.3 | BG-48 | Dispatch `ChairStatusUpdated` once per real change (`ChairObserver`, `ToggleChairStatusAction`) | Pest: one event per change, none when unchanged | done |
| W1.4 | BG-46 | Decide and build what happens to subscriptions already open after suspension or disable; first check what Reverb supports | a connected, suspended branch stops receiving, shown locally; ask the owner first if the options change behaviour or cost | blocked: [decision 1](wave-1-decisions.md) |
| W1.5 | BG-43, 44, 46, 47 | Local live checks, including a seated stylist and the owner channel (the dev gaps) | each check recorded with its result; device-only checks stay open | done |
| W1.6 | RR-20 | Write up Reverb hosting options and costs. Set nothing up on dev | the owner has options and a recommendation | done: [decision 2](wave-1-decisions.md) |
| W1.7 | release | Wave close ([tracker](index.md#wave-close)) | released, documented, reported | done |
| W1.8 | BG-51 | Run the task executor's [security review](../../.claude/skills/monorepo-task-executor/references/security-review.md) on `allowed_origins` `['*']`, including connection limits and rate limiting | outcome recorded; a confirmed issue gets a backlog ID. Before Reverb is hosted | todo (proposed 2026-11-27) |
| W1.9 | BG-45 | Cover the sign-out wiring: both `app.dart` files call `endSession()` | a test fails if either sign-out path stops calling it; `melos verify` passes | todo (proposed 2026-11-27) |

## Notes

- Reverb notes for mobile: [reverb.md](../../frontend/mobile/docs/realtime/reverb.md).
- Channel rules: `backend/modules/Core/Routes/channels.php`.

## Log

| Date | Commit | Action and evidence |
|---|---|---|
| 2026-11-27 | `737ab9c6d` | BG-51 found and fixed: Reverb refused every connection (4009). 3 new tests failed with `InvalidOrigin` before the fix; Pest 3007 passed, Pint passed |
| 2026-11-27 | `bcc7a943b` | W1.1: local Reverb and worker. Branch, seated stylist and owner joined their channels; the owner was refused the branch channel (403); chair events arrived through the queue. BG-48 reproduced: a real change sent 2 events, saving the same status sent 1 |
| 2026-11-27 | `bcc7a943b` | with a seated stylist, the branch also joined the stylist's channel |
| 2026-11-27 | `a6c843a7c` | W1.3: the new tests failed first (2 events; 1 when unchanged); Pest 3009 passed, Pint passed; local Reverb: 1 event per change, none when unchanged |
| 2026-11-27 | `8a779b7b4` | W1.2: reproduced in the business app and also the stylist app (tests failed: no listener after sign-in; a load running at sign-out still joined). Fixed; `melos run verify` passed. BG-52 logged |
| 2026-11-27 | `e90ecbc13` | W1.5, local server side: the seated stylist joined the branch and floor plan channels and the branch joined the stylist's; the owner joined their own channel and was refused the branch's (by design). On suspension the branch channel delivered `brand.suspended` to the branch and the seated stylist (BG-43), and an owner received it on their own channel when their brand was suspended (BG-44; seen in a run that suspended another seeded brand). A chair change after suspension still reached both open floor plan subscriptions (BG-46). Refusal of new joins was not re-run locally (dev check and Pest cover it); app screens were not run on a device |
| 2026-11-27 | `7b3814481` | W1.6 and the BG-46 options written; nothing set up |
| 2026-11-27 | `7b3814481`, deploy `46032475790` | W1.7: backend and mobile gates passed (dashboard gates and Playwright not run); a short security note, not the full review (W1.8); Backend and Mobile CI passed, dev deployed without a reset, smoke test passed. Security note for BG-51: any origin may now open a socket; every broadcast channel is private and needs a bearer token to join |
