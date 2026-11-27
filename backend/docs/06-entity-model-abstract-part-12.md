---
codeanchors:
  - backend/modules/
---

Part 12 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-11.md) · [Next](06-entity-model-abstract-part-13.md)

## 7. Client Intelligence Relationship Diagram

> Dashed lines indicate polymorphic relations.

```mermaid
erDiagram
    SERVICE_CATALOG_CATEGORY ||--o{ SERVICE_CATALOG_ITEM : "categorizes"
    SERVICE_CATALOG_ITEM ||--o{ SERVICE_CATALOG_ITEM_TAG_ASSIGNMENT : "tagged"
    SERVICE_CATALOG_ITEM_TAG ||--o{ SERVICE_CATALOG_ITEM_TAG_ASSIGNMENT : "assigned_to"
    SERVICE_CATALOG_ITEM ||--o{ SERVICE_CATALOG_ITEM_MEDIA : "displayed_by"
    SERVICE_CATALOG_ITEM ||--o{ OFFERED_SERVICE : "referenced_by"

    CLIENT ||--o{ CLIENT_SERVICE_HISTORY : "owns"
    BOOKING ||--o| CLIENT_SERVICE_HISTORY : "yields"
    OFFERED_SERVICE ||--o| CLIENT_SERVICE_HISTORY : "performed"
    SERVICE_CATALOG_ITEM ||--o| CLIENT_SERVICE_HISTORY : "classified_as"
    CLIENT_SERVICE_HISTORY ||--o{ CLIENT_SERVICE_HISTORY_MEDIA : "documented_by"

    CLIENT ||--o{ CLIENT_FACE_PROFILE : "uploads"
    CLIENT_FACE_PROFILE ||--o{ CLIENT_FACE_ANALYSIS_RESULT : "analyzed_by"
    SERVICE_CATALOG_ITEM ||..o{ CLIENT_FACE_ANALYSIS_RESULT : "recommended_in"

    CLIENT ||--o| CLIENT_DISCOVERY_PREFERENCE : "declares"
    CLIENT ||--o{ CLIENT_INTERACTION_LOG : "generates"
    CLIENT ||--o{ CLIENT_FAVORITE : "bookmarks"
    CLIENT ||--o{ CLIENT_SAVED_FILTER : "saves"

    CLIENT ||--o| CLIENT_PREFERENCE_VECTOR : "profiled_by"
    CLIENT ||..o{ RECOMMENDATION_EDGE : "source_or_target"
    SERVICE_CATALOG_ITEM ||..o{ RECOMMENDATION_EDGE : "source_or_target"
    BARBER ||..o{ RECOMMENDATION_EDGE : "source_or_target"
    BRANCH ||..o{ RECOMMENDATION_EDGE : "source_or_target"

    CLIENT_FAVORITE ||..o| BRANCH : "favoritable"
    CLIENT_FAVORITE ||..o| BARBER : "favoritable"
    CLIENT_FAVORITE ||..o| SERVICE_CATALOG_ITEM : "favoritable"
    CLIENT_FAVORITE ||..o| BRAND : "favoritable"
```

> This diagram extends the core relationship diagram in §3. The 15 new entities span 5 modules: ServiceCatalog, ClientHistory, ClientFaceProfile, ClientInteraction, Recommendation.

---
