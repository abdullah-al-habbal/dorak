<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Modules\Barber\Http\Resources\BarberResource;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Http\Resources\Shared\BranchResource;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;
use Modules\Chair\Models\ChairModel;
use Modules\Explore\CQRS\Query\Shared\GetBranchDetailQuery;
use Modules\OfferedService\Http\Resources\Shared\MenuServiceResource;
use Modules\OfferedService\Models\OfferedServiceModel;

final class GetBranchDetailEloquentResolver
{
    public function __construct(private readonly BranchHours $hours) {}

    /**
     * Branch detail (BE-03, Task 48): the branch, its seated barbers, and the
     * full menu — the branch's and brand's own bookable services plus the
     * bookable services of the seated barbers, each tagged with its `owner`.
     */
    public function resolve(GetBranchDetailQuery $query): array
    {
        $bookable = fn ($services) => $services->bookable()->with('catalogItem');
        $branch = BranchModel::discoverable()
            ->with(['chairs.barber.services' => $bookable])
            ->findOrFail($query->branchId);

        $barbers = $branch->chairs
            ->map(fn (ChairModel $chair): ?BarberModel => $chair->barber)
            ->filter(fn ($barber): bool => $barber instanceof BarberModel && $barber->isEnabled && ! $barber->isBanned())
            ->unique('id')
            ->values();

        $menu = OfferedServiceModel::query()
            ->bookable()
            ->offeredAtShop($branch->getAttribute('brand_id') === null ? null : (string) $branch->getAttribute('brand_id'))
            ->orderBy('serviceable_type')
            ->orderBy('price')
            ->get()
            ->concat($barbers->flatMap(fn (BarberModel $barber) => $barber->services))
            ->unique('id')
            ->values();

        return array_merge(
            (new BranchResource($branch))->toArray(request()),
            [
                'chairs_count' => $branch->chairs->count(),
                'barbers' => BarberResource::collection($barbers),
                'services' => MenuServiceResource::collection($menu),
                'opening_hours' => $this->hours->week($branch),
                'today_hours' => $this->hours->forDate((string) $branch->getKey(), now()),
            ],
        );
    }
}
