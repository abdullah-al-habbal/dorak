<?php

declare(strict_types=1);

namespace Modules\Branch\Services;

use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
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
     * Replaces the listed days. A day carries `shifts`, or the legacy single
     * interval, or is closed; days left out of `$week` are untouched.
     *
     * @param  list<array<string, mixed>>  $week
     */
    public function replaceWeek(BranchModel $branch, array $week): void
    {
        DB::transaction(function () use ($branch, $week): void {
            foreach ($week as $day) {
                $dayOfWeek = (int) $day['day_of_week'];
                BranchOpeningHourModel::query()
                    ->where('branch_id', $branch->getKey())
                    ->where('day_of_week', $dayOfWeek)
                    ->delete();

                foreach ($this->shiftRows($day) as $row) {
                    BranchOpeningHourModel::query()->create([
                        'branch_id' => $branch->getKey(),
                        'day_of_week' => $dayOfWeek,
                        ...$row,
                    ]);
                }
            }
        });
    }

    /** @param array{is_closed: bool, opens_time: ?string, closes_time: ?string} $hours */
    public function setOverride(BranchModel $branch, string $date, array $hours): BranchHoursOverrideModel
    {
        return BranchHoursOverrideModel::query()->updateOrCreate(
            ['branch_id' => $branch->getKey(), 'override_date' => $date],
            $this->hoursAttributes($hours),
        );
    }

    public function clearOverride(BranchModel $branch, string $date): void
    {
        BranchHoursOverrideModel::query()->where('branch_id', $branch->getKey())->whereDate('override_date', $date)->delete();
    }

    /**
     * One entry per configured weekday. `opens_time`/`closes_time` span the whole
     * day (first open, last close) for clients that predate shifts.
     *
     * @return list<array{day_of_week: int, is_closed: bool, opens_time: ?string, closes_time: ?string, shifts: list<array{opens_time: string, closes_time: string}>}>
     */
    public function week(BranchModel $branch): array
    {
        return BranchOpeningHourModel::query()
            ->where('branch_id', $branch->getKey())
            ->orderBy('day_of_week')
            ->orderBy('opens_time')
            ->get()
            ->groupBy(fn (BranchOpeningHourModel $row): int => (int) $row->getAttribute('day_of_week'))
            ->map(fn (Collection $rows, int $day): array => ['day_of_week' => $day, ...$this->presentDay($rows->all())])
            ->values()
            ->all();
    }

    /**
     * The hours for one date, or null when the branch configured none.
     *
     * @return array{date: string, is_closed: bool, opens_time: ?string, closes_time: ?string, shifts: list<array{opens_time: string, closes_time: string}>, source: BranchHoursSource}|null
     */
    public function forDate(string $branchId, CarbonInterface $date): ?array
    {
        $override = BranchHoursOverrideModel::query()
            ->where('branch_id', $branchId)
            ->whereDate('override_date', $date->toDateString())
            ->first();
        if ($override instanceof BranchHoursOverrideModel) {
            return ['date' => $date->toDateString(), ...$this->presentDay([$override]), 'source' => BranchHoursSource::Override];
        }

        $weekly = BranchOpeningHourModel::query()
            ->where('branch_id', $branchId)
            ->where('day_of_week', $date->dayOfWeek)
            ->orderBy('opens_time')
            ->get();

        return $weekly->isNotEmpty()
            ? ['date' => $date->toDateString(), ...$this->presentDay($weekly->all()), 'source' => BranchHoursSource::Weekly]
            : null;
    }

    /** Whether `[startsAt, endsAt)` lies inside the branch's open hours that day. */
    public function covers(?string $branchId, CarbonInterface $startsAt, CarbonInterface $endsAt): bool
    {
        if ($branchId === null) {
            return true;
        }

        $configured = BranchOpeningHourModel::query()->where('branch_id', $branchId)->exists()
            || BranchHoursOverrideModel::query()->where('branch_id', $branchId)->whereDate('override_date', $startsAt->toDateString())->exists();
        if (! $configured) {
            return true;
        }

        $day = $this->forDate($branchId, $startsAt);
        if ($day === null || $day['is_closed']) {
            return false;
        }

        $start = $this->minutes($startsAt->format('H:i'));
        $end = $startsAt->isSameDay($endsAt)
            ? $this->minutes($endsAt->format('H:i'))
            : ($endsAt->equalTo($startsAt->copy()->addDay()->startOfDay()) ? 24 * 60 : PHP_INT_MAX);

        foreach ($day['shifts'] as $shift) {
            if ($start >= $this->minutes($shift['opens_time']) && $end <= $this->minutes($shift['closes_time'])) {
                return true;
            }
        }

        return false;
    }

    private function minutes(string $time): int
    {
        [$hours, $minutes] = array_map('intval', explode(':', $time));

        return $hours * 60 + $minutes;
    }

    /**
     * The rows stored for one weekly entry: one per shift, or a single closed row.
     *
     * @param  array<string, mixed>  $day
     * @return list<array{is_closed: bool, opens_time: ?string, closes_time: ?string}>
     */
    private function shiftRows(array $day): array
    {
        if ((bool) ($day['is_closed'] ?? false)) {
            return [['is_closed' => true, 'opens_time' => null, 'closes_time' => null]];
        }

        $shifts = $day['shifts'] ?? [['opens_time' => $day['opens_time'] ?? null, 'closes_time' => $day['closes_time'] ?? null]];

        return array_map(
            fn (array $shift): array => ['is_closed' => false, 'opens_time' => $shift['opens_time'], 'closes_time' => $shift['closes_time']],
            array_values($shifts),
        );
    }

    /**
     * @param  array{is_closed?: bool, opens_time?: ?string, closes_time?: ?string}  $hours
     * @return array{is_closed: bool, opens_time: ?string, closes_time: ?string}
     */
    private function hoursAttributes(array $hours): array
    {
        $closed = (bool) ($hours['is_closed'] ?? false);

        return [
            'is_closed' => $closed,
            'opens_time' => $closed ? null : ($hours['opens_time'] ?? null),
            'closes_time' => $closed ? null : ($hours['closes_time'] ?? null),
        ];
    }

    /**
     * @param  list<BranchOpeningHourModel|BranchHoursOverrideModel>  $rows
     * @return array{is_closed: bool, opens_time: ?string, closes_time: ?string, shifts: list<array{opens_time: string, closes_time: string}>}
     */
    private function presentDay(array $rows): array
    {
        $time = fn (mixed $value): ?string => is_string($value) && $value !== '' ? substr($value, 0, 5) : null;

        $shifts = [];
        foreach ($rows as $row) {
            $opens = $time($row->getAttribute('opens_time'));
            $closes = $time($row->getAttribute('closes_time'));
            if (! (bool) $row->getAttribute('is_closed') && $opens !== null && $closes !== null) {
                $shifts[] = ['opens_time' => $opens, 'closes_time' => $closes];
            }
        }
        usort($shifts, fn (array $a, array $b): int => $a['opens_time'] <=> $b['opens_time']);

        return [
            'is_closed' => $shifts === [],
            'opens_time' => $shifts[0]['opens_time'] ?? null,
            'closes_time' => $shifts === [] ? null : $shifts[array_key_last($shifts)]['closes_time'],
            'shifts' => $shifts,
        ];
    }
}
