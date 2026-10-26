<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recommendation_edges', function (Blueprint $table): void {
            $table->timestamp('computed_at')->nullable();
            $table->string('vector_version')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('recommendation_edges', function (Blueprint $table): void {
            $table->dropColumn(['computed_at', 'vector_version']);
        });
    }
};
