---
nodeid: skills.repo.monorepo-task-executor.references.audit-directive
parentnode: skills.repo.monorepo-task-executor
childnodes: []
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Audit directive (read before writing any code)

## Sources, in order
1. `README.md`, root `AGENTS.md`, root `CLAUDE.md`, `docs/index.md`.
2. The user's request and `docs/decisions-required.md`.
3. Nested guides for every subsystem touched (run `scripts/preflight.sh <n>` for the list), plus the app/package guide.
4. The code itself. Nested guides can be stale (one still calls `business_app` a stub); trust the code and record the drift.

## No guessing
- If the spec, a guide, or an assumption disagrees with the code, or a decision is open and the spec does not prescribe an answer, stop before coding and report it. Use AskUserQuestion when the choice is the user's.
- Resolve silently only when the spec text prescribes the answer, then record it in `docs/decisions-required.md`.
- Reconcile contradictory acceptance criteria against existing contracts (for example an error code spelled differently from the sibling endpoint) and say which won.

## Evidence-graded findings
When judging code, sub-agent reports, or static-analysis output:
- Cross-reference signatures, call sites, runtime behaviour, and a baseline run (`git stash -u`, rerun, `git stash pop`).
- Give each finding a confidence (confirmed / plausible / unverified) and severity (blocker / major / minor / nit).
- Drop what you cannot trace to code or reproduce. Never "fix" an unverified finding.

## Find every path to the behaviour
Before designing, grep for every entry point that performs the same change: routes, dashboard handlers, other modules, jobs, mobile repositories. Task 27 had three routes that set chair status; fixing two would have left a bypass. Build one shared service/resolver per rule and call it from all of them.
