<?php

// modules/JobPosting/Database/Migrations/2026_11_13_000001_add_unique_barber_per_posting_to_job_applications.php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\JobPosting\Support\DuplicateApplicationScanner;

/**
 * One application per barber per posting, enforced by the database (Batch 1, WP-1).
 *
 * Existing data is checked first and is never modified: when duplicates exist the migration stops with
 * the affected pairs, and an operator decides which application to keep (delete the others, or merge their
 * status by hand) before running it again. Both columns are NOT NULL and the table has no soft deletes,
 * so the scan covers every row.
 */
return new class extends Migration
{
    private const string INDEX = 'job_applications_posting_barber_unique';

    public function up(): void
    {
        (new DuplicateApplicationScanner)->ensureNone();

        Schema::table('job_applications', function (Blueprint $table): void {
            $table->unique(['job_posting_id', 'barber_id'], self::INDEX);
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table): void {
            $table->dropUnique(self::INDEX);
        });
    }
};
