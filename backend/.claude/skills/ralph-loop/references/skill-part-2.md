---
nodeid: skills.backend.ralph-loop.part-2
parentnode: skills.backend.ralph-loop
childnodes: []
codeanchors:
  - backend/docs/
---

Part 2 of 2 · [Ralph Loop](../SKILL.md) · [Previous](../SKILL.md)

## Verification gate per iteration

A green local run is required before opening the MR. CI green is required before advancing to the next issue.

Per `wp-cms/CLAUDE.md`:

- `./sites/site/vendor/bin/phpcs` (always)
- `./sites/site/vendor/bin/phpunit --bootstrap=tests/bootstrap.php --testsuite=unit tests/unit` (always)
- Integration suite if the touched plugin has integration tests
- Plus whatever the issue's acceptance criteria checklist demands

For monorepo work outside `wp-cms/`:

- Pulumi: `npx vitest` or `npx jest` per `pulumi/CLAUDE.md`
- AI engine: bun-based runner per `ai/engine/CLAUDE.md`
- Frontends: pnpm per `frontends/nextjs/CLAUDE.md`

## Commit format

```
<type>(<area>): <imperative summary, ≤72 chars>

<body — what changed and why, wrap at 80>

Closes <JIRA-ID>
Refs https://gitlab.zadapps.info/<group>/<repo>/-/issues/<N>
```

`<type>` ∈ `feat | fix | refactor | test | docs | chore`. `<area>` is the plugin or component touched (e.g. `zad-islamqa-core`, `pulumi/components/db`).

## MR format

`glab mr create` with:

- **Title:** `[<JIRA-ID>] <imperative summary>`
- **Description must include:**
  - A link to `docs/<JIRA-ID>/<feature-slug>/`
  - `Closes #N` for the GitLab issue
  - A reference to the Jira epic

## More

| Topic | Read |
| --- | --- |
| Parallel worktrees, loop exit, anti-patterns | [`references/parallelization-and-exit.md`](parallelization-and-exit.md) |
