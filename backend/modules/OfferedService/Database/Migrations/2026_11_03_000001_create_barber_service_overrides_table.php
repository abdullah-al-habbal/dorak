<?php

// modules/OfferedService/Database/Migrations/2026_11_03_000001_create_barber_service_overrides_table.php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_service_overrides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('offered_service_id')->constrained('offered_services')->cascadeOnDelete();
            $table->foreignUuid('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->unsignedBigInteger('price_amount_minor')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->timestamps();

            $table->unique(['offered_service_id', 'brand_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_service_overrides');
    }
};
