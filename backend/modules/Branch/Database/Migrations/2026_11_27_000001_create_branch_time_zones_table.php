<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The time zone a branch's wall-clock times are written in (BG-55): opening
     * hours, date exceptions and its barbers' schedules. No row means the default
     * zone, so existing branches need no data change.
     */
    public function up(): void
    {
        Schema::create('branch_time_zones', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('branch_id')->unique()->constrained('branches')->cascadeOnDelete();
            $table->string('time_zone', 64);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_time_zones');
    }
};
