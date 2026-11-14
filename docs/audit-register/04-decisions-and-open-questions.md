# 04 Decisions and open questions

## A. Approved on 2026-11-14 (requirements; not implemented; recorded in `decisions-required.md` on 2026-11-14)
| ID | Decision | Findings it drives |
|---|---|---|
| A | Suspended or disabled accounts: block all operational write actions while preserving permitted read-only access | F-01 |
| B | Global service categories: Platform Admin only | F-02 |
| C | Brand services: Owner manages brand-wide services; Manager restricted to authorized branch scope | F-07 |
| D | Payout approval: no mandatory dual approval; keep creation, approval and payment permissions separated | F-08 |
| E | Inactive languages: hide from new selections and reject in new preference updates | F-04 |
| F | Document approved decisions in `decisions-required.md` | done 2026-11-14 (entries at the end of that file); S7 now only updates behavior docs |

The earlier audit-phase restriction on editing `decisions-required.md` and the handover was lifted by the owner's request to sync
the docs; the A to F record and a pointer line in the handover were added on 2026-11-14.

## B. Resolved earlier (2026-11-14, commit `058087fc`)
- Q1: an admin deactivation blocks self-reactivation (`activation_logs.activated_by_id`). Code not written (WP-9).
- Q2: a separate public barber resource; old fields kept until both mobile apps ship. Code not written (WP-9).

## C. Interpretation points of decision A: resolved 2026-11-14 (owner accepted the recommended defaults)
| # | Point | Resolution |
|---|---|---|
| 1 | Disabled and Pending branches (D9 setup) | Stay writable for setup. Decision A applies to a Suspended brand or branch (and the actor states listed in [02](02-f01-account-state-matrix.md)). |
| 2 | Existing bookings under suspension | Cancel stays allowed; every other operational write is blocked. |
| 3 | Self-account and session writes; `POST /brands` and `resubmit` | Self-account and session writes (profile, password, email, notifications, settings, logout) always allowed. The owner of a suspended brand keeps `POST /brands` and `resubmit`; `resubmit` gets its own review inside S5. |
| 4 | Walk-in; Disabled barber refresh | Walk-in is blocked on a Suspended and on a Disabled branch. A Disabled barber is refused a session refresh (matches login). |

## D. Other owner answers, resolved 2026-11-14 (recommended defaults accepted)
| # | Question | Resolution | Slice |
|---|---|---|---|
| 5 | Existing tenant-created global categories; how tenants request new ones (F-02) | Keep the existing categories; from now on only the platform admin creates global categories; no tenant request flow | S8 |
| 6 | Barber lookup (F-10) | Uniform response for known and unknown people; the invite is resolved on the server | S13 |
| 7 | Remaining 71 Dashboard actions (F-06) | Convert them to policies, about 15 per slice | S14 (split S14a, S14b, ...) |
| 8 | jsdom and Testing Library for component tests | Allowed | WP-2 follow-up |

Assumption recorded for decision E (my reading, not the owner's wording, confirmed by default): users already on an inactive language keep
it until they change it; they are not migrated.

## E. Final decisions D-01 to D-04 and G-01 (approved and resolved 2026-11-14)
ID note: these are **audit decision IDs**. They are not the product decisions D1 to D13 in `decisions-required.md` (no hyphen), not the payout
decision D above, and G-01 is not one of the mobile-audit gaps G9 to G11.

| ID | Final decision | Replaces or resolves |
|---|---|---|
| D-01 | Require `X-Dashboard-Session` for every Dashboard token. Validate the claim and bind `sub` and `actor_type` to the authenticated actor. | F-05a and F-05c; the earlier "advisory header" contract; "whether to make the claim mandatory (recommended) and bind it" |
| D-02 | Keep previous access-token deletion out of refresh for now. | F-05b becomes an accepted residual (see below) |
| D-03 | Batch 2 stays outside scope until the owner defines it explicitly. | the open question "what did Batch 2 mean" |
| D-04 | WP-10 (billing NS-26, NS-27) stays deferred and outside scope. | confirms D6 and D7 for this program of work |
| G-01 | Create one local documentation-only Git commit for this decision and handover consolidation (`docs(audit): finalize implementation decisions and handover`). | the open question "commit of the register and handover" |

Notes:
- **D-02 residual:** with D-01 in force, an old access token is useless without a valid, unrevoked claim, and refresh revokes the previous claim. The
  remaining window is a holder of the old access token **and** the new claim of the same actor (the claim is bound to the actor, not to one token).
  Accepted for now; revisit only by a new owner decision (deleting the previous token on refresh needs a stored token id on the refresh row).
- **D-03 context (three uses of "Batch 2" exist, none is the owner's open item):** (a) the finished dashboard DRY refactor "Batch 2" whose shared primitives
  are listed in `.claude/skills/monorepo-task-executor/references/dashboard-shared-primitives.md` and named in the executor's `SKILL.md` heading;
  (b) a planned but undefined "Batch 2 mobile fix" in `decisions-required.md` (the mobile app signs the barber out on 403 `feature_not_enabled`, so the
  downgrade rule is not yet applied to barber-initiated affiliation paths); (c) the handover's question "define what Batch 2 meant". Under D-03 nothing
  from (b) or (c) is planned or implemented until the owner defines it. (a) is history and needs no action.
- **D-04:** the handover's WP-10 and `docs/next-steps` NS-26 (deferred after launch, D6) and NS-27 (closed, D7) are unchanged.

## E2. Not decisions, standing rules
- Pushing the 19 local commits: never without an explicit owner request (not an open question, a rule).
- Commits stay local; this folder and the handover are committed only by G-01.

## F. Conflicts and inconsistencies recorded
- A versus D8 and D9 (resolved in C).
- Earlier F-05 wording ('advisory', 'not revoked on refresh') and test evidence (`DashboardAuthApiTest.php:170`, `:198-200`) were imprecise: see T-01 in [10](10-prerequisites-t01-t04.md).
- Three meanings of 'Batch 2' (see E, D-03).
- Handover says a currency in-use guard exists; code has none (F-03).
- `frontend/web/dashboard` proxy comment contradicts `decisions-required.md:69` (F-11).
- `backend/CLAUDE.md` says "22 `*Policy` classes"; the repo has 27 (the handover marks the correction done in `fef8e27a`, recheck the number).
