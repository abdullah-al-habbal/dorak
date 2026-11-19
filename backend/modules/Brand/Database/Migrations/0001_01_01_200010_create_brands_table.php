<?php

// modules/Brand/Database/Migrations/0001_01_01_000001_create_brands_table.php
declare(strict_types=1);

// @contract-migration: pre-release dev schema, an add_* fragment was folded into this create migration (backend/AGENTS.md dev migration rule)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Core\Enums\VenueUniverse;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_id')->constrained('clients')->cascadeOnDelete();
            $table->json('name');
            $table->string('slug', 160)->nullable()->unique();
            $table->json('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('base_currency_code', 10);
            $table->foreign('base_currency_code')->references('code')->on('currencies');
            $table->string('universe', 10)->default(VenueUniverse::Men->value);
            $table->string('status', 20)->default(BrandStatusEnum::Pending->value)->index();
            $table->text('status_reason')->nullable();
            $table->unsignedTinyInteger('submission_count')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brands');
    }
};
