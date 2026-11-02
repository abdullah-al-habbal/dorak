---
nodeid: backend.feature-index.part-7
parentnode: backend.feature-index
childnodes: []
codeanchors:
  - backend/modules/
---

Part 7 of 8 · [Feature Index — Dorak Backend](feature-index.md) · [Previous](feature-index-part-6.md) · [Next](feature-index-part-8.md)

### PRD Phase 3 — ClientFaceProfile Module (Complete)
- `ClientFaceProfileModel` + `ClientFaceAnalysisResultModel` with migrations (photos up to 5, primary flag, async AI results)
- `FaceAnalysisFeaturesValueObject`, `RecommendedCatalogItemIdsValueObject`, `DetectedFaceShapeEnum`, `AnalysisSourceEnum`
- Casts: `FaceAnalysisFeaturesCast`, `RecommendedCatalogItemIdsCast`
- `UploadFaceProfilePhotoAction` [POST /api/v1/client/face-profile] (auth:client) — stores photo, sets primary flag, dispatches `AnalyzeFacePhotoJob`
- `ShowFaceProfileAction` [GET /api/v1/client/face-profile/{profile}] (auth:client) — returns the owned profile including `analysis_status`
- `GetFaceBasedRecommendationsAction` [GET /api/v1/client/face-profile/recommendations] (auth:client) — returns analysis results with recommended catalog items
- `AnalyzeFacePhotoJob` — async queue job for AI analysis (subclass Laravel job, placeholder pipeline)
- 7 contract tests in `ApiResponseContractTest`
- Registered in `bootstrap/providers.php`

### PRD Phase 4 — ClientInteraction Module (Complete)
- `ClientFavoriteModel` — polymorphic favorites (brand/branch/barber), toggle + list + delete APIs
- `ClientSavedFilterModel` — full CRUD (create/list/show/update/delete)
- `ClientDiscoveryPreferenceModel` — get/update discovery preferences
- `InteractionTypeEnum`, `FilterConfigurationValueObject`, `InteractionContextValueObject`
- 15 contract tests in `ApiResponseContractTest`
- `ClientInteractionServiceProvider` registered in `bootstrap/providers.php`

### PRD Phase 5 — Recommendation Module (Complete)
- `RecommendationEdgeModel` — polymorphic edges with `EdgeTypeEnum`, weight, context, expiry
- `ClientPreferenceVectorModel` — embedding storage with json fallback when pgvector absent
- `EntityEmbeddingModel` — polymorphic entity embeddings (branch/barber) for cosine similarity ranking
- `ClientRecommendationServiceProvider` — registers observers + recompute command + cron schedule
- `ClientFavoriteObserver` + `BookingCompletedObserver` — sync edges on events
- `RecomputeClientVectorsCommand` (`recommend:recompute-vectors`) — nightly batch, chunks 100, gathers signals, calls OpenAI embeddings; recomputes entity embeddings for branches and barbers
- New Explore filters: `catalog_item_ids[]`, `available_now`, `price_range[min/max]`, `rating_min`, `face_shape_compatible`
- Composite ranking: `geo*geographic + vector_similarity*α + edge_boost*β + face_match*γ` with `compatibility_score` + `rank` on response. Defaults: α=0.4, β=0.3, γ=0.1, geographic=0.2
- 8 contract tests extending explore endpoint assertions
- 34 dedicated feature tests across 6 modules (OfferedService, Ban, Client, ClientFaceProfile, ClientInteraction, ClientRecommendation)

### Onboarding
- `GetOnboardingConfigAction` [GET /api/v1/app/onboarding-config] — locale resolution `Accept-Language` header → `en`; season `?season=` → month auto-detect (`Season::fromMonth`). Locale must be sent via the `Accept-Language` header only — never in the URL path or query params. Returns `{hero_image_url, season, locale}`. Fallback chain: exact season → default row (season null) → first active row any locale → 404. No auth.
- `OnboardingConfigurationModel` — uuid pk, locale (2), season (nullable), hero_image_path, is_active, sort_order. Unique(locale, season)
- `Season` enum — spring/summer/autumn/winter + `fromMonth()`
- `OnboardingConfigSeeder` — config-driven `Config/seed_onboarding_configs.php` via `BulkSeedable`; triggered on deploy by `[seed-onboarding]` commit flag

---
