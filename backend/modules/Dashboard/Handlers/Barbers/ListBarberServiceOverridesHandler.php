<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Barbers;

use Illuminate\Database\Eloquent\Collection;
use Modules\Dashboard\CQRS\Query\ListBarberServiceOverridesQuery;
use Modules\Dashboard\Eloquent\Resolvers\Barbers\ListBarberServiceOverridesEloquentResolver;
use Modules\OfferedService\Models\OfferedServiceModel;

final readonly class ListBarberServiceOverridesHandler
{
    public function __construct(private ListBarberServiceOverridesEloquentResolver $resolver) {}

    /** @return Collection<int, OfferedServiceModel> */
    public function handle(ListBarberServiceOverridesQuery $query): Collection
    {
        return $this->resolver->resolve($query);
    }
}
