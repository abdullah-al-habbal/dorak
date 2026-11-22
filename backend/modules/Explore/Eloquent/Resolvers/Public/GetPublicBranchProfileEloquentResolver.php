<?php

declare(strict_types=1);

namespace Modules\Explore\Eloquent\Resolvers\Public;

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchHours;
use Modules\Chair\Models\ChairModel;
use Modules\Explore\CQRS\Query\Public\GetPublicProfileQuery;
use Modules\Explore\Http\Resources\Public\PublicBranchProfileResource;
use Modules\Explore\Support\BranchMenu;

final class GetPublicBranchProfileEloquentResolver
{
    public function __construct(
        private readonly BranchHours $hours,
        private readonly BranchMenu $menu,
    ) {}

    /** A discoverable branch by slug (404 when missing, switched off, banned or its brand is inactive). */
    public function resolve(GetPublicProfileQuery $query): PublicBranchProfileResource
    {
        $branch = BranchModel::discoverable()
            ->with(['brand', 'chairs.barber.services' => fn ($services) => $services->bookable()->with('catalogItem')])
            ->where('slug', $query->slug)
            ->firstOrFail();

        $stylists = $branch->chairs
            ->map(fn (ChairModel $chair): ?BarberModel => $chair->barber)
            ->filter(fn ($barber): bool => $barber instanceof BarberModel && $barber->isEnabled && ! $barber->isBanned())
            ->unique('id')
            ->values();

        return new PublicBranchProfileResource($branch, [
            'stylists' => $stylists,
            'services' => $this->menu->build($branch, $stylists),
            'opening_hours' => $this->hours->week($branch),
            'today_hours' => $this->hours->forDate((string) $branch->getKey(), now()),
        ]);
    }
}
