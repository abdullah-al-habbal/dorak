<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Modules\Barber\Http\Resources\BarberResource;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Http\Resources\Shared\BranchResource;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Explore\CQRS\Query\Shared\GetBranchDetailQuery;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;
use Modules\OfferedService\Models\OfferedServiceModel;

final class GetBranchDetailEloquentResolver
{
    public function resolve(GetBranchDetailQuery $query): array
    {
        $branch = BranchModel::discoverable()->with('chairs.barber.services.catalogItem')->findOrFail($query->branchId);

        $barbers = $branch->chairs
            ->map(fn (ChairModel $chair): ?BarberModel => $chair->barber)
            ->filter(fn ($barber): bool => $barber instanceof BarberModel && $barber->isEnabled && ! $barber->isBanned())
            ->unique('id')
            ->values();

        $services = $barbers->flatMap(fn (BarberModel $barber) => $barber->services
            ->filter(fn (OfferedServiceModel $service): bool => $service->getAttribute('active') === true
                && $service->catalogItem?->getAttribute('is_active') === true))
            ->unique('id')
            ->values();

        return array_merge(
            (new BranchResource($branch))->toArray(request()),
            [
                'chairs_count' => $branch->chairs->count(),
                'barbers' => BarberResource::collection($barbers),
                'services' => ServiceResource::collection($services),
            ],
        );
    }
}
