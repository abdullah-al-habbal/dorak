<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Task 63: this project runs on MySQL only (CI, .env.example, and all
        // other migrations target it) — there is no pgvector/PostgreSQL
        // deployment. Embeddings are stored as a JSON array and similarity is
        // computed in PHP (Modules\Explore\Support\ExploreRanker). See
        // docs/decisions-required.md and the Recommendation module PRD §8.
        Schema::create('entity_embeddings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('entity_type');
            $table->uuid('entity_id');
            $table->json('embedding')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('computed_at')->nullable();
            $table->timestamps();

            $table->unique(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entity_embeddings');
    }
};
