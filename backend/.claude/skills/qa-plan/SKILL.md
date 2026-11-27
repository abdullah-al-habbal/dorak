---
name: qa-plan
description: Produce a human-runnable QA plan from completed CRESCENT work and feed any gaps back to the kanban as new GitLab issues. Re-enters the Ralph loop until QA produces zero gaps. Use when the user wants to QA finished features, generate a manual test plan, hand off to a human reviewer, or says "generate QA", "write the QA plan", "time for QA", "start phase 7".
nodeid: skills.backend.qa-plan
parentnode: skills.backend
childnodes:
  - skills.backend.qa-plan.part-2
codeanchors:
  - backend/docs/
---

# QA Plan

> **Dorak:** [dorak-context.md](../crescent/dorak-context.md) and the root `AGENTS.md` override this skill. Its GitLab server, `glab` commands and
> Jira IDs don't apply here. Never push or open a pull request unless the owner asks.

After the Ralph loop closes the last issue, the feature is **code-complete** — not **shipped**. The QA plan exists so a human can walk the feature end-to-end with confidence, and so anything the agent could not have verified is surfaced before the feature reaches users.

## Preconditions

Refuse to write the QA plan unless:

<preconditions>
1. `docs/<JIRA-ID>/<feature-slug>/kanban.md` shows zero open issues.
2. `docs/<JIRA-ID>/<feature-slug>/PRD.md` exists and has a non-empty `## User Stories` section.
3. The merged commits for this feature are queryable: `glab issue list --search "[<JIRA-ID>]" --state closed` returns the closed issues.
</preconditions>

## Process

1. **Re-read the PRD's user stories.** Each story is the seed for one QA case.
2. **Walk the closed kanban issues.** For each, derive the smallest manual action a human can take to confirm the user-visible behaviour. Skip issues whose behaviour is purely internal (refactors, build chores) — note them under "Not human-QA-able" so they aren't forgotten, but don't manufacture fake test cases.
3. **Identify gaps.** Anything in the PRD that no kanban issue covered → these become new GitLab issues and reopen Phase 5 / Phase 6.
4. **Write `docs/<JIRA-ID>/<feature-slug>/qa-plan.md`** using the template below.
5. **Create follow-up GitLab issues** via `glab issue create` for every gap, with title prefix `[<JIRA-ID>] QA gap:`.
6. **Announce exit.**

<qa-plan-template>
# QA Plan — <JIRA-ID> / <feature-slug>

**Generated:** <YYYY-MM-DD>
**PRD:** PRD.md
**Closed issues:** N

## How to run this QA

This plan is for a human. Read the PRD first. Then walk each case below in order. Mark each PASS / FAIL / BLOCKED. Anything FAIL or BLOCKED opens a follow-up GitLab issue using the template at the bottom.

Environment: the dev compose stack, started with `docker compose --env-file <project>.env watch`. Reset the DB between cases that mutate state.

## Continued in

- [Part 2: Cases](references/skill-part-2.md)
