<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Services;

use Modules\Dashboard\CQRS\Query\ShowServiceQuery;
use Modules\Dashboard\Eloquent\Resolvers\Services\ShowServiceEloquentResolver;
use Modules\OfferedService\Models\OfferedServiceModel;

final readonly class ShowServiceHandler
{
    public function __construct(private ShowServiceEloquentResolver $resolver) {}

    public function handle(ShowServiceQuery $query): OfferedServiceModel
    {
        return $this->resolver->resolve($query);
    }
}
