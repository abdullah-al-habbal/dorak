<?php

declare(strict_types=1);

namespace Modules\Branch\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Branch\CQRS\Query\Shared\GetFloorPlanQuery;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;

final class GetFloorPlanEloquentResolver
{
    public function resolve(GetFloorPlanQuery $query): BranchModel
    {
        $endsAt = $query->startsAt->copy()->addMinutes($query->durationMinutes);
        $availability = $query;
        $branch = BranchModel::discoverable()->findOrFail($availability->branchId);
        $branch->load([
            'chairs.barber.services' => fn ($services) => $services->bookable(),
            'chairs.bookings' => function (HasMany $query) use ($availability, $endsAt): void {
                BookingAvailability::apply($query->getQuery(), $availability->startsAt, $endsAt);
            },
        ]);

        $branch->chairs->each(function (ChairModel $chair): void {
            $barber = $chair->barber;
            if ($barber !== null && (! $barber->isEnabled || $barber->isBanned())) {
                $chair->setRelation('barber', null);
            }
        });

        return $branch;
    }
}
