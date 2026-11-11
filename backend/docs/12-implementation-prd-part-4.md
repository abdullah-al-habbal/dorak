---
nodeid: backend.12-implementation-prd.part-4
parentnode: backend.12-implementation-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 4 · [12 — Implementation PRD: From Current State to MVP](12-implementation-prd.md) · [Previous](12-implementation-prd-part-3.md)

## 5. Backfill: Test Coverage

Existing test files (13) cover only Client, Barber, Admin models + health check. The following tests are missing:

| Module | Test Type | What to Test | KANBAN ref |
|--------|-----------|-------------|------------|
| **Booking** | Feature + Unit | Concurrency (two simultaneous bookings on same chair+slot), cancel, list, show | BK-01 |
| **Explore** | Feature | Haversine radius search, barber list, branch detail | (implied) |
| **Review** | Feature | Submit review, list by branch, validation errors | (implied) |
| **Brand** | Feature | CRUD via the dashboard, unique slug, auto-create branch | TN-01 |
| **Chair** | Feature | CRUD, status transitions, floor-plan position | CH-01 |
| **BarberAffiliation** | Feature | Invite → accept/reject flow, multi-shop constraint | AF-01 |
| **Currency** | Feature | Exchange rate CRUD, conversion calculation | CU-01 |
| All modules | Static | `phpstan analyse` at max level | — |

Acceptance criteria:
- [ ] Each test file passes individually
- [ ] `phpunit` suite green (no regressions)
- [ ] Every house rule (04) has at least one corresponding test

---

## 6. Execution Order

```
Week 1: Track A gaps (5 missing admin pages) ✅ DONE
  └→ Verified: all 62 tests pass, pages follow 8-file template

Week 2: Track B High — Brand + Chair APIs
  └→ Verify: endpoint tests pass + flutter analyze clean (if frontend wired)

Week 3: Track B High — BarberAffiliation + Activation APIs
  └→ Verify: full API test suite green

Week 4: Backfill tests — Booking concurrency, Explore search, Review submission
  └→ Verify: phpunit green + every 04 house rule tested

Week 5: Track B Medium — JobPosting + Application APIs + Currency API
  └→ Verify: phpstan + phpunit green

Week 6: Frontend screens for new APIs + admin page gaps
  └→ Verify: dart analyze clean, full-stack smoke test
```

---

## 7. Risks

| Risk | Mitigation |
|------|-----------|
| ~~Admin page gaps block admin workflows~~ | ~~Track A first — 5 pages, 5h, unblocks everything~~ RESOLVED |
| New API endpoints break mobile contract | Follow existing response shapes (Explore/Booking patterns); write contract tests |
| Backfill tests reveal pre-existing bugs | Fix bugs before adding new endpoints; KANBAN Blocked column for anything found |
| Frontend ↔ Backend desync (API changes mid-build) | Freeze API contract per module before mobile starts; communicate via updated route files |
