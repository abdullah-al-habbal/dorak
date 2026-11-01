<?php

declare(strict_types=1);

namespace Modules\Review\Handlers\Staff;

use Illuminate\Support\Facades\DB;
use Modules\Review\CQRS\Command\Staff\FlagReviewDisputeCommand;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;
use Modules\Review\ValuesObjects\FlagReviewDisputeResult;

/**
 * The reviewed shop side (the branch or barber a review is about) flags a
 * published review as disputed. The review is held from public listings and
 * ratings until an admin decides or the 48-hour window expires (L4).
 */
final class FlagReviewDisputeHandler
{
    public function handle(FlagReviewDisputeCommand $command): FlagReviewDisputeResult
    {
        return DB::transaction(function () use ($command): FlagReviewDisputeResult {
            $review = ReviewModel::query()->lockForUpdate()->findOrFail($command->reviewId);
            if ($review->getAttribute('subject_type') !== $command->subjectType || $review->getAttribute('subject_id') !== $command->subjectId) {
                return FlagReviewDisputeResult::notReviewedParty();
            }

            if ($review->getAttribute('status') !== ReviewStatus::Published) {
                return FlagReviewDisputeResult::notPublished();
            }

            $review->update([
                'status' => ReviewStatus::Disputed,
                'dispute_reason' => $command->reason,
                'disputed_at' => now(),
                'resolved_at' => null,
                'resolved_by' => null,
            ]);

            return FlagReviewDisputeResult::success($review->fresh('author'));
        });
    }
}
