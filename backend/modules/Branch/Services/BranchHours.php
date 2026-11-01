<?php

declare(strict_types=1);

namespace Modules\Branch\Services;

use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Modules\Branch\Enums\BranchHoursSource;
use Modules\Branch\Models\BranchHoursOverrideModel;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Models\BranchOpeningHourModel;

/**
 * Branch opening hours (Task 51): a weekly schedule plus dated overrides for
 * "today's hours". A date's hours are its override when one exists, else the
 * weekly row for its weekday. A branch with no hours configured at all is
 * treated as always open, the same backward-compatible rule as barber
 * schedules (Task 22). Times are wall-clock `H:i` compared in UTC.
 */
final class BranchHours
{
    /**
     * @param  list<array{weekday: int, is_closed: bool, opens_at: ?string, closes_at: ?string}>  $week
     */
    public function replaceWeek(BranchModel $branch, array $week): void
    {
        DB::transaction(function () use ($branch, $week): void {
            foreach ($week as $day) {
                BranchOpeningHourModel::query()->updateOrCreate(
                    ['branch_id' => $branch->getKey(), 'weekday' => $day['weekday']],
                    $this->hoursAttributes($day),
                );
            }
        });
    }

    /** @param array{is_closed: bool, opens_at: ?string, closes_at: ?string} $hours */
    public function setOverride(BranchModel $branch, string $date, array $hours): BranchHoursOverrideModel
    {
        return BranchHoursOverrideModel::query()->updateOrCreate(
            ['branch_id' => $branch->getKey(), 'date' => $date],
            $this->hoursAttributes($hours),
        );
    }

    public function clearOverride(BranchModel $branch, string $date): void
    {
        BranchHoursOverrideModel::query()->where('branch_id', $branch->getKey())->whereDate('date', $date)->delete();
    }

    /** @return list<array{weekday: int, is_closed: bool, opens_at: ?string, closes_at: ?string}> */
    public function week(BranchModel $branch): array
    {
        return BranchOpeningHourModel::query()
            ->where('branch_id', $branch->getKey())
            ->orderBy('weekday')
            ->get()
            ->map(fn (BranchOpeningHourModel $row): array => [
                'weekday' => (int) $row->getAttribute('weekday'),
                ...$this->present($row),
            ])
            ->values()
            ->all();
    }

    /**
     * The hours for one date, or null when the branch configured none.
     *
     * @return array{date: string, is_closed: bool, opens_at: ?string, closes_at: ?string, source: BranchHoursSource}|null
     */
    public function forDate(string $branchId, CarbonInterface $date): ?array
    {
        $override = BranchHoursOverrideModel::query()
            ->where('branch_id', $branchId)
            ->whereDate('date', $date->toDateString())
            ->first();
        if ($override instanceof BranchHoursOverrideModel) {
            return ['date' => $date->toDateString(), ...$this->present($override), 'source' => BranchHoursSource::Override];
        }

        $weekly = BranchOpeningHourModel::query()
            ->where('branch_id', $branchId)
            ->where('weekday', $date->dayOfWeek)
            ->first();

        return $weekly instanceof BranchOpeningHourModel
            ? ['date' => $date->toDateString(), ...$this->present($weekly), 'source' => BranchHoursSource::Weekly]
            : null;
    }

    /** Whether `[startsAt, endsAt)` lies inside the branch's open hours that day. */
    public function covers(?string $branchId, CarbonInterface $startsAt, CarbonInterface $endsAt): bool
    {
        if ($branchId === null) {
            return true;
        }

        $configured = BranchOpeningHourModel::query()->where('branch_id', $branchId)->exists()
            || BranchHoursOverrideModel::query()->where('branch_id', $branchId)->whereDate('date', $startsAt->toDateString())->exists();
        if (! $configured) {
            return true;
        }

        $day = $this->forDate($branchId, $startsAt);
        if ($day === null || $day['is_closed'] || $day['opens_at'] === null || $day['closes_at'] === null) {
            return false;
        }

        $start = $this->minutes($startsAt->format('H:i'));
        $end = $startsAt->isSameDay($endsAt)
            ? $this->minutes($endsAt->format('H:i'))
            : ($endsAt->equalTo($startsAt->copy()->addDay()->startOfDay()) ? 24 * 60 : PHP_INT_MAX);

        return $start >= $this->minutes($day['opens_at']) && $end <= $this->minutes($day['closes_at']);
    }

    private function minutes(string $time): int
    {
        [$hours, $minutes] = array_map('intval', explode(':', $time));

        return $hours * 60 + $minutes;
    }

    /**
     * @param  array{is_closed?: bool, opens_at?: ?string, closes_at?: ?string}  $hours
     * @return array{is_closed: bool, opens_at: ?string, closes_at: ?string}
     */
    private function hoursAttributes(array $hours): array
    {
        $closed = (bool) ($hours['is_closed'] ?? false);

        return [
            'is_closed' => $closed,
            'opens_at' => $closed ? null : ($hours['opens_at'] ?? null),
            'closes_at' => $closed ? null : ($hours['closes_at'] ?? null),
        ];
    }

    /** @return array{is_closed: bool, opens_at: ?string, closes_at: ?string} */
    private function present(BranchOpeningHourModel|BranchHoursOverrideModel $row): array
    {
        $time = fn (mixed $value): ?string => is_string($value) && $value !== '' ? substr($value, 0, 5) : null;

        return [
            'is_closed' => (bool) $row->getAttribute('is_closed'),
            'opens_at' => $time($row->getAttribute('opens_at')),
            'closes_at' => $time($row->getAttribute('closes_at')),
        ];
    }
}
