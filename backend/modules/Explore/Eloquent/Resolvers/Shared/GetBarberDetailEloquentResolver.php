<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Modules\Barber\Http\Resources\BarberResource;
use Modules\Barber\Models\BarberModel;
use Modules\Explore\CQRS\Query\Shared\GetBarberDetailQuery;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;
use Modules\OfferedService\Models\OfferedServiceModel;

final class GetBarberDetailEloquentResolver
{
    public function resolve(GetBarberDetailQuery $query): array
    {
        $barber = BarberModel::discoverable()->with('services.catalogItem')->findOrFail($query->barberId);
        $services = $barber->services
            ->filter(fn (OfferedServiceModel $service): bool => $service->getAttribute('active') === true
                && $service->catalogItem?->getAttribute('is_active') === true)
            ->values();

        return array_merge(
            (new BarberResource($barber))->toArray(request()),
            [
                'services' => ServiceResource::collection($services),
            ],
        );
    }
}
