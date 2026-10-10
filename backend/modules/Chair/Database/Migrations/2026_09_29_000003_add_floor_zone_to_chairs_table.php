<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chairs', function (Blueprint $table) {
            $table->string('floor_zone')->nullable()->after('label')->index();
        });
    }

    public function down(): void
    {
        Schema::table('chairs', function (Blueprint $table) {
            $table->dropIndex(['floor_zone']);
            $table->dropColumn('floor_zone');
        });
    }
};
