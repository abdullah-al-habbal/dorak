---
nodeid: backend.06-entity-model-abstract.part-9
parentnode: backend.06-entity-model-abstract
childnodes: []
codeanchors:
  - backend/modules/
---

Part 9 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-8.md) · [Next](06-entity-model-abstract-part-10.md)

### 6.2 Client Service History

**ClientServiceHistoryModel** — *The durable journal of what was performed.*
- `id` (UUID)
- `client_id` (FK → ClientModel)
- `booking_id` (FK → BookingModel, nullable — for walk-ins without prior booking)
- `barber_id` (FK → BarberModel)
- `branch_id` (FK → BranchModel, nullable for at-home)
- `offered_service_id` (FK → OfferedServiceModel, nullable)
- `catalog_item_id` (FK → ServiceCatalogItemModel, nullable — the canonical style performed)
- `performed_at` (datetime)
- `client_rating` (integer, 1–5, nullable — private rating for the specific service)
- `client_notes` (text, nullable — e.g., "shorter on sides next time")
- `barber_notes` (text, nullable — e.g., "used #2 guard, textured top")
- `metadata` (JSON) — cast to `ServiceHistoryMetadataValueObject`: products used, length settings, color codes
- `created_at` / `updated_at`

**ClientServiceHistoryMediaModel** — *Before/after photos linked to a history entry.*
- `id` (UUID)
- `client_service_history_id` (FK)
- `image_path` (string; the API serves it as a signed `photo_url`)
- `photo_type` (enum: `before` / `after` / `reference`)
- `uploaded_at` (datetime)

### 6.3 Client Face Profile & AI Onboarding

**ClientFaceProfileModel** — *A face photo uploaded by the client.*
- `id` (UUID)
- `client_id` (FK → ClientModel)
- `image_url` (string)
- `image_hash` (string, 64 chars — for deduplication)
- `is_primary` (boolean)
- `uploaded_at` (datetime)

**ClientFaceAnalysisResultModel** — *Output of the AI model.*
- `id` (UUID)
- `client_id` (FK)
- `face_profile_id` (FK → ClientFaceProfileModel, nullable — which photo was analyzed)
- `analysis_version` (string) — model version or API version
- `analysis_source` (enum: `third_party_api` / `internal_python_service`)
- `detected_face_shape` (enum: `oval`, `round`, `square`, `heart`, `diamond`, `oblong`, `triangle`)
- `confidence_ratio` (decimal, 0.00–1.00)
- `detected_features` (JSON) — cast to `FaceAnalysisFeaturesValueObject`
- `recommended_catalog_item_ids` (JSON array of UUIDs) — cast to `RecommendedCatalogItemIdsValueObject`
- `computed_at` (datetime)
