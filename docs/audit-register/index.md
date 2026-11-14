# Audit register index

Hard-saved record of everything found, decided, planned and still missing, as of **2026-11-14** at HEAD `ff7755c3`
(master, 19 local commits ahead of `origin/master`, nothing pushed). It is split by topic so no detail has to live in one file.
Status words: *confirmed* (full path traced), *trace-confirmed, not executed* (no runtime reproduction was done),
*decided* (owner approved), *open* (needs the owner).

| File | Contents | Use it when |
|---|---|---|
| [00 Start here](00-next-session-start.md) | read order, state, first action, owner questions, do-not list | you begin a new session |
| [01 Findings register](01-findings-register.md) | F-01 to F-11 with class, severity, status, evidence, fix shape | you need what is wrong and how sure we are |
| [02 F-01 account-state matrix](02-f01-account-state-matrix.md) | per-actor checks, session effects, all 50 tenant write routes (7 blocked, 5 partial, 29 open, 9 self-account), mobile coupling | planning or reviewing lifecycle enforcement |
| [03 F-05 session lifecycle](03-f05-session-lifecycle.md) | token, claim and refresh lifecycle, header-to-HTTP matrix, compatibility facts | planning or reviewing session hardening |
| [04 Decisions and open questions](04-decisions-and-open-questions.md) | approved A to F, resolved Q1 and Q2, six open interpretation points, open owner decisions | you need what the owner still has to decide |
| [05 Implementation plan](05-implementation-plan.md) | slices S1 to S14, designs, risks, rollback (proposal only) | starting work |
| [06 Test coverage gaps](06-test-coverage-gaps.md) | backend, Vitest, Playwright and mobile gaps | writing tests |
| [07 Missing features](07-missing-features.md) | WP-4, WP-6, WP-8, WP-9, WP-10, WP-11 items and features implied by the decisions | scoping features |
| [08 Technical debt](08-tech-debt.md) | backend, mobile, configuration and documentation inconsistencies | refactoring |
| [09 Environment and gates](09-environment-and-gates.md) | rules, commands, machine facts, repo state, audit limits | running anything |
| [10 Prerequisites T-01 to T-04](10-prerequisites-t01-t04.md) | mandatory verification steps before the slices they gate | before S1 and before every F-01 or shared-path slice |

## At a glance
- Findings: 11 (F-01 to F-11). Strongest: F-01 (operational writes open for a suspended brand or branch, manager accounts never lifecycle-checked, refresh only
  re-validates admins) and F-05 (claim header optional, not bound to the actor or the access token, previous access token survives refresh; execution-confirmed 2026-11-14, including old token plus the new claim of the same actor accepted, see [03](03-f05-session-lifecycle.md) section 5).
- Decisions final: A to F plus their answers, and **D-01 to D-04, G-01** ([04](04-decisions-and-open-questions.md) E): mandatory bound claim (D-01), previous
  token kept on refresh (D-02), Batch 2 excluded (D-03), billing / NS-27 deferred (D-04), one local documentation commit (G-01).
- Mandatory prerequisites T-01 to T-04 ([10](10-prerequisites-t01-t04.md)) gate the slices; the next session is implementation only and starts with T-01, then S1.
- Execution order and verified dependencies: [05](05-implementation-plan.md). No code implements any decision yet.
- Nothing in this folder changes code, tests or the database.

## Maintenance
Update the status column in file 01, the slice table in file 05 and the T-0x status in file 10 when a slice lands; add the commit SHA next to the finding.
This folder is linked from root `CLAUDE.md`, `AGENTS.md`, `README.md`, `docs/graph/index-part-3.md`, `docs/graph/repo-index.md`, `docs/decisions-required.md` and the handover.
