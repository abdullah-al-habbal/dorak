<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Enums\FloorPlanPreset;
use Modules\Core\Enums\VenueUniverse;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('brand_id')->constrained('brands')->cascadeOnDelete();
            $table->json('name');
            $table->json('description')->nullable();
            $table->json('address')->nullable();
            $table->json('tags')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->string('status')->default(BranchStatusEnum::Pending->value)->index();
            $table->string('floor_plan_preset')->default(FloorPlanPreset::Standard->value);
            $table->json('floor_plan_zones')->nullable();
            $table->json('floor_plan_canvas')->nullable();
            $table->json('floor_plan_decorations')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('rating_avg', 3, 2)->nullable()->index();
            $table->unsignedInteger('rating_count')->default(0);
            $table->string('universe', 16)->default(VenueUniverse::Unisex->value)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
