<?php

// modules/Currency/Database/Migrations/0001_01_01_000001_create_currencies_table.php
declare(strict_types=1);

// @contract-migration: pre-release dev schema, an add_* fragment was folded into this create migration (backend/AGENTS.md dev migration rule)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 10)->unique();
            $table->json('name');
            $table->string('symbol', 10);
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
