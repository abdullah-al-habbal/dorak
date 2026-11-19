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
        Schema::create('branch_products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUuid('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->unsignedBigInteger('price_amount_minor');
            $table->string('currency_code', ProductCatalogConstants::PRODUCT_CATALOG_CURRENCY_CODE_LENGTH);
            $table->foreign('currency_code')->references('code')->on('currencies');
            $table->boolean('is_published')->default(false);
            // NULL means the quantity is unknown; 0 means out of stock. Unsigned rejects negatives.
            $table->unsignedInteger('stock_quantity')->nullable();
            $table->timestamp('stock_confirmed_at')->nullable();
            $table->unsignedInteger('version')->default(ProductCatalogConstants::PRODUCT_CATALOG_INITIAL_VERSION);
            $table->timestamps();

            $table->unique(['product_id', 'branch_id']);
            $table->index(['branch_id', 'is_published']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_products');
    }
};
