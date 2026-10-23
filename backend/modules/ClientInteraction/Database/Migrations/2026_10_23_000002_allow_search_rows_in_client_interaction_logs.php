<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // @contract-migration: widens interactable_* to nullable so a search (which has no single target) can be logged (Task 47); existing rows and old code are unaffected
    public function up(): void
    {
        Schema::table('client_interaction_logs', function (Blueprint $table): void {
            $table->string('interactable_type')->nullable()->change();
            $table->uuid('interactable_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('client_interaction_logs', function (Blueprint $table): void {
            $table->string('interactable_type')->nullable(false)->change();
            $table->uuid('interactable_id')->nullable(false)->change();
        });
    }
};
