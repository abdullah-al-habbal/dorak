---
nodeid: backend.process.part-4
parentnode: backend.process
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 4 · [PROCESS — How CRESCENT, the Loop, and the Laravel Baseline Skills plug into the docs](process.md) · [Previous](process-part-3.md)

## 7. Where this physically lives (folder layout)

The three new layers sit **beside** `docs/`, never inside it — the spec stays clean and tool‑agnostic, the process/skills are the executable wrapper around it.

```
repo-root/
├── docs/                          # the product docs (the spec) — README + 01..11
│   ├── README.md ... 11-backend-architecture.md
├── modules/                       # the actual app code (see docs/11) — one module per aggregate
│   └── {Brand,Branch,Chair,Barber,Booking,...}/   # Action/Handler/EloquentResolver + lang
├── process/                       # CRESCENT process layer
│   ├── process.md                 # this file — the wiring diagram
└── .claude/
    └── skills/
        ├── crescent/
        │   └── SKILL.md           # the 7-phase orchestrator (state machine)
        └── laravel-baseline/      # the engineering harness
            ├── README.md              # index of baseline skills + recommended additions
            ├── module-architecture/SKILL.md  # worked — modules + Action/Handler/EloquentResolver (mirrors docs/11)
            ├── migrations/SKILL.md    # worked — schema + cascade laws
            ├── testing/SKILL.md       # worked — house-rules -> tests
            ├── type-safety/SKILL.md   # (to scaffold)
            ├── validations/SKILL.md   # (to scaffold)
            └── archive-file/SKILL.md  # (to scaffold)
```

> The CRESCENT *phase* skills (idea, research, prototype, prd, kanban, ralph-loop, qa) can each be their own skill under `.claude/skills/crescent-phases/` if you want the orchestrator to dispatch to separate files; for now the orchestrator `SKILL.md` describes all seven inline. Splitting them out is a small follow‑up.

---

## 8. What's yours to decide (so the loop knows its limits) 🟡

These shape how autonomous the engine is allowed to be. Decide them once and the orchestrator/skills can encode them:

1. **Autonomy per phase:** which CRESCENT phases run unattended vs. require your sign‑off (suggested gate points: after **PRD**, after **Kanban**, and at **QA**).
2. **Loop escalation N:** how many failed verifications before the loop stops and asks (suggested: 3).
3. **Prototype policy:** is every spike *always* archived/deleted after phase 3, or can a spike graduate into real code?
4. **Static‑analysis bar:** the target level for the type‑safety skill (e.g., the strictest level your team can sustain).
5. **QA automation:** is phase 7 fully automated (suite + checks), or a human review against `04`/`08`?
6. **Skill split:** keep the seven phases inline in the orchestrator, or break them into separate phase skills?

Everything in the docs flagged 🟡 (`02-prd.md` §8) remains **off‑limits to autonomous building** until you resolve it — the loop must route those to a human.

---

## 9. One‑paragraph summary

Your 11 docs are the **specification**. **CRESCENT** is the **sequence** that writes that spec down (Idea→Research→Prototype→PRD), turns it into work (Kanban), builds it (the Ralph **loop**), and checks it back against itself (QA). The **baseline Laravel skills** are the **standards** the loop must obey, and each one is anchored to a specific part of the spec — so house rules become tests, entities become schema, and flows become feature tests. The harness is everything the agent reads (docs + skills); the loop is the motor; CRESCENT is the gearbox that puts them in the right order.

**See also:** `.claude/skills/crescent/SKILL.md` (the runnable orchestrator), `.claude/skills/laravel-baseline/README.md` (the standards index).
