<?php

declare(strict_types=1);

namespace Modules\JobPosting\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Modules\JobPosting\Constants\JobPostingConstants;
use Modules\JobPosting\Support\DuplicateApplicationScanner;

#[Signature(JobPostingConstants::JOB_POSTING_VERIFY_INDEX_COMMAND)]
#[Description('Read-only deploy check: fails unless the unique (posting, barber) index exists and no duplicate application remains')]
final class VerifyUniqueApplicationIndexCommand extends Command
{
    public function handle(DuplicateApplicationScanner $scanner): int
    {
        $indexed = collect(Schema::getIndexes(JobPostingConstants::JOB_POSTING_APPLICATIONS_TABLE))
            ->contains(fn (array $index): bool => $index['name'] === JobPostingConstants::JOB_POSTING_UNIQUE_INDEX
                && $index['unique']
                && $index['columns'] === ['job_posting_id', 'barber_id']);

        if (! $indexed) {
            $this->error('Unique index '.JobPostingConstants::JOB_POSTING_UNIQUE_INDEX.' is missing on job_applications.');

            return self::FAILURE;
        }

        if ($scanner->duplicates() !== []) {
            $this->error('Duplicate applications exist despite the index.');

            return self::FAILURE;
        }

        $this->info('Unique application index present, no duplicates.');

        return self::SUCCESS;
    }
}
