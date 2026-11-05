<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('offered_services', function (Blueprint $table) {
            $table->foreignUuid('category_id')->nullable()->after('catalog_item_id')
                ->constrained('service_catalog_categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('offered_services', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
    }
};
