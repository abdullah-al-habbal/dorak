<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Weekly opening hours per branch and dated overrides ("today's hours"),
     * Task 51. Times are wall-clock times compared in UTC like barber
     * schedules (Task 22).
     */
    public function up(): void
    {
        Schema::create('branch_opening_hours', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->time('opens_time')->nullable();
            $table->time('closes_time')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            // A weekday may carry several shifts (a split day), so this is a lookup index, not unique.
            $table->index(['branch_id', 'day_of_week'], 'branch_opening_hours_branch_day_index');
        });

        Schema::create('branch_hours_overrides', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->date('override_date');
            $table->time('opens_time')->nullable();
            $table->time('closes_time')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();

            $table->unique(['branch_id', 'override_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_hours_overrides');
        Schema::dropIfExists('branch_opening_hours');
    }
};
