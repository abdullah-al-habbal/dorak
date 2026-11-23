<?php

declare(strict_types=1);

// @contract-migration: group_name becomes a translatable JSON column (TD-18); nothing but the admin tag form writes it, and the dev database is re-created with this release

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_catalog_item_tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->json('name');
            $table->string('slug')->unique();
            $table->json('group_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_catalog_item_tags');
    }
};
