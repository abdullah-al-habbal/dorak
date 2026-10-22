<?php

declare(strict_types=1);

namespace Modules\Review\Eloquent\Resolvers\Shared;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Barber\Models\BarberModel;
use Modules\Review\CQRS\Query\Shared\GetBarberReviewsQuery;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

final class GetBarberReviewsEloquentResolver
{
    public function resolve(GetBarberReviewsQuery $payload): LengthAwarePaginator
    {
        return ReviewModel::query()
            ->where('subject_id', $payload->barberId)
            ->whereIn('subject_type', [(new BarberModel)->getMorphClass(), BarberModel::class])
            ->where('status', ReviewStatus::Published)
            ->with('author')
            ->orderByDesc('created_at')
            ->paginate($payload->perPage);
    }
}
