<?php

declare(strict_types=1);

namespace Modules\Review\Eloquent\Resolvers\Shared;

use Modules\Review\Models\ReviewModel;

final class ManageReviewDisputeEloquentResolver
{
    public function find(string $reviewId): ReviewModel
    {
        return ReviewModel::query()->findOrFail($reviewId);
    }
}
