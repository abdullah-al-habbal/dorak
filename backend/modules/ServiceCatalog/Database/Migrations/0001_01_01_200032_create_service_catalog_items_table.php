<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_catalog_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('service_catalog_categories')->cascadeOnDelete();
            $table->json('name');
            $table->json('description')->nullable();
            $table->string('slug')->unique();
            $table->string('sku')->unique()->nullable();
            $table->json('price_range')->nullable();
            $table->unsignedSmallInteger('default_duration_minutes')->nullable();
            $table->string('maintenance_level')->nullable();
            $table->string('style_period_type')->nullable();
            $table->string('formality_level')->nullable();
            $table->json('face_shapes')->nullable();
            $table->json('hair_textures')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_catalog_items');
    }
};
