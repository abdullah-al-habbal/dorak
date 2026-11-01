<?php

declare(strict_types=1);

namespace Modules\Branch\Support;

use Modules\Core\Constants\WeekdayConstants;

/**
 * Validation for a list of weekly opening-hour entries (Task 51), shared by the
 * branch-account and dashboard endpoints. Times are `H:i`; a day that is not
 * closed needs both times and must close after it opens.
 */
final class OpeningHoursRules
{
    /** @return array<string, array<int, string>> */
    public static function week(string $prefix, bool $required = true): array
    {
        return [
            $prefix => [$required ? 'required' : 'sometimes', 'array', 'min:1', 'max:'.WeekdayConstants::WEEKDAY_DAYS_IN_WEEK],
            "{$prefix}.*.weekday" => ['required', 'integer', WeekdayConstants::betweenRule(), 'distinct'],
            ...self::day("{$prefix}.*."),
        ];
    }

    /** @return array<string, array<int, string>> */
    public static function day(string $prefix = ''): array
    {
        return [
            "{$prefix}is_closed" => ['sometimes', 'boolean'],
            "{$prefix}opens_at" => ["exclude_if:{$prefix}is_closed,true", 'required', 'date_format:H:i'],
            "{$prefix}closes_at" => ["exclude_if:{$prefix}is_closed,true", 'required', 'date_format:H:i', "after:{$prefix}opens_at"],
        ];
    }
}
