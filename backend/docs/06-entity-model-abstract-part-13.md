---
nodeid: backend.06-entity-model-abstract.part-13
parentnode: backend.06-entity-model-abstract
childnodes: []
codeanchors:
  - backend/modules/
---

Part 13 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-12.md)

## 8. Naming Reference (Client Intelligence)

| Concept | Model Name | Table Name | Notes |
|---------|-----------|------------|-------|
| Canonical service category | `ServiceCatalogCategoryModel` | `service_catalog_categories` | Universe-scoped |
| Canonical service item | `ServiceCatalogItemModel` | `service_catalog_items` | JSON metadata for specs |
| Tag on catalog item | `ServiceCatalogItemTagModel` | `service_catalog_item_tags` | Translatable |
| Tag assignment pivot | `ServiceCatalogItemTagAssignmentModel` | `service_catalog_item_tag_assignments` | |
| Media on catalog item | `ServiceCatalogItemMediaModel` | `service_catalog_item_media` | Polymorphic-ready |
| Client's performed service record | `ClientServiceHistoryModel` | `client_service_histories` | Auto-created on completion |
| Photo on history entry | `ClientServiceHistoryMediaModel` | `client_service_history_media` | before/after/reference |
| Uploaded face photo | `ClientFaceProfileModel` | `client_face_profiles` | Max 5 per client |
| AI analysis result | `ClientFaceAnalysisResultModel` | `client_face_analysis_results` | Stores labels, not raw tensors |
| Client's discovery preferences | `ClientDiscoveryPreferenceModel` | `client_discovery_preferences` | Onboarding/profile |
| Interaction event log | `ClientInteractionLogModel` | `client_interaction_logs` | Immutable |
| Favorite bookmark | `ClientFavoriteModel` | `client_favorites` | Polymorphic, private |
| Saved filter config | `ClientSavedFilterModel` | `client_saved_filters` | Named searches |
| Computed preference vector | `ClientPreferenceVectorModel` | `client_preference_vectors` | Nightly recomputed |
| Recommendation graph edge | `RecommendationEdgeModel` | `recommendation_edges` | Polymorphic source/target |
