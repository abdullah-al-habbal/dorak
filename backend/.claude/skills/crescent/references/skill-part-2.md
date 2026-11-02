---
nodeid: skills.backend.crescent.part-2
parentnode: skills.backend.crescent
childnodes: []
codeanchors:
  - backend/docs/
---

Part 2 of 2 · [CRESCENT — 7-Phase Feature Delivery State Machine](../SKILL.md) · [Previous](../SKILL.md)

## What this changes for users

One short paragraph.

## Open questions

A short list. These get answered during Research, Prototype, and PRD — not now.
</idea-template>

## Phase preconditions (the gate that prevents skipping)

Before dispatching any phase N ≥ 2, the orchestrator verifies — by reading the disk, not memory:

<preconditions>
- Phase 2 (Research):   IDEA.md exists at the canonical path
- Phase 3 (Prototype):  IDEA.md exists; research.md exists OR IDEA.md records `Research skipped: no externals`
- Phase 4 (PRD):        Phase 3 exit (`prototype/NOTES.md` answering the prototype's question) exists
- Phase 5 (Kanban):     PRD.md exists AND has a non-empty `## User Stories` section
- Phase 6 (Ralph Loop): kanban.md exists AND lists at least one GitLab issue ID at `gitlab.zadapps.info`
- Phase 7 (QA):         kanban.md shows zero open issues
</preconditions>

If a precondition fails, do NOT dispatch. State the missing artifact and return to the phase that produces it.

## Exit

When Phase 7 produces zero new gaps AND the human walks the QA plan to all-PASS, announce `[CRESCENT · COMPLETE] — <JIRA-ID>/<feature-slug>` and stop. Do not auto-restart.
