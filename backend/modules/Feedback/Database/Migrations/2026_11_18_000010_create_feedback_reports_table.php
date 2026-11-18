<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feedback_reports', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('kind', 20);
            $table->string('status', 20)->default('new');
            $table->text('message');
            $table->string('contact_email')->nullable();

            // Source: where it came from.
            $table->string('app', 20);
            $table->string('platform', 20);
            $table->string('app_version', 32)->nullable();
            $table->string('locale', 5)->nullable();
            $table->string('screen', 64)->nullable();
            $table->string('workflow', 64)->nullable();
            $table->string('user_type', 20)->nullable();
            $table->uuid('user_id')->nullable();

            // Related business record, when the sender picked one. A plain pair, not a morph relation.
            $table->string('related_type', 20)->nullable();
            $table->string('related_id', 64)->nullable();

            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['kind', 'created_at']);
            $table->index(['app', 'platform']);
            $table->index(['user_type', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedback_reports');
    }
};
