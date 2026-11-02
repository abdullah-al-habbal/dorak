---
nodeid: backend.11-backend-architecture.part-18
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 18 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-17.md) · [Next](11-backend-architecture-part-19.md)

**ClientInteraction Module:**
```php
Schema::create('client_discovery_preferences', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
    $table->string('style_period_preference');     // enum backed
    $table->string('maintenance_level_preference'); // enum backed
    $table->string('length_preference');            // enum backed
    $table->string('price_sensitivity');            // enum backed
    $table->integer('preferred_max_distance_km')->nullable();
    $table->timestamp('updated_at');
});

Schema::create('client_interaction_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
    $table->string('session_id', 64);
    $table->string('interaction_type');           // enum backed
    $table->string('subject_type');               // morphs type
    $table->string('subject_id');                 // morphs id (UUID)
    $table->json('context')->nullable();          // InteractionContextValueObject cast
    $table->timestamp('created_at')->index();
    $table->index(['client_id', 'session_id']);   // Session-based lookup index
});

Schema::create('client_favorites', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
    $table->string('favoritable_type');
    $table->string('favoritable_id');
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->unique(['client_id', 'favoritable_type', 'favoritable_id']);
});
```
