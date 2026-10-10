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
            $table->string('floor_plan_preset')->default('standard')->after('status');
            $table->json('floor_plan_zones')->nullable()->after('floor_plan_preset');
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn(['floor_plan_preset', 'floor_plan_zones']);
        });
    }
};
