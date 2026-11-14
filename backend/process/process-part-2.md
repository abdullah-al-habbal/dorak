---
nodeid: backend.process.part-2
parentnode: backend.process
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 4 · [PROCESS — How CRESCENT, the Loop, and the Laravel Baseline Skills plug into the docs](process.md) · [Previous](process.md) · [Next](process-part-3.md)

## 2. The three wiring principles (the whole idea in three sentences)

If you remember nothing else, remember these. They are what makes the four layers cohere instead of drifting apart.

1. **House rules and edge cases become tests.** Every If/Then law in `04-house-rules.md` and every scenario in `08-edge-cases.md` is turned into at least one automated test. The spec is *executable* through the test suite.
2. **Entities become schema; flows become feature tests.** `06-entity-model-abstract.md` drives migrations, enums, and DTOs; `07-user-flows.md` drives the feature/integration tests. The plain‑English objects and flows have a deterministic code counterpart.
3. **Doc IDs travel on every ticket.** Each Kanban card names the exact doc sections it implements (rule IDs, entity, flow, edge cases). Acceptance criteria are *derived from* those IDs, so "done" is defined by the spec, not by vibes.

Everything below is just these three principles, expanded.

---

## 3. CRESCENT ↔ docs mapping (which phase touches which doc)

This is the operational heart. Each phase has clear **inputs** (docs it reads), **outputs** (docs/artifacts it writes), and which **baseline skills** it invokes. The agent dispatches deterministically by phase (the orchestrator lives in `.claude/skills/crescent/SKILL.md`).

| # | Phase | What it does | Reads | Writes / updates | Baseline skills |
|---|---|---|---|---|---|
| 1 | **Idea** | Frame one feature/bug/refactor in a sentence + intent | `01`, `02` | a short *idea note*; maybe a line in `01` | — |
| 2 | **Research** | De‑risk unknowns (libraries, approaches, local constraints) | `02`, `08`, web | *research notes*; **new edge cases → `08`** | — |
| 3 | **Prototype** | A throwaway spike to validate the riskiest assumption | `06`, `07` | a spike (then **archived**) | type‑safety (loose), archive‑file |
| 4 | **PRD (slice)** | Freeze the *feature‑sized* spec | `01`,`02`,`04`,`06`,`07` | a **feature‑PRD slice**; update `02`/`04`/`06`/`07` as needed | — |
| 5 | **Kanban** | Decompose the slice into small tickets | `02`,`04`,`07`,`08` | tickets with acceptance criteria | — |
| 6 | **Ralph Loop** | Build each ticket via the iteration engine | `06`,`04`,`07` + **all skills** | code, migrations, tests | **all baseline skills** |
| 7 | **QA** | Verify the built feature against the spec | `04`,`08`,`07`, acceptance | QA report; move tickets → Done | testing, validations |

**Reading direction:** phases 1–5 mostly **write the spec down** (feeding the docs); phase 6 **consumes** it; phase 7 **checks the result against** it. The docs are both the front *and* the back gate of CRESCENT.

---

## 4. The loop in detail (CRESCENT phase 6 — "Ralph")

Your requested engine — *Think → Research → Plan → Act → Test → Review → Verify → loop* — is the body of phase 6. It runs **per ticket**.

| Step | What happens | Bound to |
|---|---|---|
| **Think** | Read the ticket and the doc IDs it cites; load only the relevant skills | the ticket; `04`/`06`/`07` |
| **Research** | *Only if* an unknown remains (new API/lib). Usually skipped — phases 2 & 4 already did the heavy research | web, sparingly |
| **Plan** | List the files to touch; name the rules/entities/flows being implemented; pick applicable skills | the cited docs + skills |
| **Act** | Write code to the skills' standards (typed, validated, migrations match cascade rules); **archive any file before a destructive change** | type‑safety, migrations, validations, archive‑file |
| **Test** | Write/run the tests the ticket demands — one per cited house rule + edge case; red → green | testing skill; `04`, `08`, `07` |
| **Review** | Self‑review against each skill's checklist + the doc rules | all skills |
| **Verify** | Run the **full** suite; confirm acceptance criteria; confirm **no other house rule regressed** | `04`, `08`, acceptance |
| **Loop / Done** | Any check fails → back to Plan/Act. All pass → ticket **Done**, take the next | KANBAN board |

**Stopping conditions (all must hold to mark a ticket Done):**
- every acceptance criterion met,
- every cited house rule + edge case has a passing test,
- full suite green (no regressions elsewhere).

**Escalation guard (so the loop never spins forever):** if a ticket fails verification **N times** (you pick N, e.g. 3) or touches anything flagged 🟡 *Open* in `02-prd.md` §8, the loop **stops and asks a human**. This is deliberate — the loop is allowed to be autonomous only where the spec is *Decided* (✅), never where it's *Open* (🟡).

---
