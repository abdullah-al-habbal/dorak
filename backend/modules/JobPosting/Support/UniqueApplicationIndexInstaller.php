<?php

declare(strict_types=1);

namespace Modules\JobPosting\Support;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Schema;
use Modules\JobPosting\Constants\JobPostingConstants;
use RuntimeException;

/**
 * Resolve and index as ONE unit. Each attempt archives and removes the duplicates under row locks, then builds the
 * unique (posting, barber) index. A duplicate written between the two steps (a request of the previous release still
 * in flight) makes the index build fail atomically with a duplicate-entry error; the next attempt resolves it and builds
 * again, so a late writer cannot leave the deploy stuck on an already-recorded resolution. After the last attempt the
 * migration fails without being recorded, with the data intact.
 */
final class UniqueApplicationIndexInstaller
{
    public function install(): void
    {
        $table = JobPostingConstants::JOB_POSTING_APPLICATIONS_TABLE;

        for ($attempt = 1; $attempt <= JobPostingConstants::JOB_POSTING_INDEX_ATTEMPTS; $attempt++) {
            (new DuplicateApplicationResolver)->resolve();

            try {
                Schema::table($table, function (Blueprint $blueprint): void {
                    $blueprint->unique(['job_posting_id', 'barber_id'], JobPostingConstants::JOB_POSTING_UNIQUE_INDEX);
                });

                break;
            } catch (UniqueConstraintViolationException $e) {
                if ($attempt === JobPostingConstants::JOB_POSTING_INDEX_ATTEMPTS) {
                    throw new RuntimeException(sprintf('The unique index could not be built after %d attempts: duplicates kept appearing. Nothing was recorded.', $attempt), 0, $e);
                }
            }
        }

        // Never let the migration be recorded as applied without the index (it is recorded only when up() returns).
        $indexed = collect(Schema::getIndexes($table))->contains(
            fn (array $index): bool => $index['name'] === JobPostingConstants::JOB_POSTING_UNIQUE_INDEX && $index['unique'],
        );

        if (! $indexed) {
            throw new RuntimeException('The unique index '.JobPostingConstants::JOB_POSTING_UNIQUE_INDEX.' does not exist after the migration. Not recorded as applied.');
        }
    }
}
