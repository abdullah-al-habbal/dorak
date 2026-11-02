<?php

declare(strict_types=1);

namespace Modules\Review\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;
use Modules\Review\Services\SubjectRatingRefresher;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

#[Signature('reviews:release-expired-disputes')]
#[Description('Re-publish reviews whose dispute was not resolved within 48 hours')]
final class ReleaseExpiredReviewDisputesCommand extends Command
{
    public function handle(SubjectRatingRefresher $ratings): int
    {
        $expired = ReviewModel::query()
            ->where('status', ReviewStatus::Disputed)
            ->where('disputed_at', '<=', now()->subHours(app(SettingsService::class)->int(SettingKey::ReviewDisputeWindowHours)));
        $subjects = (clone $expired)->select(['subject_type', 'subject_id'])->distinct()->get();

        $released = $expired->update([
            'status' => ReviewStatus::Published,
            'resolved_at' => now(),
            'resolved_by_id' => null,
            'updated_at' => now(),
        ]);

        foreach ($subjects as $subject) {
            $ratings->refresh($subject->getAttribute('subject_type'), (string) $subject->getAttribute('subject_id'));
        }

        $this->info(trans('review::messages.disputes_released', ['count' => $released], 'en'));

        return self::SUCCESS;
    }
}
