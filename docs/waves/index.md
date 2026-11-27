---
nodeid: docs.waves
parentnode: docs.graph.part-3
childnodes:
  - docs.waves.runbook
  - docs.waves.wave-0
  - docs.waves.wave-1
  - docs.waves.wave-2
  - docs.waves.wave-3
  - docs.waves.wave-4
  - docs.waves.wave-5
  - docs.waves.wave-6
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Wave tracker

**Start here.** This folder tracks the fix programme the owner approved on 2026-11-26: what is next, what was done, and the evidence.

## Now

| Field | Value |
|---|---|
| Active wave | [Wave 1: realtime](wave-1.md) |
| State | not started; waiting for the owner's "go" |
| Next task | W1.1 |
| Last release to dev | `96d2f797e`, 2026-11-26 ([dev status](../deployment/dev-environment-status.md), Snapshot 12) |
| Blocked on the owner | nothing for Wave 1's local work; see "Owner actions" |

## Board

| Wave | Goal | Items | State |
|---|---|---|---|
| [0](wave-0.md) | Release and discover | RR-1, RR-2, RR-7 | done 2026-11-26 (leftovers moved to Wave 6) |
| [1](wave-1.md) | Realtime | BG-45, BG-48, BG-46 | **next** |
| [2](wave-2.md) | Sign-in and exposure | BG-28, 29, 30, 16, 4, 49, 50 | todo |
| [3](wave-3.md) | Data correctness | BG-27, 31 to 35, 18, BD-10, TS-8 | todo |
| [4](wave-4.md) | Booking experience | BG-19, 20, 21, 36, 12 | todo |
| [5](wave-5.md) | Notifications and privacy | BD-15, BG-13, 14, 37, 38 | todo |
| [6](wave-6.md) | Completion | FT, TD, TS, leftovers, old docs | todo; split into batches first |

## How to keep context small

1. Read this page, then **only the active wave file**. Open the [runbook](runbook.md) when you need a command.
2. For one task, read only its backlog row (`grep -n "BG-45" docs/backlog/index.md`), the files it names, and the guide of the subsystem you change.
3. Do not read finished wave files or the dated dev status history unless a task points there.
4. Start a new session for each wave. The opening prompt can be: "Read docs/waves/index.md and continue the active wave."
5. Update the tracker before ending a session, so the next one needs no chat history.

## Task loop

1. Set the task to `doing`.
2. Reproduce the problem first. If it does not reproduce, record that and stop the task.
3. Fix it with a test, run the gates for what you touched ([task executor](../../.claude/skills/monorepo-task-executor/SKILL.md)), and make one local commit per item.
4. Set the task to `done` or `blocked`, and add one log line: date, commit, evidence.
5. A new finding gets a backlog ID and a rank. It jumps the queue only if it is serious (security, data loss, or a broken main flow).

## Wave close

All gates, push to `master`, wait for CI, deploy to dev, smoke test, update the backlog and dev status, update this page, then report with ranked findings and wait for the owner before the next wave.

## Where things live

| What | Where |
|---|---|
| What an item is, and what is still open | [backlog](../backlog/index.md) (the source of truth; remove an item when it is done and verified) |
| Owner decisions | backlog, "Decisions in force" |
| Plan, task status and action log | this folder |
| What is deployed and what was probed | [dev environment status](../deployment/dev-environment-status.md) |

Status values: `todo`, `doing`, `done`, `blocked`.

## Owner actions (not tied to a wave)

| Item | Needed from the owner |
|---|---|
| RR-8 | Add the `schedule:run` and `queue:work` cron entries in hPanel ([CI/CD setup](../deployment/ci-cd-setup.md)) |
| RR-20 | Choose where Reverb runs, after the options and costs from W1.6 |
| RR-16, RR-19 | Firebase projects, keys and server values; then real push checks |
| BG-39 to BG-44 | Device checks of fixes already in the code (BG-43 and BG-44 also need live Reverb) |
| BD-5, BD-6, BD-13 | Open product decisions |
| RR-4, 5, 6, 9 to 13, 18 | Release-readiness items for before real users |

Not scheduled: BG-15 (accepted residuals). Out of scope until the owner says so: BD-2 ("Batch 2"), billing (NS-26, NS-27, WP-10).
