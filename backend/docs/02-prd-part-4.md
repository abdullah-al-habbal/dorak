---
nodeid: backend.02-prd.part-4
parentnode: backend.02-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 8 · [02 — Product Requirements Document (PRD)](02-prd.md) · [Previous](02-prd-part-3.md) · [Next](02-prd-part-5.md)

## 9. Non‑functional requirements (NFRs)

- **No double‑booking (hard guarantee).** Concurrent attempts on the same chair + slot must resolve so that **exactly one** succeeds; the loser sees a clear "this seat was just taken." (Implementation note for engineering — *not part of these docs* — is row‑locking inside a transaction; captured here only as a **requirement**.)
- **Bilingual everywhere** with graceful fallback (never show an empty label).
- **Multi‑tenant isolation:** one brand can never see or affect another brand's data.
- **Stable identifiers:** entities use non‑guessable identifiers suitable for public URLs/APIs. (Task 14: the service-catalog tables were migrated from bigint to UUID ids to meet this.)
- **Performance for discovery:** proximity search must feel instant on a typical phone.
- **Auditability of affiliations & bookings:** status changes (invite → active → terminated; booked → completed/cancelled) are traceable.
- **Reasonable resilience** for MVP — but **offline mode is explicitly out** for now (🔭).

---

## 10. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Owners resist any subscription | Low supply | Generous **free** tier; charge only for clear‑value gates (multi‑branch, jobs) |
| Currency swings make prices look wrong | Lost trust | **Base currency + live exchange**, optional dual display; prices never hard‑coded |
| Double‑booking embarrasses shops | Churn | Hard structural guarantee (NFR §9) |
| Scope creep from "Later" items | Missed launch | Items quarantined as 🔭 in `01` and `02`; revisit only post‑MVP |
| Cold‑start (empty marketplace) | No demand | Lead with the **management engine**; the marketplace is a byproduct that fills as shops onboard |
| Barber data lost when leaving a shop | Pro distrust | **Standalone barber** invariant; affiliations are links, not ownership |
| Unisex shops confuse the universe filter | Bad UX | Unisex appears in both universes; the unified plan uses designated zones. |

---

## 11. Glossary & models

- Vocabulary: `05-domain-glossary.md`
- Entities (plain English) + build priority order + abstract relationships: `06-entity-model-abstract.md`
- Flows: `07-user-flows.md` · Edge cases: `08-edge-cases.md`
- System shape (C4): `09-c4-context.md`, `10-c4-containers.md`
- Backend architecture (C4 Level 3): `11-backend-architecture.md`
- Implementation gaps: `12-implementation-prd.md`
- Recommendation module (Phase 5): `05-recommendation-prd.md`

---
