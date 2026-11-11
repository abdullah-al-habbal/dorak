---
nodeid: backend.02-prd.part-8
parentnode: backend.02-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 8 of 8 · [02 — Product Requirements Document (PRD)](02-prd.md) · [Previous](02-prd-part-7.md)

### 12.7 Extended House Rules

- **CAT-1.** If a `ServiceCatalogItemModel` exists, then `OfferedServiceModel` **may** reference it via `catalog_item_id`, but is **not required** to. Free-text services remain valid.
- **CAT-2.** If a `ServiceCatalogItemModel` is deactivated (`is_active = false`), then existing `OfferedServiceModel` references remain valid, but new references are blocked.
- **HIST-1.** If a booking status transitions to `completed`, then a `ClientServiceHistoryModel` record **must** be auto-generated inside the same database transaction.
- **HIST-2.** If a client deletes their account, then `ClientServiceHistoryModel` records are **anonymized** (`client_id` set to `null`) but retained for aggregate recommendation integrity.
- **HIST-3.** A barber has **full read access** to a client's service history when that client has an active or upcoming booking with them. Read-only, scoped to booking context.
- **FACE-1.** If a client uploads a face photo, the photo is **never** publicly visible. Used solely for AI analysis and private recommendations.
- **FACE-2.** A client may upload **minimum 0, maximum 5** face photos. One may be designated `is_primary`.
- **FACE-3.** If a client deletes their account, face photos are purged after a **30-day grace period**.
- **INT-1.** If a client interacts with a discoverable entity, the interaction log **must** capture the active universe and applied filters in the `context` JSON.
- **FAV-1.** `ClientFavoriteModel` records are **strictly private**. No user can see another user's favorites, no public "favorite count".
- **REC-1.** If a recommendation edge weight is computed, it **must** include a `computed_at` timestamp and a `vector_version` so stale edges can be invalidated.
- **REC-2.** Recommendation vector and edge recomputation runs as a **nightly batch job**, not real-time.

### 12.8 Resolved Decisions

| # | Decision | Resolution | Rationale |
|---|----------|------------|-----------|
| **OD-1** | AI Model Ownership | **Hybrid:** Use a proven 3rd-party API if available (e.g., AWS Rekognition, Google Vision). If none exists, build a **Python microservice** (FastAPI). `ClientFaceAnalysisResultModel` stores final labels + confidence scores only. | Avoids vendor lock-in when no good vendor exists. |
| **OD-2** | Face Photo Limits | **Min 0, Max 5 per client.** One may be `is_primary`. Retained for account lifetime + 30-day grace. | Sufficient angles without storage bloat. |
| **OD-3** | Recommendation Compute | **Nightly batch job** for MVP. Processes past 24h of interaction logs. | Protects discovery API latency. Near-real-time is 🔭 Later. |
| **OD-4** | Favorite Privacy | **Strictly private.** No public counters, no social proof. | Syrian market privacy expectations. Social features are 🔭 Later. |
| **OD-5** | History Visibility | **Barber has full read access** to client history when client books with them. Read-only. | Improves personalization without violating privacy. |

### 12.9 Phasing

| Phase | Theme | Deliverables | Est. Duration |
|-------|-------|--------------|---------------|
| **Phase 1 — Catalog Foundation** | Canonical taxonomy | Migrations + Models for ServiceCatalog. Admin CRUD in the dashboard. Update `OfferedServiceModel` with optional `catalog_item_id`. API endpoints. | 1 week |
| **Phase 2 — History Layer** | Client service journal | Migrations + Models for ClientHistory. Auto-creation on booking completion. Client timeline API. Rebooking flow. | 1 week |
| **Phase 3 — Face Profile & AI** | Onboarding intelligence | Migrations + Models for ClientFaceProfile. Upload endpoints. Async analysis queue. Decision point: 3rd-party vs Python service. | 1.5 weeks |
| **Phase 4 — Interaction Graph** | Tracking & favorites | Migrations + Models for ClientInteraction. Instrument all discovery touchpoints. Favorite/unfavorite APIs. Saved filter CRUD. | 1 week |
| **Phase 5 — Intelligence Engine** | Recommendations | Migrations + Models for Recommendation. Nightly batch job. Composite ranking algorithm. A/B testing framework. | 1.5 weeks |

### 12.10 Naming Reference

| Concept | Model Name | Table Name |
|---------|-----------|------------|
| Canonical service category | `ServiceCatalogCategoryModel` | `service_catalog_categories` |
| Canonical service item | `ServiceCatalogItemModel` | `service_catalog_items` |
| Tag on catalog item | `ServiceCatalogItemTagModel` | `service_catalog_item_tags` |
| Tag assignment pivot | `ServiceCatalogItemTagAssignmentModel` | `service_catalog_item_tag_assignments` |
| Media on catalog item | `ServiceCatalogItemMediaModel` | `service_catalog_item_media` |
| Client's performed service record | `ClientServiceHistoryModel` | `client_service_histories` |
| Photo on history entry | `ClientServiceHistoryMediaModel` | `client_service_history_media` |
| Uploaded face photo | `ClientFaceProfileModel` | `client_face_profiles` |
| AI analysis result | `ClientFaceAnalysisResultModel` | `client_face_analysis_results` |
| Client's discovery preferences | `ClientDiscoveryPreferenceModel` | `client_discovery_preferences` |
| Interaction event log | `ClientInteractionLogModel` | `client_interaction_logs` |
| Favorite bookmark | `ClientFavoriteModel` | `client_favorites` |
| Saved filter config | `ClientSavedFilterModel` | `client_saved_filters` |
| Computed preference vector | `ClientPreferenceVectorModel` | `client_preference_vectors` |
| Recommendation graph edge | `RecommendationEdgeModel` | `recommendation_edges` |
