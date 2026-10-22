<?php

declare(strict_types=1);

namespace Modules\Review\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

/**
 * L4: a dispute holds a review for at most 48 hours. Disputes no admin decided
 * in that window are re-published.
 */
#[Signature('reviews:release-expired-disputes')]
#[Description('Re-publish reviews whose dispute was not resolved within 48 hours')]
final class ReleaseExpiredReviewDisputesCommand extends Command
{
    public const int WINDOW_HOURS = 48;

    public function handle(): int
    {
        $released = ReviewModel::query()
            ->where('status', ReviewStatus::Disputed)
            ->where('disputed_at', '<=', now()->subHours(self::WINDOW_HOURS))
            ->update([
                'status' => ReviewStatus::Published,
                'resolved_at' => now(),
                'resolved_by' => null,
                'updated_at' => now(),
            ]);

        $this->info(trans('review::messages.disputes_released', ['count' => $released], 'en'));

        return self::SUCCESS;
    }
}
