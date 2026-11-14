<?php

// modules/JobPosting/Database/Migrations/2026_11_13_000001_add_unique_barber_per_posting_to_job_applications.php
// @contract-migration: edited before it ever left the local repository (no remote, never deployed); builds the unique index after resolving duplicates in the same unit
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Modules\JobPosting\Constants\JobPostingConstants;
use Modules\JobPosting\Support\DeferredContractMigrationGate;
use Modules\JobPosting\Support\UniqueApplicationIndexInstaller;

/**
 * One application per barber per posting, enforced by the database (Batch 1, WP-1).
 *
 * Resolve and index are one unit (UniqueApplicationIndexInstaller): the duplicates are archived and removed by the
 * approved rule (earlier migration 2026_11_12_000002, same code) under row locks, the index is built, and a duplicate
 * that slips in between makes the build fail atomically and is resolved by the next attempt. The migration is recorded
 * only when the index exists. Audit rows are never touched.
 *
 * Deferred (contract) step: the deploy's pre-swap `migrate` sets DEFER_CONTRACT_MIGRATIONS, so this reports SKIPPED and is
 * not recorded; the post-swap `migrate` runs it in maintenance mode after the previous release has drained (it would
 * answer a concurrent double submit with HTTP 500). Without the variable (tests, local, manual runs) it runs normally.
 */
return new class extends Migration
{
    private const string FOREIGN_KEY_INDEX = 'job_applications_job_posting_id_index';

    public function shouldRun(): bool
    {
        return ! DeferredContractMigrationGate::isDeferred();
    }

    public function up(): void
    {
        (new UniqueApplicationIndexInstaller)->install();
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table): void {
            // MySQL needs an index on job_posting_id for its foreign key; the unique index is it until another exists.
            $table->index('job_posting_id', self::FOREIGN_KEY_INDEX);
            $table->dropUnique(JobPostingConstants::JOB_POSTING_UNIQUE_INDEX);
        });
    }
};
