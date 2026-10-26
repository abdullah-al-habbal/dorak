<?php

declare(strict_types=1);

namespace Modules\Audit\Handlers\Admin;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Audit\CQRS\Query\Admin\ListStatusChangeLogsQuery;
use Modules\Audit\Eloquent\Resolvers\Admin\ListStatusChangeLogsEloquentResolver;

final class ListStatusChangeLogsHandler
{
    public function __construct(
        private readonly ListStatusChangeLogsEloquentResolver $resolver,
    ) {}

    public function handle(ListStatusChangeLogsQuery $payload): LengthAwarePaginator
    {
        return $this->resolver->resolve($payload);
    }
}
