<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_catalog_items', function (Blueprint $table): void {
            $table->unsignedSmallInteger('default_duration_minutes')->nullable();
        });

        Schema::table('service_catalog_categories', function (Blueprint $table): void {
            $table->string('universe', 16)->default('unisex')->index();
        });
    }

    public function down(): void
    {
        Schema::table('service_catalog_items', function (Blueprint $table): void {
            $table->dropColumn('default_duration_minutes');
        });

        Schema::table('service_catalog_categories', function (Blueprint $table): void {
            $table->dropIndex(['universe']);
            $table->dropColumn('universe');
        });
    }
};
