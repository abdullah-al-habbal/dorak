<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Marketing\Enums\UniverseVisibilityEnum;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('page_id');
            $table->string('section_type');
            $table->json('title')->nullable();
            $table->json('subtitle')->nullable();
            $table->json('content');
            $table->string('media_url')->nullable();
            $table->integer('sort_order')->default(0);
            $table->string('universe_visibility')->default(UniverseVisibilityEnum::All->value);
            $table->timestamps();

            $table->foreign('page_id')->references('id')->on('marketing_pages')->cascadeOnDelete();
            $table->unique(['page_id', 'section_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
