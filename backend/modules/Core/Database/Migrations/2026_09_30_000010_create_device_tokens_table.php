<?php

declare(strict_types=1);

// @contract-migration: pre-release dev schema, locale, app_version, access_token_id and revoked_at were folded into this create migration (backend/AGENTS.md dev migration rule)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_tokens', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('user_type');
            $table->string('token')->unique();
            $table->string('platform_type', 20);
            $table->string('locale', 5)->nullable();
            $table->string('app_version', 32)->nullable();
            $table->unsignedBigInteger('access_token_id')->nullable()->index();
            $table->timestamp('last_used_at');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
            $table->index(['user_type', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_tokens');
    }
};
