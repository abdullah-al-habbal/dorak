<?php

declare(strict_types=1);

namespace Modules\Review\Observers;

use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;
use Modules\Review\Services\SubjectRatingRefresher;

/**
 * Re-computes the subject's stored rating whenever a review is written,
 * re-rated, moved between statuses or subjects, or deleted. Bulk query-builder
 * updates bypass this and must call the refresher themselves.
 */
final class ReviewRatingObserver
{
    public function __construct(private readonly SubjectRatingRefresher $refresher) {}

    public function created(ReviewModel $review): void
    {
        $this->refreshCurrent($review);
    }

    public function updated(ReviewModel $review): void
    {
        if (! $review->wasChanged(['status', 'rating', 'subject_id', 'subject_type'])) {
            return;
        }

        if ($review->wasChanged(['subject_id', 'subject_type'])) {
            $this->refresher->refresh(
                $this->subjectTypeOrNull($review->getOriginal('subject_type')),
                $this->stringOrNull($review->getOriginal('subject_id')),
            );
        }

        $this->refreshCurrent($review);
    }

    public function deleted(ReviewModel $review): void
    {
        $this->refreshCurrent($review);
    }

    private function refreshCurrent(ReviewModel $review): void
    {
        $this->refresher->refresh(
            $this->subjectTypeOrNull($review->getAttribute('subject_type')),
            $this->stringOrNull($review->getAttribute('subject_id')),
        );
    }

    private function subjectTypeOrNull(mixed $value): ?ReviewSubjectTypeEnum
    {
        return match (true) {
            $value instanceof ReviewSubjectTypeEnum => $value,
            is_string($value) => ReviewSubjectTypeEnum::tryFrom($value),
            default => null,
        };
    }

    private function stringOrNull(mixed $value): ?string
    {
        return is_string($value) && $value !== '' ? $value : null;
    }
}
