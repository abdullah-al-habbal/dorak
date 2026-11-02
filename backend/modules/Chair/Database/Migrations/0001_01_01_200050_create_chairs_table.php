<?php

// modules/Chair/Database/Migrations/0001_01_01_000001_create_chairs_table.php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chairs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignUuid('barber_id')->nullable()->constrained('barbers')->nullOnDelete();
            $table->string('label')->nullable();
            $table->string('floor_zone')->nullable()->index();
            $table->json('layout_settings');
            $table->string('status');
            $table->timestamps();

            $table->unique(['branch_id', 'label']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chairs');
    }
};
