<?php

declare(strict_types=1);

namespace Modules\Audit\Eloquent\Resolvers\Admin;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Audit\CQRS\Query\Admin\ListStatusChangeLogsQuery;
use Modules\Audit\Models\StatusChangeLogModel;

final class ListStatusChangeLogsEloquentResolver
{
    public function resolve(ListStatusChangeLogsQuery $payload): LengthAwarePaginator
    {
        return StatusChangeLogModel::query()
            ->where('subject_type', $payload->subjectType->value)
            ->where('subject_id', $payload->subjectId)
            ->latest('created_at')
            ->paginate($payload->perPage);
    }
}
