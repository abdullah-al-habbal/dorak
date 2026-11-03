<?php

declare(strict_types=1);

namespace Modules\OfferedService\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Collection;
use Modules\Barber\Models\BarberModel;
use Modules\OfferedService\CQRS\Query\Shared\ListBarberServicesQuery;
use Modules\OfferedService\Services\EffectiveServiceTerms;

final class ListBarberServicesEloquentResolver
{
    public function __construct(private readonly EffectiveServiceTerms $serviceTerms) {}

    public function resolve(ListBarberServicesQuery $query): Collection
    {
        $barber = BarberModel::with('services.currency')->findOrFail($query->barberId);

        if ($query->branchId !== null) {
            $this->serviceTerms->attach($barber->services, $this->serviceTerms->brandIdForBranch($query->branchId));
        }

        return $barber->services;
    }
}
