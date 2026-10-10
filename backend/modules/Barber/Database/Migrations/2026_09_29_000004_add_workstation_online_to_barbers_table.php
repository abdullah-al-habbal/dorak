<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            $table->boolean('workstation_online')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('barbers', function (Blueprint $table): void {
            $table->dropColumn('workstation_online');
        });
    }
};
