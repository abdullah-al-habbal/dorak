<?php

declare(strict_types=1);

namespace Modules\Branch\Support;

use Modules\Core\Constants\WeekdayConstants;

/**
 * Validation for a list of weekly opening-hour entries (Task 51), shared by the
 * branch-account and dashboard endpoints. Times are `H:i`. A day is closed, or
 * carries `shifts` (a split day), or carries the legacy single interval
 * (`opens_time`/`closes_time`); when `shifts` is present it wins.
 */
final class OpeningHoursRules
{
    public const int MAX_SHIFTS_PER_DAY = 4;

    /** @return array<string, array<int, mixed>> */
    public static function week(string $prefix, bool $required = true): array
    {
        return [
            $prefix => [$required ? 'required' : 'sometimes', 'array', 'min:1', 'max:'.WeekdayConstants::WEEKDAY_DAYS_IN_WEEK],
            "{$prefix}.*.day_of_week" => ['required', 'integer', WeekdayConstants::betweenRule(), 'distinct'],
            ...self::weekDay("{$prefix}.*."),
        ];
    }

    /**
     * One weekly entry: closed, split into shifts, or the legacy single interval.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function weekDay(string $prefix): array
    {
        return [
            "{$prefix}is_closed" => ['sometimes', 'boolean'],
            "{$prefix}shifts" => ["exclude_if:{$prefix}is_closed,true", 'sometimes', 'array', 'min:1', 'max:'.self::MAX_SHIFTS_PER_DAY, new NonOverlappingShiftsRule],
            "{$prefix}shifts.*.opens_time" => ['required', 'date_format:H:i'],
            "{$prefix}shifts.*.closes_time" => ['required', 'date_format:H:i', "after:{$prefix}shifts.*.opens_time"],
            "{$prefix}opens_time" => ["exclude_if:{$prefix}is_closed,true", "required_without:{$prefix}shifts", 'date_format:H:i'],
            "{$prefix}closes_time" => ["exclude_if:{$prefix}is_closed,true", "required_without:{$prefix}shifts", 'date_format:H:i', "after:{$prefix}opens_time"],
        ];
    }

    /**
     * A single interval, used by dated overrides.
     *
     * @return array<string, array<int, string>>
     */
    public static function day(string $prefix = ''): array
    {
        return [
            "{$prefix}is_closed" => ['sometimes', 'boolean'],
            "{$prefix}opens_time" => ["exclude_if:{$prefix}is_closed,true", 'required', 'date_format:H:i'],
            "{$prefix}closes_time" => ["exclude_if:{$prefix}is_closed,true", 'required', 'date_format:H:i', "after:{$prefix}opens_time"],
        ];
    }
}
