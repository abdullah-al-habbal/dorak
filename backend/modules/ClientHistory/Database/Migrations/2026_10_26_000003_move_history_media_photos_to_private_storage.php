<?php

declare(strict_types=1);

// @contract-migration: new application code writes photo_path (private disk) and leaves the legacy photo_url null.
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_service_history_media', function (Blueprint $table) {
            $table->string('photo_url')->nullable()->change();
            $table->string('photo_path')->nullable()->after('history_id');
        });
    }

    public function down(): void
    {
        Schema::table('client_service_history_media', function (Blueprint $table) {
            $table->dropColumn('photo_path');
        });
    }
};
