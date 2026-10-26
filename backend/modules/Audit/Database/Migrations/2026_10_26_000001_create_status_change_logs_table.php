<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('status_change_logs', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuidMorphs('subject');
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->nullableUuidMorphs('actor');
            $table->string('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['subject_type', 'subject_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status_change_logs');
    }
};
