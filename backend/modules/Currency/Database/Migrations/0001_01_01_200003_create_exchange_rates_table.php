<?php

// modules/Currency/Database/Migrations/0001_01_01_000002_create_exchange_rates_table.php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('from_currency_code', 10);
            $table->foreign('from_currency_code')->references('code')->on('currencies')->cascadeOnDelete();
            $table->string('to_currency_code', 10);
            $table->foreign('to_currency_code')->references('code')->on('currencies')->cascadeOnDelete();
            $table->decimal('rate', 20, 6);
            $table->timestamp('effective_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
