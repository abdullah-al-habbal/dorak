<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\ServiceCatalog\Enums\MediaTypeEnum;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_catalog_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuidMorphs('mediable');
            $table->string('type')->default(MediaTypeEnum::Image->value);
            $table->string('path');
            $table->string('alt')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_catalog_media');
    }
};
