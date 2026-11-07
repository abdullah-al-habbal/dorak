<?php

declare(strict_types=1);

namespace Modules\Review\Services;

use Modules\Branch\Models\BranchModel;
use Modules\Review\Constants\ReviewRatingConstants;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

/**
 * Rating summary for the dashboard reviews screen. Counts the same reviews as
 * `SubjectRatingRefresher` (published or resolved), so it always agrees with
 * the branch's `rating_average` / `rating_count`.
 */
final class BranchReviewSummary
{
    /** @return array{average: float|null, count: int, distribution: array<int, int>} */
    public function for(BranchModel $branch): array
    {
        $perRating = ReviewModel::query()
            ->where('subject_id', $branch->getKey())
            ->where('subject_type', ReviewSubjectTypeEnum::Branch)
            ->whereIn('status', SubjectRatingRefresher::countedStatuses())
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $distribution = [];
        $count = 0;
        $sum = 0;
        for ($rating = ReviewRatingConstants::REVIEW_RATING_MIN; $rating <= ReviewRatingConstants::REVIEW_RATING_MAX; $rating++) {
            $total = (int) ($perRating[$rating] ?? 0);
            $distribution[$rating] = $total;
            $count += $total;
            $sum += $rating * $total;
        }

        return [
            'average' => $count === 0 ? null : round($sum / $count, 2),
            'count' => $count,
            'distribution' => $distribution,
        ];
    }
}
