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
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('branch_product_id')->constrained('branch_products')->cascadeOnDelete();
            $table->string('actor_type', ProductCatalogConstants::PRODUCT_CATALOG_ACTOR_TYPE_MAX_LENGTH);
            $table->uuid('actor_id')->nullable();
            $table->unsignedInteger('quantity_before')->nullable();
            $table->unsignedInteger('quantity_after')->nullable();
            $table->unsignedInteger('version_after');
            $table->string('reason', ProductCatalogConstants::PRODUCT_CATALOG_ADJUSTMENT_REASON_MAX_LENGTH)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['branch_product_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
