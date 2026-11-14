<?php

declare(strict_types=1);

namespace Modules\JobPosting\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Modules\JobPosting\Constants\JobPostingConstants;
use Modules\JobPosting\Support\DuplicateApplicationResolver;

#[Signature(JobPostingConstants::JOB_POSTING_RESOLVE_DUPLICATES_COMMAND.' {--apply : Archive and remove the duplicates (default: only show the plan)}')]
#[Description('Show, or with --apply resolve, duplicate job applications (keep Accepted > Seen > Submitted > Rejected, then the oldest; archive the rest)')]
final class ResolveDuplicateApplicationsCommand extends Command
{
    public function handle(DuplicateApplicationResolver $resolver): int
    {
        $plan = $resolver->plan();

        if ($plan === []) {
            $this->info('No duplicate applications.');

            return self::SUCCESS;
        }

        foreach ($plan as $group) {
            $this->line(sprintf(
                'posting %s, barber %s: keep %s (%s), archive %s',
                $group['job_posting_id'],
                $group['barber_id'],
                $group['keep']->id,
                $group['keep']->status,
                implode(', ', array_map(fn (object $row): string => $row->id.' ('.$row->status.')', $group['remove'])),
            ));
        }

        if (! $this->option('apply')) {
            $this->warn(sprintf('%d pair(s) found. Dry run: nothing changed. Re-run with --apply to archive and remove the duplicates.', count($plan)));

            return self::SUCCESS;
        }

        $this->info(sprintf('Archived and removed %d duplicate application(s).', $resolver->resolve()));

        return self::SUCCESS;
    }
}
