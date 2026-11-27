---
name: ralph-loop
description: Execute a kanban of GitLab issues against the codebase in a Ralph loop — sequentially by default, parallel for non-blocking AFK tickets via git worktrees. Each iteration picks the next issue, implements it, runs the project verification gate, commits, opens an MR, and only then advances. Use when the user wants to start execution, run the Ralph loop, work through the kanban AFK, or says "ralph this", "run the loop", "execute the tickets", "start phase 6".
nodeid: skills.backend.ralph-loop
parentnode: skills.backend
childnodes:
  - skills.backend.ralph-loop.references.parallelization-and-exit
  - skills.backend.ralph-loop.part-2
codeanchors:
  - backend/docs/
---

# Ralph Loop

> **Dorak:** [dorak-context.md](../crescent/dorak-context.md) and the root `AGENTS.md` override this skill. Its GitLab server, `glab` commands and
> Jira IDs don't apply here. Never push or open a pull request unless the owner asks.

A Ralph loop is **a deterministic execution loop** over a kanban of independently-grabbable issues. One issue per iteration. No iteration starts until the previous one has either merged or been explicitly parked. The loop is AFK-safe: a human can walk away and the agent produces coherent, reviewable work.

## Preconditions (refuse to start if any fail)

<preconditions>
1. `docs/<JIRA-ID>/<feature-slug>/kanban.md` exists and references at least one open GitLab issue at `gitlab.zadapps.info`.
2. `glab auth status -h gitlab.zadapps.info` returns authenticated.
3. The working tree is clean, OR the only diff is CRESCENT artifacts under `docs/<JIRA-ID>/<feature-slug>/`.
4. The current branch is a CRESCENT branch (`<type>/<JIRA-ID>-<feature-slug>`) OR the user has explicitly named the target branch.
</preconditions>

If any precondition fails, surface which one and stop. Do not "best-effort" past a missing precondition.

## The loop

```
while there is an unblocked, open issue on the kanban:
  reload kanban.md from disk
  pick next issue (lowest GitLab issue ID among unblocked & open)
  announce [CRESCENT · Phase 6 · Ralph · issue #N]
  implement the issue
  run the verification gate (see below)
  if verification fails: debug, re-verify, do NOT advance
  commit with the format below
  push, open MR via `glab mr create`, link the issue
  mark the issue 'in review' on kanban.md
  await merge (or, if user is AFK and auto-merge is on, advance)
  mark the issue 'closed' on kanban.md
end
```

**Reload `kanban.md` from disk every iteration.** Earlier iterations or the user may have edited it. Trusting an in-memory copy is the most common Ralph-loop failure mode.

## Continued in

- [Part 2: Verification gate per iteration](references/skill-part-2.md)
