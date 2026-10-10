<?php

declare(strict_types=1);

namespace Modules\Review\Eloquent\Resolvers\Shared;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Branch\Models\BranchModel;
use Modules\Review\CQRS\Query\Shared\GetBranchReviewsQuery;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

final class GetBranchReviewsEloquentResolver
{
    public function resolve(GetBranchReviewsQuery $payload): LengthAwarePaginator
    {
        return ReviewModel::query()
            ->where('subject_id', $payload->branchId)
            ->whereIn('subject_type', [(new BranchModel)->getMorphClass(), BranchModel::class])
            ->where('status', ReviewStatus::Published)
            ->with('author')
            ->orderByDesc('created_at')
            ->paginate($payload->perPage);
    }
}
