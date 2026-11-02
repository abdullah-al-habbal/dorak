---
nodeid: skills.backend.ralph-loop.references.parallelization-and-exit
parentnode: skills.backend.ralph-loop
childnodes: []
codeanchors:
  - backend/docs/
---

# Parallelization, exit, and anti-patterns

Referenced from [`SKILL.md`](../SKILL.md).

## Parallelization (optional)

Multiple AFK issues with no blocking dependency between them MAY be run in parallel, each in its own git worktree, by spawning Agent subagents with `isolation: "worktree"`. Each subagent runs one iteration against one issue and returns when its MR is open. The orchestrator then resumes the sequential loop with the remaining issues.

Constraints:

- **Do not parallelize HITL issues.**
- **Do not parallelize when fewer than three independent issues remain** — coordination overhead exceeds the gain.
- **Do not parallelize issues that touch the same plugin or the same Pulumi component** — even if the kanban says they don't block each other, the merge contention does.

## Exit

When `kanban.md` shows zero open issues, announce `[CRESCENT · Phase 6 · COMPLETE] — N issues merged. Exiting Phase 6 → entering Phase 7.` and dispatch the `qa-plan` skill.

## Anti-patterns

- **Do not** rewrite the kanban from scratch during a Ralph iteration. Phase 5 owns the kanban shape; Phase 6 only marks state.
- **Do not** open an MR that closes more than one issue unless they are tightly blocking-related and the merge was strictly required.
- **Do not** advance on a yellow/flaky CI. Re-run, diagnose, or park the issue back to Phase 5.
- **Do not** skip `phpcs` because "it's a tiny change." Project rules in `wp-cms/CLAUDE.md` forbid suppression.
