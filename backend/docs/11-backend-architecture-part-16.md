---
nodeid: backend.11-backend-architecture.part-16
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 16 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-15.md) · [Next](11-backend-architecture-part-17.md)

### 13.8 Migration Summary (PostgreSQL + pgvector)

> All migrations live in their respective module's `Database/Migrations/`. Each module's `ServiceProvider` loads them. Every vector migration must call `Schema::ensureVectorExtensionExists()`.

**ServiceCatalog Module:**
```php
Schema::create('service_catalog_categories', function (Blueprint $table) {
    $table->id();
    $table->json('name');                     // Spatie Translatable
    $table->json('description')->nullable();   // Spatie Translatable
    $table->string('slug')->unique();
    $table->foreignId('parent_id')->nullable()->constrained('service_catalog_categories')->cascadeOnDelete();
    $table->boolean('is_active')->default(true);
    $table->unsignedSmallInteger('sort_order')->default(0);
    $table->timestamps();
    $table->softDeletes();
    $table->fullText(['name', 'description']);  // PostgreSQL GIN tsvector index
});

Schema::create('service_catalog_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained('service_catalog_categories')->cascadeOnDelete();
    $table->json('name');                     // Spatie Translatable
    $table->json('description')->nullable();   // Spatie Translatable
    $table->string('slug')->unique();
    $table->string('sku')->unique()->nullable();
    $table->json('price_range')->nullable();   // PriceRangeValueObject cast
    $table->string('maintenance_level')->nullable();
    $table->string('style_period_type')->nullable();
    $table->string('formality')->nullable();
    $table->json('face_shapes')->nullable();
    $table->json('hair_textures')->nullable();
    $table->json('metadata')->nullable();      // ServiceCatalogItemMetadataValueObject cast
    $table->boolean('is_active')->default(true);
    $table->unsignedSmallInteger('sort_order')->default(0);
    $table->timestamps();
    $table->softDeletes();
    $table->fullText(['name', 'description']);  // PostgreSQL GIN tsvector index
});
```

**ClientHistory Module:**
```php
Schema::create('client_service_histories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
    $table->foreignId('booking_id')->nullable()->constrained('bookings');
    $table->foreignId('barber_id')->constrained('barbers');
    $table->foreignId('branch_id')->nullable()->constrained('branches');
    $table->foreignId('offered_service_id')->nullable()->constrained('offered_services');
    $table->foreignId('catalog_item_id')->nullable()->constrained('service_catalog_items');
    $table->timestamp('performed_at');
    $table->tinyInteger('client_rating')->nullable();
    $table->text('client_notes')->nullable();
    $table->text('barber_notes')->nullable();
    $table->json('metadata')->nullable();   // ServiceHistoryMetadataValueObject cast
    $table->timestamps();
});
```
