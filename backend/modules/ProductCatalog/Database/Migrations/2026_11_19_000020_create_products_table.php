<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\ProductCatalog\Constants\ProductCatalogConstants;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->json('name');
            $table->json('description')->nullable();
            $table->string('category', ProductCatalogConstants::PRODUCT_CATALOG_CATEGORY_MAX_LENGTH)->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['brand_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
