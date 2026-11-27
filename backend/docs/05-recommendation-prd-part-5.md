---
nodeid: backend.05-recommendation-prd.part-5
parentnode: backend.05-recommendation-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 5 of 5 · [PRD Phase 5 — Recommendation Module](05-recommendation-prd.md) · [Previous](05-recommendation-prd-part-4.md)

## 9. Test Plan

| Test | Type | What |
|------|------|------|
| RecommendEdgeTypeEnumTest | Unit | Each case has correct value |
| PreferenceVectorModelTest | Unit | CRUD, upsert, vector column |
| RecommendationEdgeModelTest | Unit | CRUD, morph relations, expiry |
| ExploreBranchesRequestTest | Unit | Validates all new filters |
| ExploreBarbersRequestTest | Unit | Validates all new filters |
| ExploreBranchesApiResponseContractTest | Existing | Extend for new response fields |
| ExploreBarbersApiResponseContractTest | Existing | Extend for new response fields |
| RecomputeClientVectorsCommandTest | Feature | Dry-run mode, verifies SQL |
| CompositeRankingTest | Feature | Ensure boosted results appear first |
| EmptyClientVectorFallbackTest | Feature | No vector → same results as today |

## 10. Risks

| Risk | Mitigation |
|------|-----------|
| `vector` extension not available on hosting | Use `float[]` + in-app cosine as fallback; check PG version (≥14 required) |
| OpenAI embedding API latency | Cache embeddings, batch nightly, degrade to geographic-only during API failures |
| Ranking formula feels arbitrary | Make weights configurable via `RecommendationFactorWeightsValueObject` + admin panel later |
| Explore response shape changes break mobile | Add new fields at end of response; `compatibility_score` is nullable + defaults null |
| No reviews/ratings data yet | `rating_min` filter gracefully ignored when no ratings table exists; no crash |

---

## 11. Cross-References

This document is the detailed Phase 5 PRD for the Recommendation Module. Related docs:

| Document | Section | What it covers |
|----------|---------|----------------|
| `02-prd.md` | §12 Client Intelligence Engine | Full PRD overview — 5 subsystems, gaps, phasing, house rules, naming reference |
| `04-house-rules.md` | §L Client Intelligence | All Client Intelligence house rules (CAT-1, HIST-1/2/3, FACE-1/2/3, INT-1, FAV-1, REC-1/2) |
| `06-entity-model-abstract.md` | §6–8 | Entity definitions, ER diagram, naming reference for all 15 new entities |
| `11-backend-architecture.md` | all | How the backend is laid out |
