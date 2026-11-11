---
nodeid: backend.process.part-3
parentnode: backend.process
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 4 · [PROCESS — How CRESCENT, the Loop, and the Laravel Baseline Skills plug into the docs](process.md) · [Previous](process-part-2.md) · [Next](process-part-4.md)

## 5. How the baseline Laravel skills attach to the docs

The skills are the **engineering harness**. They are not generic Laravel tips — each one points back at the spec so the agent builds *this* product correctly. Index lives in `.claude/skills/laravel-baseline/README.md`; two are fully worked as exemplars.

| Skill | Enforces (from the docs) | Example binding |
|---|---|---|
| **module-architecture** | the aggregates in `06`; the structure in `11` | one module per aggregate; **no controller/service/repository** — only **Action → Handler → EloquentResolver** (single-method, `final`) |
| **type-safety** | the fixed value lists in `06` | every `status` / `gender_category` becomes a **backed enum**, not a magic string; the floor‑plan payload (`10`) becomes a typed object |
| **migrations** | entities `06` + cascade laws `04` | brand delete **cascades** branches/chairs (rule **A6**) but a barber **survives** — only the affiliation row is removed (rule **C5**); polymorphic columns for affiliations/services/settings (`06` §4) |
| **validations** | the If/Then rules `04` + edge cases `08` | reject a 2nd branch when the `multi_branch` flag is off (**A3/I2**); validate both `ar` **and** `en` on translatable fields (**J1/J2**) |
| **testing** | `04` + `08` + `07` | the **no‑double‑booking** concurrency test (**E1 / EC‑1**); tenancy‑isolation test (**H7**); a feature test per flow in `07` |
| **archive-file** | the loop's safety | snapshot a file/data into `archive/` before any destructive edit or reversible‑down migration, with a changelog line |

**The rule of thumb:** *a skill may only tell the agent to do something the docs already require.* If a skill wants new behavior, that behavior must first be written into the docs (via a CRESCENT PRD phase). This keeps the spec the single source of truth and prevents the skills from quietly inventing product decisions.

> **Recommended additions** the docs imply but your list didn't name: **rbac/authorization-policies** (encode `04` group H), **tenancy-isolation** (rule H7), **api-resources / backend-driven-ui** (the typed floor‑plan payload from `10`), and **concurrency-safety** (the booking guarantee E1). I've noted these in the baseline README so they're not forgotten.

---

## 6. The Kanban — the bridge from spec to execution

CRESCENT phase 5 produces the board; phase 6 consumes it; phase 7 closes it. The essential idea:

- A ticket is **small** (one loop pass should plausibly finish it).
- A ticket **carries its doc IDs** — the entity it touches (`06`), the rules it must satisfy (`04`), the flow it implements (`07`), the edge cases it must cover (`08`).
- A ticket's **acceptance criteria are generated from those IDs**, so QA (phase 7) is a mechanical check against the spec, not a judgement call.
- Columns map to the lifecycle: **Backlog → Ready → In Progress (the loop) → In Review/QA → Done**, plus **Blocked** (where 🟡 Open items wait for your decision).

---
