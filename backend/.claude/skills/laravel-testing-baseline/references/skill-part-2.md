---
nodeid: skills.backend.laravel-testing-baseline.part-2
parentnode: skills.backend.laravel-testing-baseline
childnodes: []
codeanchors:
  - backend/modules/
  - backend/tests/
---

Part 2 of 2 · [Testing — baseline standard](../SKILL.md) · [Previous](../SKILL.md)

## Per-ticket checklist

- [ ] a test exists for **each** house rule the ticket cites
- [ ] a test exists for **each** edge case the ticket cites
- [ ] a feature test exists for the cited flow's happy path
- [ ] factories exist for every entity the ticket touches
- [ ] the relevant flagship test(s) above are present and passing
- [ ] full suite is green (no regression in unrelated areas)
- [ ] tests are deterministic (no order dependence, no real external calls)

## Boundaries

- **Don't** write tests for 🟡 *Open* behavior (`02` §8) — that work is Blocked until the human decides. Test only the ✅ *Decided* half (mirrors how tickets split at the 🟡 boundary).
- **Don't** assert implementation details the docs don't fix (e.g., whether the floor plan is stored vs computed — `06`/`10` leave that open).

## When this skill applies in the loop

Phase 6 **Test / Review / Verify**, and all of phase 7 **QA**. It defines the stopping conditions the loop checks before marking a ticket Done.

> Want the concrete Pest/PHPUnit patterns (the parallel-request concurrency harness, factory setups, the tenancy-isolation helper)? Ask and they'll be added as `references/patterns.md` in this skill.
