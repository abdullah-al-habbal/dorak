---
nodeid: docs.graph
parentnode: repo.root
childnodes:
  - docs.architecture
  - docs.decisions
  - docs.remediation
  - docs.graph.part-2
  - docs.graph.part-3
  - docs.graph.part-4
  - docs.graph.part-5
  - docs.graph.part-6
codeanchors:
  - docs/
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

# Documentation Graph

> Repository-wide documentation router. The graph root is the repository [`docs/repo-index.md`](repo-index.md).
> Follow the folder node for a subsystem, then choose a document leaf. All maintained Markdown documents in this repository are listed below.

## Graph roots

- [Repository rules](repo-index.md) — root-level orientation and subsystem entry points.
- [Backend](../backend/README.md) — Laravel service and product docs.
- [Dashboard](../frontend/dashboard/AGENTS.md) — Next.js application.
- [Mobile](../frontend/mobile/AGENTS.md) — Flutter workspace.

## Folder graph

```mermaid
graph TD
  root[docs/repo-index.md] --> graph[docs/index.md]
  graph --> repo[Repository-wide Markdown nodes]
  repo --> backend[backend/]
  repo --> dashboard[frontend/dashboard/]
  repo --> mobile[frontend/mobile/]
  repo --> project[docs/ and root guides]
```

## Document nodes

Entries are grouped by repository-relative folder. Every listed file is reachable from this index. Skill internals (`.claude/`), `references/` folders (linked from their parent guides), and native platform asset READMEs are intentionally not listed.

### `./`

- [Agents](../AGENTS.md)
- [Claude](../CLAUDE.md)
- [Readme](../README.md)
- [Index](repo-index.md)

### `backend/`

- [Agents](../backend/AGENTS.md)
- [Claude](../backend/CLAUDE.md)
- [Readme](../backend/README.md)

## Continued in

- [Part 2: backend/docs/](index-part-2.md)
- [Part 3: docs/](index-part-3.md)
- [Part 4: frontend/mobile/apps/client_app/docs/](index-part-4.md)
- [Part 5: frontend/mobile/docs/core/](index-part-5.md)
- [Part 6: frontend/mobile/docs/realtime/](index-part-6.md)
