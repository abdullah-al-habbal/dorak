<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Shared;

use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Explore\CQRS\Query\Shared\GetBarberDetailQuery;
use Modules\OfferedService\Http\Resources\Shared\MenuServiceResource;

final class GetBarberDetailEloquentResolver
{
    /**
     * Barber detail (Task 48): the barber, their bookable services and where
     * they work — accepted affiliations with discoverable branches (with the
     * chair they sit at) or with brands.
     */
    public function resolve(GetBarberDetailQuery $query): array
    {
        $barber = BarberModel::discoverable()
            ->with(['services' => fn ($services) => $services->bookable()])
            ->findOrFail($query->barberId);

        return array_merge(
            (new BarberResource($barber))->toArray(request()),
            [
                'services' => MenuServiceResource::collection($barber->services),
                'workplaces' => $this->workplaces($barber),
            ],
        );
    }

    /** @return list<array{type: string, id: string, name: mixed, chair_label: string|null}> */
    private function workplaces(BarberModel $barber): array
    {
        $affiliations = BarberAffiliationModel::query()
            ->where('barber_id', $barber->getKey())
            ->where('status', AffiliationStatus::Active)
            ->get(['affiliable_type', 'affiliable_id']);

        $branchIds = $affiliations->filter(fn (BarberAffiliationModel $a): bool => $a->getAttribute('affiliable_type') === AffiliableType::Branch)->pluck('affiliable_id')->all();
        $brandIds = $affiliations->filter(fn (BarberAffiliationModel $a): bool => $a->getAttribute('affiliable_type') === AffiliableType::Brand)->pluck('affiliable_id')->all();

        $chairs = ChairModel::query()
            ->where('barber_id', $barber->getKey())
            ->whereIn('branch_id', $branchIds)
            ->pluck('label', 'branch_id');

        $branches = BranchModel::discoverable()->whereKey($branchIds)->orderBy('id')->get()
            ->map(fn (BranchModel $branch): array => [
                'type' => 'branch',
                'id' => (string) $branch->getKey(),
                'name' => $branch->name,
                'chair_label' => $chairs->get($branch->getKey()),
            ]);

        $brands = BrandModel::active()->whereKey($brandIds)->orderBy('id')->get()
            ->map(fn (BrandModel $brand): array => [
                'type' => 'brand',
                'id' => (string) $brand->getKey(),
                'name' => $brand->name,
                'chair_label' => null,
            ]);

        return $branches->concat($brands)->values()->all();
    }
}
