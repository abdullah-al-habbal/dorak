---
nodeid: skills.backend.qa-plan.part-2
parentnode: skills.backend.qa-plan
childnodes: []
codeanchors:
  - backend/docs/
---

Part 2 of 2 · [QA Plan](../SKILL.md) · [Previous](../SKILL.md)

## Cases

### Case 1: <user story verbatim>

**Source:** PRD user story #X (+ kanban issue #N if directly covered)

**Steps:**
1. <observable step>
2. <observable step>

**Expected:** <user-visible outcome>

**Verifies:** <which acceptance criteria from which issue, if any>

### Case 2: ...

## Not human-QA-able

Internal-only changes that were merged but cannot be exercised through the UI / API. Listed for traceability:

- Issue #N: <one line>

## Gaps found by the agent

PRD requirements no kanban issue addressed. Each becomes a new GitLab issue:

- <one line per gap, with the GitLab issue URL the agent just opened>

## Follow-up issue template (for failed cases)

```
[<JIRA-ID>] QA gap: <what failed or was missing>

**Found during:** Phase 7 QA of <feature-slug>
**PRD requirement:** <quote the line from PRD.md>
**Repro:** <if FAIL — exact steps the human took>

## Acceptance criteria
- [ ] ...
```
</qa-plan-template>

## Loop semantics

If the QA plan produces zero gaps AND the human walks the plan with all PASS → the feature is shipped. The `crescent` orchestrator announces `[CRESCENT · COMPLETE]` and stops.

If gaps exist, the new GitLab issues land on `kanban.md` and the orchestrator re-enters **Phase 6** (Ralph loop). Then **Phase 7 runs again**. This 6↔7 loop is bounded only by reality — most features loop once, occasionally twice. If the loop reaches three iterations, stop and ask the user whether the PRD is still correct.

## Anti-patterns

- **Do not** write QA cases for code paths that no kanban issue produced. The PRD is the source of truth; gaps go to new issues, never to "the QA plan will catch it later."
- **Do not** auto-pass a case because the agent ran it. Cases are for humans by definition.
- **Do not** delete this plan when the feature ships. It is the receipt that the feature was QA'd, and it lives forever under `docs/<JIRA-ID>/<feature-slug>/`.
