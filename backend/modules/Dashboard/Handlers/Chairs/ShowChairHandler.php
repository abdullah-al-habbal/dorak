<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Chairs;

use Modules\Chair\Models\ChairModel;
use Modules\Dashboard\CQRS\Query\ShowChairQuery;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ShowChairEloquentResolver;

final readonly class ShowChairHandler
{
    public function __construct(private ShowChairEloquentResolver $resolver) {}

    public function handle(ShowChairQuery $query): ChairModel
    {
        return $this->resolver->resolve($query);
    }
}
