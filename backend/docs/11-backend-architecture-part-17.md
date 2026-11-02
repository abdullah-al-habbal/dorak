---
nodeid: backend.11-backend-architecture.part-17
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 17 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-16.md) · [Next](11-backend-architecture-part-18.md)

**ClientFaceProfile Module:**
```php
Schema::create('client_face_profiles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
    $table->string('image_url');
    $table->string('image_hash', 64);
    $table->boolean('is_primary')->default(false);
    $table->timestamp('uploaded_at');
    $table->timestamps();
});

Schema::create('client_face_analysis_results', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
    $table->foreignId('face_profile_id')->nullable()->constrained('client_face_profiles');
    $table->string('analysis_version');
    $table->string('analysis_source');        // enum backed
    $table->string('detected_face_shape');     // enum backed: oval/round/square/heart/diamond/oblong/triangle
    $table->decimal('confidence_ratio', 4, 2);
    $table->json('detected_features');         // FaceAnalysisFeaturesValueObject cast
    $table->json('recommended_catalog_item_ids'); // RecommendedCatalogItemIdsValueObject cast
    $table->timestamp('computed_at');
    $table->timestamps();
});
```
