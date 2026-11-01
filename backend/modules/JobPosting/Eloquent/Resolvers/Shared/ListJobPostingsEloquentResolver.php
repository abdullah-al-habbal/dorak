<?php

declare(strict_types=1);

namespace Modules\JobPosting\Eloquent\Resolvers\Shared;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\JobPosting\CQRS\Query\Shared\ListJobPostingsQuery;
use Modules\JobPosting\Enums\JobPostingStatusEnum;
use Modules\JobPosting\Models\JobPostingModel;

final class ListJobPostingsEloquentResolver
{
    public function resolve(ListJobPostingsQuery $payload): LengthAwarePaginator
    {
        return JobPostingModel::withCount('applications')
            ->where('status', JobPostingStatusEnum::Open)
            ->orderByDesc('created_at')
            ->paginate($payload->perPage);
    }
}
