<?php

declare(strict_types=1);

namespace Modules\Branch\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Booking\Enums\BookingStatus;
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
            'chairs.barber',
            'chairs.bookings' => fn (HasMany $query) => $query
                ->whereIn('status', BookingStatus::availabilityBlockingValues())
                ->where('time_slot', '<', $endsAt)
                ->where('ends_at', '>', $availability->startsAt),
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
