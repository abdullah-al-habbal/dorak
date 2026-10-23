<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\CQRS\Query\Shared\ListSlotsQuery;
use Modules\Booking\Models\BookingModel;
use Modules\Booking\Queries\AtHomeBookingRules;
use Modules\Booking\Queries\BarberScheduleAvailability;
use Modules\Booking\Queries\BookingAvailability;
use Modules\Branch\Services\BranchHours;
use Modules\Chair\Models\ChairModel;
use Modules\OfferedService\Models\OfferedServiceModel;

final class ListSlotsEloquentResolver
{
    public function __construct(private readonly BranchHours $branchHours) {}

    /**
     * @return list<array{starts_at: Carbon, ends_at: Carbon}>
     */
    public function resolve(ListSlotsQuery $query): array
    {
        if ($query->chairId === null && $query->barberId === null) {
            return [];
        }

        $totalDuration = $this->totalDuration($query);

        if (! $this->chairIsBookable($query)) {
            return [];
        }

        if ($query->barberId !== null) {
            $barber = BarberModel::query()->findOrFail($query->barberId);

            if ($barber->isBanned() || ! $barber->isEnabled) {
                return [];
            }
        }

        $step = max(1, $this->configInt('booking.slots.step_minutes', 15));
        $minLead = max(0, $this->configInt('booking.slots.min_lead_minutes', 0));

        $effectiveBarberId = $query->barberId ?? $this->assignedBarberId($query);
        $branchId = $this->slotBranchId($query);

        $dayStart = $query->date->copy()->utc()->startOfDay();
        $dayEnd = $dayStart->copy()->addDay();
        $earliest = Carbon::now()->utc()->addMinutes($minLead);

        $slots = [];
        $start = $dayStart->copy();

        while ($start->lessThan($dayEnd)) {
            $endsAt = $start->copy()->addMinutes($totalDuration);

            if (! $endsAt->greaterThan($dayEnd) && ! $start->lessThan($earliest)) {
                if ($this->isFree($query, $effectiveBarberId, $start, $endsAt)
                    && $this->branchHours->covers($branchId, $start, $endsAt)) {
                    $slots[] = ['starts_at' => $start->copy(), 'ends_at' => $endsAt];
                }
            }

            $start = $start->copy()->addMinutes($step);
        }

        return $slots;
    }

    private function totalDuration(ListSlotsQuery $query): int
    {
        $services = OfferedServiceModel::query()
            ->whereIn('id', $query->serviceIds)
            ->where('active', true)
            ->get();

        if ($services->count() !== count($query->serviceIds)) {
            throw new InvalidBookingServicesException;
        }

        if ($query->atHomeLatitude !== null && $query->atHomeLongitude !== null) {
            AtHomeBookingRules::ensure($query->barberId, $services, $query->atHomeLatitude, $query->atHomeLongitude);
        }

        $total = 0;

        foreach ($services as $service) {
            $duration = $service->getAttribute('duration');

            if (! is_int($duration) || $duration < 1) {
                throw new InvalidBookingServicesException;
            }

            $total += $duration;
        }

        if ($total < 1) {
            throw new InvalidBookingServicesException;
        }

        return $total;
    }

    private function chairIsBookable(ListSlotsQuery $query): bool
    {
        if ($query->chairId === null) {
            return true;
        }

        $chair = ChairModel::query()->findOrFail($query->chairId);

        if ($query->branchId !== null && $chair->getAttribute('branch_id') !== $query->branchId) {
            throw new NonDiscoverableBookingEntityException;
        }

        if (! $chair->currentAvailability()->isBookable()) {
            return false;
        }

        $assignedBarberId = $chair->getAttribute('barber_id');

        if (! is_string($assignedBarberId)) {
            return true;
        }

        $assignedBarber = BarberModel::query()->find($assignedBarberId);

        return $assignedBarber === null || (! $assignedBarber->isBanned() && $assignedBarber->isEnabled);
    }

    private function isFree(
        ListSlotsQuery $query,
        ?string $barberId,
        Carbon $startsAt,
        Carbon $endsAt,
    ): bool {
        if ($query->chairId !== null && $this->overlaps('chair_id', $query->chairId, $startsAt, $endsAt)) {
            return false;
        }

        if ($query->barberId !== null && $this->overlaps('barber_id', $query->barberId, $startsAt, $endsAt)) {
            return false;
        }

        if ($barberId !== null && ! BarberScheduleAvailability::covers($barberId, $startsAt, $endsAt)) {
            return false;
        }

        return true;
    }

    private function slotBranchId(ListSlotsQuery $query): ?string
    {
        $branchId = $query->chairId === null
            ? $query->branchId
            : ChairModel::query()->whereKey($query->chairId)->value('branch_id');

        return is_string($branchId) ? $branchId : null;
    }

    private function assignedBarberId(ListSlotsQuery $query): ?string
    {
        if ($query->chairId === null) {
            return null;
        }

        $chair = ChairModel::query()->find($query->chairId);

        if ($chair === null) {
            return null;
        }

        $barberId = $chair->getAttribute('barber_id');

        return is_string($barberId) ? $barberId : null;
    }

    private function overlaps(string $column, string $resourceId, Carbon $startsAt, Carbon $endsAt): bool
    {
        $query = BookingModel::query()->where($column, $resourceId);
        BookingAvailability::apply($query, $startsAt, $endsAt);

        return $query->exists();
    }

    private function configInt(string $key, int $default): int
    {
        $value = config($key);

        if (! is_numeric($value)) {
            return $default;
        }

        $intValue = (int) $value;

        return $intValue > 0 ? $intValue : $default;
    }
}
