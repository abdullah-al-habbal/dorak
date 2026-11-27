---
nodeid: docs.doc-audit.pilot
parentnode: docs.doc-audit.policy
childnodes: []
codeanchors:
  - docs/
---

# Pilot proposal: push notifications

**Status: proposed, not applied.** Rules: [policy](policy.md). Exact edits: [pilot.patch](pilot.patch)
(14 files, 180 lines added, 615 removed), built against the documents at `2170c26cc`.
Check with `git apply --check docs/doc-audit/pilot.patch`.

## Active writers (DA-3)

Checked 2026-11-27. The [session board](../sessions/index.md) was last changed on 2026-11-19. No registry row claims
the push documents or push backlog entries (BG-37, BG-38, BD-15, FT-2, FT-21, TD-20, RR-8, RR-16 to RR-19).
`dorak-69` claims other backlog rows, which the patch doesn't touch. One other session is live on this machine,
idle and not registered. Cloud sessions and other computers couldn't be listed. The tree was clean.

## Verdicts

| Document | Verdict | Result |
|---|---|---|
| `docs/architecture/push-notifications.md` | `fix` (rewrite) | contract, setup and decisions only; status, commit list, test runs and URLs removed |
| `docs/sessions/handover-push-phase-2.md` | `delete` | nothing left to extract except question P-2 |
| `docs/deployment/dev-environment-status.md` | `fix` (rewrite) | current state only, updated in place; snapshots stay in Git |
| `README.md`, push paragraph | `fix` | no status, no handover link |
| `docs/backlog/index.md`, push entries | `fix` | table below |

## Evidence

| Claim in the documents | Finding |
|---|---|
| Phase 2 backend isn't deployed (push doc, README, FT-21) | **False.** `gh run list` shows deploy run `46032475790` succeeded at `7b3814481`, which contains `aa144ecbe` and `4897540c0`. No `backend/` or `frontend/` change since. No live probe was run. |
| Only a bad-token `INVALID_ARGUMENT` deletes a token | **Differs from code.** `isInvalidTokenResponse` also deletes on any `FcmError` code `INVALID_ARGUMENT`. A search of backend tests found no mention of it. New row BG-53; code not changed. |
| FT-2: invites and applicants open `/operations` or `/home` | **Mostly false.** Both apps' `notification_location.entity.dart` route invites to affiliations and applications to jobs or applications. Left: `business_app` doesn't open the posting's applicants. Both application jobs send `job_posting_id`; `NotificationTarget` has no such field. |
| `PUBLIC_SITE_URL` isn't live (dev status configuration table) | **Contradicts** its own snapshot 3, which saw it live. |
| Dev status "next owner actions" | Redeploy and push are done according to later snapshots. The rest is in the backlog. |
| BG-12 lists the scheduled jobs | Incomplete: booking idempotency-key pruning is also scheduled. The list is removed; "no reminder job" holds. |
| BD-15: the sender ignores the push preference | **True.** Only Dashboard preference code names `allows_push_notifications`. Row unchanged. |
| TD-20: six jobs keep an unused `$locale` | **True.** Six constructors have it; no `$this->locale` use in those job folders. Unchanged. |
| Endpoints, revocation, payloads, flavors, dashboard files | Read in the source and consistent, apart from the rows above. Tests weren't run. |

## Handover: where its open points went

| Handover item (section 3 unless noted) | Now |
|---|---|
| 1 password change; 9 security review; 8 gates | recorded there as fixed or done; the behaviour is in the push doc |
| 2, 3, 5 | BG-37 |
| 4 push preference | BD-15 |
| 6 owner is a client | BG-37 and the push doc |
| 7 never run in a real browser | RR-16 (delivery) and BG-37 |
| section 4 open items | RR-16, TD-20, FT-21, RR-10, RR-13; NDK under RR-18 |
| "never push" rule | replaced by DA-1 |
| 10 the agent answered the reset prompt itself | question P-2 |

## Backlog edits

| Entry | Edit |
|---|---|
| BG-12 | drop the schedule list |
| BG-37, BD-14, BG-46, RR-1, RR-2 | repair section and snapshot references only |
| BG-53 | **new**: token deletion on `INVALID_ARGUMENT` |
| FT-2 | narrow to what is left |
| FT-21 (push) | only phases 3 and 4 |
| FT-21 (privacy) | renumber to FT-24, ending the duplicate ID |
| RR-16 | shorten; absorbs RR-19 |
| RR-17 | delete (done) |
| BG-38, BD-15, TD-20, RR-8, push decision line | unchanged. Advisories (BG-38) and server cron (RR-8) weren't rechecked |

## Other files the patch must touch

They link to removed content, so they change in the same commit: `AGENTS.md` and `CLAUDE.md` (one line each),
`docs/index.md`, `docs/graph/index-part-3.md`, `docs/architecture/architecture.md`, `docs/waves/index.md`,
`wave-0.md`, `wave-5.md`, and one registry row on the session board for this audit.

## Checked on the patched copy

No broken relative links in Markdown outside `.claude/`; anchors into the two rewritten documents and the Vercel
guide resolve; their code anchors exist; no duplicate backlog IDs found; no remaining link to the handover.

## Dropped on purpose (still in Git)

Commit lists, gate and test results, old snapshots and probe tables, and handover review notes. The BG-46 and BG-47
live-check results stay in the dev status. RR-1 and RR-2 point to the old snapshot by commit.

## Found outside the pilot (not edited)

- `backend/AGENTS.md` has its own dated "Current state" from 2026-11-23 (C1).
- BD-13 asks to set `PUBLIC_SITE_URL`, which was observed live on 2026-11-23 (C2).
- RR-2 is struck through as done but still listed (C2).

## Questions

| ID | Question | Recommendation |
|---|---|---|
| P-1 | BG-53 isn't in a wave. Add it? The patch only adds the backlog row. | Add to Wave 5 and verify first. If FCM does return that code for bad payloads, it loses data and should be ranked higher. |
| P-2 | The handover asked you to confirm that the agent could answer the `RESET` prompt after your written authorisation (2026-11-23). Keep as a rule? | Drop the history. The dev status keeps: reset only dev, only with your authorisation. |
| P-3 | Dev status becomes one current-state page, so wave closes update it in place instead of adding snapshots. Agreed? | Yes. |

## After approval

Apply the patch, rerun the checks, record verdicts in the [ledger](ledger.md), make one local commit, then report
what the pilot says about effort and about DA-2 (graph metadata). `pilot.md` and `pilot.patch` are deleted once applied.
