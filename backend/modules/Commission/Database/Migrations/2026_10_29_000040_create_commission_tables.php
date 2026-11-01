<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_rules', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('scope', 16);
            $table->uuid('scope_id')->nullable();
            $table->string('type', 16);
            $table->unsignedBigInteger('value');
            $table->string('currency_code', 10)->nullable();
            $table->foreign('currency_code')->references('code')->on('currencies');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['scope', 'scope_id', 'is_active']);
        });

        Schema::create('commission_entries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->unique()->constrained('bookings')->cascadeOnDelete();
            $table->foreignUuid('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->uuid('branch_id')->nullable();
            $table->uuid('commission_rule_id')->nullable();
            $table->json('rule_snapshot');
            $table->unsignedBigInteger('base_amount_minor');
            $table->unsignedBigInteger('commission_amount_minor');
            $table->string('currency_code', 10);
            $table->foreign('currency_code')->references('code')->on('currencies');
            $table->foreignUuid('payout_id')->nullable()->constrained('payouts')->nullOnDelete();
            $table->timestamps();
            $table->index(['brand_id', 'payout_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_entries');
        Schema::dropIfExists('commission_rules');
    }
};
