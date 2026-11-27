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

**State:** not started; waiting for the owner's "go".

**Goal:** Live updates behave correctly, proved locally with a real Reverb server and a queue worker.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W1.1 | setup | Run Reverb and a queue worker locally against `dorak_test`; add the commands to the [runbook](runbook.md) | an authorised client receives a broadcast event, and a refused one does not | todo |
| W1.2 | BG-45 | Reproduce sign-out then sign-in without restart; fix the remembered channels in `branch_operations.bloc.dart` and `realtime.client.dart` (`disconnectForLogout`) | a failing test first, then passing; `melos verify` passes | todo |
| W1.3 | BG-48 | Dispatch `ChairStatusUpdated` once per real change (`ChairObserver`, `ToggleChairStatusAction`) | Pest: one event per change, none when unchanged | todo |
| W1.4 | BG-46 | Decide and build what happens to subscriptions already open after suspension or disable; first check what Reverb supports | a connected, suspended branch stops receiving, shown locally; ask the owner first if the options change behaviour or cost | todo |
| W1.5 | BG-43, 44, 46, 47 | Local live checks, including a seated stylist and the owner channel (the dev gaps) | each check recorded with its result; device-only checks stay open | todo |
| W1.6 | RR-20 | Write up Reverb hosting options and costs. Set nothing up on dev | the owner has options and a recommendation | todo |
| W1.7 | release | Wave close ([tracker](index.md#wave-close)) | released, documented, reported | todo |

## Notes

- Reverb notes for mobile: [reverb.md](../../frontend/mobile/docs/realtime/reverb.md).
- Channel rules: `backend/modules/Core/Routes/channels.php`.
- BG-45 and BG-48 come from reading the source; neither has been reproduced.

## Log

No entries yet.
