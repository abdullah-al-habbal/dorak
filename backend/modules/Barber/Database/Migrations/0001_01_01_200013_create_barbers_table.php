<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Core\Enums\VenueUniverse;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barbers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->json('name');
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->boolean('has_login')->default(true);
            $table->rememberToken();
            $table->boolean('is_freelancer')->default(false);
            $table->string('status')->default(BarberStatusEnum::Pending->value);
            $table->boolean('is_workstation_online')->default(false);
            $table->uuid('client_id')->nullable()->index();
            $table->foreignUuid('managed_by_branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('travel_radius', 5, 2)->nullable();
            $table->json('bio')->nullable();
            $table->decimal('rating_avg', 3, 2)->nullable()->index();
            $table->unsignedInteger('rating_count')->default(0);
            $table->string('universe', 16)->default(VenueUniverse::Unisex->value)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barbers');
    }
};
