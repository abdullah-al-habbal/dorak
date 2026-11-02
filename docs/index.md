---
nodeid: docs.graph
parentnode: repo.root
childnodes:
  - docs.architecture
  - docs.decisions
  - docs.remediation
  - docs.audit
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

> Repository-wide documentation router. The graph root is the repository [`docs/graph/repo-index.md`](graph/repo-index.md).
> Follow the folder node for a subsystem, then choose a document leaf. All maintained Markdown documents in this repository are listed below.

## Graph roots

- [Repository rules](graph/repo-index.md) — root-level orientation and subsystem entry points.
- [Backend](../backend/README.md) — Laravel service and product docs.
- [Dashboard](../frontend/dashboard/AGENTS.md) — Next.js application.
- [Mobile](../frontend/mobile/AGENTS.md) — Flutter workspace.

## Folder graph

```mermaid
graph TD
  root[docs/graph/repo-index.md] --> graph[docs/index.md]
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
- [Index](graph/repo-index.md)

### `backend/`

- [Agents](../backend/AGENTS.md)
- [Claude](../backend/CLAUDE.md)
- [Readme](../backend/README.md)

## Continued in

- [Part 2: backend/docs/](graph/index-part-2.md)
- [Part 3: docs/](graph/index-part-3.md)
- [Part 4: frontend/mobile/apps/client_app/docs/](graph/index-part-4.md)
- [Part 5: frontend/mobile/docs/core/](graph/index-part-5.md)
- [Part 6: frontend/mobile/docs/realtime/](graph/index-part-6.md)
