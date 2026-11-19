<?php

// modules/JobPosting/Database/Migrations/0001_01_01_000002_create_job_applications_table.php
declare(strict_types=1);

// @contract-migration: pre-release dev schema, an add_* fragment was folded into this create migration (backend/AGENTS.md dev migration rule)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\JobPosting\Constants\JobPostingConstants;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('job_posting_id')->constrained('job_postings')->cascadeOnDelete();
            $table->foreignUuid('barber_id')->constrained('barbers')->cascadeOnDelete();
            $table->json('profile_snapshot');
            $table->string('status');
            $table->timestamps();

            $table->unique(['job_posting_id', 'barber_id'], JobPostingConstants::JOB_POSTING_UNIQUE_INDEX);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
