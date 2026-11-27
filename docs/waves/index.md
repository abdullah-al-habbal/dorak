---
nodeid: docs.waves
parentnode: docs.graph.part-3
childnodes:
  - docs.waves.runbook
  - docs.waves.wave-1-decisions
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

**Start here.** This folder tracks the fix programme the owner approved on 2026-11-26: find the open problems, rank them and fix them in waves, keeping the docs true. There are no real users or data yet.

## Now

| Field | Value |
|---|---|
| Active wave | [Wave 1: realtime](wave-1.md) |
| State | fixes released; waiting for the owner on W1.4 and Reverb hosting |
| Next task | Proposed, not yet approved: close [W1.8 and W1.9](wave-1.md#tasks), then [Wave 2](wave-2.md) at W2.1. W1.4 waits for decision 1 |
| Last release to dev | `7b3814481`, 2026-11-27 ([dev status](../deployment/dev-environment-status.md)) |
| Blocked on the owner | [Wave 1 decisions](wave-1-decisions.md): open subscriptions (W1.4) and where Reverb runs |

## Where we stand

As of **2026-11-27 17:16 UTC** (20:16, UTC+3). Update this section in place.

**Progress.** Wave 0 is done apart from leftovers (W6.2). Wave 1 is released with W1.4 open. Waves 2 to 6 haven't started.

**Delivered and deployed to dev** (`7b3814481`, no database reset):

| Change | Commit |
|---|---|
| Floor plan channel made private (BG-47); channels refused to non-operational branches (BG-46) | `35cdba0d4`, `f30964ca7` |
| Five Symfony security advisories cleared | `96d2f797e` |
| Reverb accepts app connections (BG-51). With the earlier list, which was unchanged since the file entered this repository on 2026-10-10, Reverb refused every normal origin and requests with none | `737ab9c6d` |
| One chair event per change (BG-48) | `a6c843a7c` |
| Business and stylist apps rejoin live updates after signing in again (BG-45; mobile code, no app release) | `8a779b7b4` |
| Local realtime check (`scripts/realtime-local-check.py`) | `bcc7a943b`, `e90ecbc13` |

**Check results** (each ran on the commit named, not all on one tree):

| Check | Result | Where and when |
|---|---|---|
| Backend Pest | 3009 passed (13534 assertions) | local, `a6c843a7c`, 2026-11-27 |
| Backend concurrency tests | 12 passed | local, `7b3814481`, 2026-11-27 |
| Pint, migration guard, `composer audit` | clean | local, 2026-11-27 |
| `melos run verify` | passed | local, BG-45 tree, 2026-11-27 |
| Dashboard lint, typecheck, Vitest (1243) | passed | local, `a712aca7f`, 2026-11-26 |
| Playwright | 487 passed | local, `a712aca7f`, 2026-11-26, before the Symfony update; **not run since** |
| `npm audit` | 4 high (BG-38), 10 moderate (BG-50) | 2026-11-26 |
| Backend CI, Mobile CI, deploy, smoke test | success | `7b3814481`, [dev status](../deployment/dev-environment-status.md) |

**Not proven.**

- The Flutter apps haven't received an event from a real server; the local check uses a Node test client.
- The BG-45 tests use a fake realtime client and call `endSession()` directly. No test covers the two `app.dart` files calling it at sign-out (W1.9).
- BG-51 loosens a setting and got only a short security note, not the review in the task executor's [security reference](../../.claude/skills/monorepo-task-executor/references/security-review.md) (W1.8). The config sets no connection limit by default and rate limiting is off by default.
- Nothing realtime works or is verified on dev (RR-20).

**Main open findings.** BG-46: open subscriptions keep receiving after suspension (reproduced). BG-52: the previous account's data stays in two cubits (source only). BG-53 (an FCM payload fault deleting device tokens) is fixed locally and not deployed. BG-38 and BG-50: dashboard advisories. BG-49: English replies to some Arabic requests. Queued broadcasts could wait about a minute with the documented dev cron ([decision 2](wave-1-decisions.md), not measured).

**Blockers.** None for Wave 2. See "Now" and "Owner actions".

**Repository.** The [documentation audit](../doc-audit/policy.md) runs alongside this programme. During it, push
only when the owner asks. Local `master` is ahead of `origin/master` `873d3edb9`. Besides documentation, the unpushed
commits hold the BG-53 fix (`b85a78a6d`), the backend pre-push hook (`087bb631d`) and module config without `env()`
defaults (`dfd936cad`); none is deployed. Backend Pest passed there on 2026-11-27 (3016 tests, 13541 assertions,
local, tree of `dfd936cad`); the concurrency tests weren't rerun.

## Board

| Wave | Goal | Items | State |
|---|---|---|---|
| [0](wave-0.md) | Release and discover | RR-1, RR-2, RR-7 | done 2026-11-26 (leftovers moved to Wave 6) |
| [1](wave-1.md) | Realtime | BG-45, BG-46, BG-48, BG-51, BG-52 (logged) | released; W1.4 open |
| [2](wave-2.md) | Sign-in and exposure | BG-28, 29, 30, 16, 4, 49, 50 | todo |
| [3](wave-3.md) | Data correctness | BG-27, 31 to 35, 18, BD-10, TS-8 | todo |
| [4](wave-4.md) | Booking experience | BG-19, 20, 21, 36, 12 | todo |
| [5](wave-5.md) | Notifications and privacy | BD-15, BG-13, 14, 37, 38, 53 | todo (BG-53 done early, local) |
| [6](wave-6.md) | Completion | FT, TD, TS, leftovers, old docs | todo; split into batches first |

## How to keep context small

1. Read this page, then **only the active wave file**. Open the [runbook](runbook.md) when you need a command.
2. For one task, read only its backlog row (`grep -n "BG-45" docs/backlog/index.md`), the files it names, and the guide of the subsystem you change.
3. Do not read finished wave files or Git history unless a task points there.
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
| RR-20 | Choose where Reverb runs: [decision 2](wave-1-decisions.md) |
| RR-16 | Firebase projects, keys and server values; then real push checks |
| BG-39 to BG-44 | Device checks of fixes already in the code (BG-43 and BG-44 also need live Reverb) |
| BD-5, BD-6, BD-13 | Open product decisions |
| RR-4, 5, 6, 9 to 13, 18 | Release-readiness items for before real users |

Not scheduled: BG-15 (accepted residuals). Out of scope until the owner says so: BD-2 ("Batch 2"), billing (NS-26, NS-27, WP-10).
