<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

/**
 * Weekdays travel as integers 0 (Sunday) to 6 (Saturday), matching Carbon's
 * `dayOfWeek`. `branch_opening_hours.weekday` and `barber_schedules.day_of_week`
 * share this range.
 */
final class WeekdayConstants
{
    public const int WEEKDAY_MIN = 0;

    public const int WEEKDAY_MAX = 6;

    public const int WEEKDAY_DAYS_IN_WEEK = 7;

    /** Validation rule for a weekday integer. */
    public static function betweenRule(): string
    {
        return 'between:'.self::WEEKDAY_MIN.','.self::WEEKDAY_MAX;
    }
}
