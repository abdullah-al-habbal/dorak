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

**State:** in progress since 2026-11-27.

**Goal:** Live updates behave correctly, proved locally with a real Reverb server and a queue worker.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W1.1 | setup | Run Reverb and a queue worker locally against `dorak_test`; add the commands to the [runbook](runbook.md) | an authorised client receives a broadcast event, and a refused one does not | done |
| W1.1a | BG-51 | Let Reverb accept app connections (found in W1.1) | the refusal reproduced, then fixed, with a test | done |
| W1.2 | BG-45 | Reproduce sign-out then sign-in without restart; fix the remembered channels in `branch_operations.bloc.dart` and `realtime.client.dart` (`disconnectForLogout`) | a failing test first, then passing; `melos verify` passes | done |
| W1.3 | BG-48 | Dispatch `ChairStatusUpdated` once per real change (`ChairObserver`, `ToggleChairStatusAction`) | Pest: one event per change, none when unchanged | done |
| W1.4 | BG-46 | Decide and build what happens to subscriptions already open after suspension or disable; first check what Reverb supports | a connected, suspended branch stops receiving, shown locally; ask the owner first if the options change behaviour or cost | todo |
| W1.5 | BG-43, 44, 46, 47 | Local live checks, including a seated stylist and the owner channel (the dev gaps) | each check recorded with its result; device-only checks stay open | todo |
| W1.6 | RR-20 | Write up Reverb hosting options and costs. Set nothing up on dev | the owner has options and a recommendation | todo |
| W1.7 | release | Wave close ([tracker](index.md#wave-close)) | released, documented, reported | todo |

## Notes

- Reverb notes for mobile: [reverb.md](../../frontend/mobile/docs/realtime/reverb.md).
- Channel rules: `backend/modules/Core/Routes/channels.php`.

## Log

| Date | Commit | Action and evidence |
|---|---|---|
| 2026-11-27 | `737ab9c6d` | BG-51 found and fixed: Reverb refused every connection (4009). 3 new tests failed with `InvalidOrigin` before the fix; Pest 3007 passed, Pint passed |
| 2026-11-27 | this commit | W1.1: local Reverb and worker. Branch, seated stylist and owner joined their channels; the owner was refused the branch channel (403); chair events arrived through the queue. BG-48 reproduced: a real change sent 2 events, saving the same status sent 1 |
| 2026-11-27 | `bcc7a943b` | check scripts committed; with a seated stylist, the branch also joined the stylist's channel |
| 2026-11-27 | BG-48 commit | W1.3: the new tests failed first (2 events; 1 when unchanged); Pest 3009 passed, Pint passed; local Reverb: 1 event per change, none when unchanged |
| 2026-11-27 | BG-45 commit | W1.2: reproduced in the business app and also the stylist app (tests failed: no listener after sign-in; a load running at sign-out still joined). Fixed; `melos run verify` passed. BG-52 logged |
