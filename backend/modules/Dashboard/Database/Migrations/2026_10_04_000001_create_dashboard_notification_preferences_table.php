<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_notification_preferences', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('actor_type');
            $table->uuid('actor_id');
            $table->boolean('allows_email_notifications')->default(true);
            $table->boolean('allows_push_notifications')->default(true);
            $table->boolean('allows_booking_notifications')->default(true);
            $table->boolean('allows_system_notifications')->default(true);
            $table->timestamps();
            $table->unique(['actor_type', 'actor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dashboard_notification_preferences');
    }
};
