<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->json('floor_plan_canvas')->nullable()->after('floor_plan_zones');
            $table->json('floor_plan_decorations')->nullable()->after('floor_plan_canvas');
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn(['floor_plan_canvas', 'floor_plan_decorations']);
        });
    }
};
