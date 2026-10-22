<?php

declare(strict_types=1);

namespace Modules\Review\Services;

use Illuminate\Database\Eloquent\Relations\Relation;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

/**
 * Keeps `rating_avg` / `rating_count` on branches and barbers equal to the
 * aggregate of their published or resolved reviews (Task 42). Disputed and
 * hidden reviews never count.
 */
final class SubjectRatingRefresher
{
    /** @var array<string, class-string<BranchModel|BarberModel>> */
    private const array RATED_SUBJECTS = [
        'branch' => BranchModel::class,
        'barber' => BarberModel::class,
    ];

    /** @return list<ReviewStatus> */
    public static function countedStatuses(): array
    {
        return [ReviewStatus::Published, ReviewStatus::Resolved];
    }

    public function refresh(?string $subjectType, ?string $subjectId): void
    {
        if ($subjectType === null || $subjectId === null) {
            return;
        }

        $alias = Relation::getMorphAlias($subjectType);
        $modelClass = self::RATED_SUBJECTS[$alias] ?? null;
        if ($modelClass === null) {
            return;
        }

        $reviews = ReviewModel::query()
            ->where('subject_id', $subjectId)
            ->whereIn('subject_type', [$alias, $modelClass])
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
        foreach (self::RATED_SUBJECTS as $alias => $modelClass) {
            $modelClass::query()->select('id')->chunkById(500, function ($subjects) use ($alias, &$refreshed): void {
                foreach ($subjects as $subject) {
                    $this->refresh($alias, (string) $subject->getKey());
                    $refreshed++;
                }
            });
        }

        return $refreshed;
    }
}
