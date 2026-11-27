---
codeanchors:
  - backend/modules/
---

Part 6 of 8 · [02 — Product Requirements Document (PRD)](02-prd.md) · [Previous](02-prd-part-5.md) · [Next](02-prd-part-7.md)

### 12.4 Domain Model — New Entities

> Naming Convention: Every entity uses PascalCase, ends with `Model`, and uses `HasUuids`. Translatable fields use `Spatie\Translatable\HasTranslations`. Full entity definitions in `06-entity-model-abstract.md`.

**15 new entities across 5 modules:**

| Module | Entities |
|--------|----------|
| **ServiceCatalog** | `ServiceCatalogCategoryModel`, `ServiceCatalogItemModel`, `ServiceCatalogItemTagModel`, `ServiceCatalogItemTagAssignmentModel`, `ServiceCatalogItemMediaModel` |
| **ClientHistory** | `ClientServiceHistoryModel`, `ClientServiceHistoryMediaModel` |
| **ClientFaceProfile** | `ClientFaceProfileModel`, `ClientFaceAnalysisResultModel` |
| **ClientInteraction** | `ClientInteractionLogModel`, `ClientFavoriteModel`, `ClientSavedFilterModel`, `ClientDiscoveryPreferenceModel` |
| **Recommendation** | `ClientPreferenceVectorModel`, `RecommendationEdgeModel` |

Key fields per entity are defined in `06-entity-model-abstract.md` §6 (Client Intelligence Entities).

### 12.5 Feature Requirements

#### Service Catalog & Taxonomy
| ID | Requirement | Priority |
|----|-------------|----------|
| SC-1 | Platform admins can CRUD categories and items via the dashboard. | ✅ Must |
| SC-2 | Items support bilingual name/description, default duration, typical price range, and a `metadata` JSON spec sheet. | ✅ Must |
| SC-3 | Items support multiple tags via `ServiceCatalogItemTagModel`. | ✅ Must |
| SC-4 | Items support media gallery via `ServiceCatalogItemMediaModel`. | 🟢 Should |
| SC-5 | Barbers and Brands can optionally link their `OfferedServiceModel` to a catalog item via nullable `catalog_item_id`. Free-text services remain valid. | ✅ Must |
| SC-6 | Clients can browse the catalog by category, tag, universe, and face-shape suitability. | 🟢 Should |

#### Client Service History
| ID | Requirement | Priority |
|----|-------------|----------|
| HIST-1 | When a booking status transitions to `completed`, the system auto-creates a history record within the same transaction. | ✅ Must |
| HIST-2 | Clients can view their history as a chronological timeline ("My Styles"). | ✅ Must |
| HIST-3 | Clients can upload before/after photos to a history entry. | 🟢 Should |
| HIST-4 | Clients can add private notes and a private rating to a history entry. | 🟢 Should |
| HIST-5 | Clients can initiate a rebooking directly from a history entry. | 🟢 Should |

#### Face Profile & AI Onboarding
| ID | Requirement | Priority |
|----|-------------|----------|
| FACE-1 | Clients can upload face photos (min 0, max 5). Exactly one may be marked `is_primary`. | 🟢 Should |
| FACE-2 | Uploaded photos are queued for asynchronous AI analysis. | 🟢 Should |
| FACE-3 | AI analysis results stored with version tracking and source attribution. | 🟢 Should |
| FACE-4 | System suggests catalog items based on `recommended_catalog_item_ids` from the latest analysis. | 🟢 Should |
| FACE-5 | Clients can dismiss a recommendation, recording negative feedback. | 🔭 Later |
