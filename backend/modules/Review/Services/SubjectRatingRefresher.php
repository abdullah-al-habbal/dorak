<?php

declare(strict_types=1);

namespace Modules\Review\Services;

use Modules\Review\Constants\ReviewRatingConstants;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

/**
 * Keeps `rating_avg` / `rating_count` on branches and barbers equal to the
 * aggregate of their published or resolved reviews (Task 42). Disputed and
 * hidden reviews never count.
 */
final class SubjectRatingRefresher
{
    /** @return list<ReviewStatus> */
    public static function countedStatuses(): array
    {
        return [ReviewStatus::Published, ReviewStatus::Resolved];
    }

    public function refresh(?ReviewSubjectTypeEnum $subjectType, ?string $subjectId): void
    {
        if ($subjectType === null || $subjectId === null) {
            return;
        }

        if (! in_array($subjectType, ReviewRatingConstants::REVIEW_RATING_RATED_SUBJECTS, true)) {
            return;
        }

        $modelClass = $subjectType->modelClass();

        $reviews = ReviewModel::query()
            ->where('subject_id', $subjectId)
            ->where('subject_type', $subjectType)
            ->whereIn('status', self::countedStatuses());

        $count = (clone $reviews)->count();
        $average = $count === 0 ? null : round((float) (clone $reviews)->avg('rating'), 2);

        $modelClass::query()->whereKey($subjectId)->update([
            'rating_avg' => $average,
            'rating_count' => $count,
        ]);
    }

    public function refreshAll(): int
    {
        $refreshed = 0;
        foreach (ReviewRatingConstants::REVIEW_RATING_RATED_SUBJECTS as $subjectType) {
            $subjectType->modelClass()::query()->select('id')->chunkById(500, function ($subjects) use ($subjectType, &$refreshed): void {
                foreach ($subjects as $subject) {
                    $this->refresh($subjectType, (string) $subject->getKey());
                    $refreshed++;
                }
            });
        }

        return $refreshed;
    }
}
