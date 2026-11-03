<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Barbers;

use Illuminate\Database\Eloquent\Collection;
use Modules\Dashboard\CQRS\Query\ListBarberServiceOverridesQuery;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\OfferedService\Services\EffectiveServiceTerms;

final class ListBarberServiceOverridesEloquentResolver
{
    public function __construct(private readonly EffectiveServiceTerms $serviceTerms) {}

    /** @return Collection<int, OfferedServiceModel> */
    public function resolve(ListBarberServiceOverridesQuery $query): Collection
    {
        $services = OfferedServiceModel::query()
            ->where('serviceable_type', ServiceableTypeEnum::Barber)
            ->where('serviceable_id', $query->barberId)
            ->orderBy('created_at')
            ->get();

        $this->serviceTerms->attach($services, $query->brandId);

        return $services;
    }
}
