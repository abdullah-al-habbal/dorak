<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Stylists;

use Modules\Barber\Models\BarberModel;
use Modules\Dashboard\CQRS\Query\ShowStylistQuery;
use Modules\Dashboard\Eloquent\Resolvers\Stylists\ShowStylistEloquentResolver;

final readonly class ShowStylistHandler
{
    public function __construct(private ShowStylistEloquentResolver $resolver) {}

    public function handle(ShowStylistQuery $query): BarberModel
    {
        return $this->resolver->resolve($query);
    }
}
