<?php

declare(strict_types=1);

namespace Modules\JobPosting\Support;

use Modules\JobPosting\Constants\JobPostingConstants;

/**
 * Decides whether a contract migration waits for the deploy's post-swap run. Only the process environment counts
 * (never `.env` or config), so the variable exists exactly while the deploy sets it inline on the pre-swap `migrate`.
 * A skipped migration is not recorded, so the next plain `migrate` runs it: it cannot be skipped permanently.
 */
final class DeferredContractMigrationGate
{
    public static function isDeferred(): bool
    {
        $value = getenv(JobPostingConstants::JOB_POSTING_DEFER_CONTRACT_ENV);

        return $value !== false && $value !== '' && $value !== '0';
    }
}
