<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_catalog_item_tag_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('item_id')->constrained('service_catalog_items')->cascadeOnDelete();
            $table->foreignUuid('tag_id')->constrained('service_catalog_item_tags')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['item_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_catalog_item_tag_assignments');
    }
};
