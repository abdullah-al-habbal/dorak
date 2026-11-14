<?php

// modules/JobPosting/Database/Migrations/2026_11_12_000001_create_job_application_duplicate_archives_table.php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\JobPosting\Constants\JobPostingConstants;

/**
 * Expand step: a new, empty table. It keeps every job application that is removed as a duplicate (full row,
 * including `profile_snapshot`) before the unique (posting, barber) index is added. No foreign keys on purpose:
 * the archive must outlive the posting or barber it refers to.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create(JobPostingConstants::JOB_POSTING_DUPLICATE_ARCHIVE_TABLE, function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->uuid('original_id')->unique();
            $table->uuid('kept_application_id')->index();
            $table->uuid('job_posting_id')->index();
            $table->uuid('barber_id')->index();
            $table->string('status');
            $table->json('profile_snapshot');
            $table->timestamp('original_created_at')->nullable();
            $table->timestamp('original_updated_at')->nullable();
            $table->timestamp('archived_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(JobPostingConstants::JOB_POSTING_DUPLICATE_ARCHIVE_TABLE);
    }
};
