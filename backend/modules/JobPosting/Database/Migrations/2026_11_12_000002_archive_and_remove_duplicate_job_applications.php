<?php

// modules/JobPosting/Database/Migrations/2026_11_12_000002_archive_and_remove_duplicate_job_applications.php
// @contract-migration: removes duplicate job applications so the unique index can be built; every removed row is archived first, in the same transaction, and verified
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Modules\JobPosting\Support\DeferredContractMigrationGate;
use Modules\JobPosting\Support\DuplicateApplicationResolver;

/**
 * Approved rule (Batch 1): when a barber applied more than once to a posting, keep the application with the highest
 * status (Accepted > Seen > Submitted > Rejected), the oldest when equal, and archive the others with their full
 * profile snapshot. Runs before 2026_11_13_000001 (the unique index). Audit rows (status_change_logs) are never touched.
 * With no duplicates it does nothing.
 *
 * Deferred with the index (see 2026_11_13_000001): the deploy's pre-swap `migrate` skips it unrecorded, the post-swap
 * `migrate` runs it immediately before the index is built. Resolving earlier would let the previous release, which has
 * no lock, create new duplicates before the index exists. Preview first: `php artisan job-applications:resolve-duplicates`.
 */
return new class extends Migration
{
    public function shouldRun(): bool
    {
        return ! DeferredContractMigrationGate::isDeferred();
    }

    public function up(): void
    {
        (new DuplicateApplicationResolver)->resolve();
    }

    public function down(): void
    {
        // Intentionally empty: restoring duplicates would break the unique index. The rows stay in the archive table.
    }
};
