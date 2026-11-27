---
nodeid: skills.backend.part-3
parentnode: skills.backend
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [Dorak Backend — AI Agent Skills](README.md) · [Previous](readme-part-2.md)

## Skills with supporting files

`laravel-native-abstractions` follows the official guidance of keeping `SKILL.md` short and
moving detail into files that load only when relevant:

```text
laravel-native-abstractions/
├── SKILL.md                    ← core rules, discovery workflow, anti-pattern table, navigation
├── references/                 ← one file per concern; load only what the task touches
│   ├── eloquent-relationships.md
│   ├── eloquent-persistence.md
│   ├── query-builder-and-sql.md
│   ├── cache-and-locks.md
│   ├── http-client.md
│   ├── requests-validation-authorization.md
│   ├── queues-events-scheduling.md
│   ├── concurrency-collections-helpers.md
│   ├── context-container-resources.md
│   └── testing.md
└── examples/
    └── dorak-refactors.md      ← real before/after cases from this repo
```

Apply the same structure to any skill that outgrows ~500 lines: keep `SKILL.md` as the core
rules plus a navigation table that says what each supporting file contains and when to load it.

Also read the project-level [AGENTS.md](../../AGENTS.md) for quick-start commands, config
notes and the build protocol.
