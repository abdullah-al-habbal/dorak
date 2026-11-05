<?php

declare(strict_types=1);

namespace Modules\Branch\Support;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Shifts of one day must not overlap. A shift may start exactly when the
 * previous one ends. Malformed entries are skipped; their own rules report them.
 */
final class NonOverlappingShiftsRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_array($value)) {
            return;
        }

        $intervals = [];
        foreach ($value as $shift) {
            $opens = is_array($shift) ? self::minutes($shift['opens_time'] ?? null) : null;
            $closes = is_array($shift) ? self::minutes($shift['closes_time'] ?? null) : null;
            if ($opens !== null && $closes !== null) {
                $intervals[] = [$opens, $closes];
            }
        }
        usort($intervals, fn (array $a, array $b): int => $a[0] <=> $b[0]);

        for ($i = 1; $i < count($intervals); $i++) {
            if ($intervals[$i][0] < $intervals[$i - 1][1]) {
                $fail('dashboard::messages.shifts_overlap')->translate();

                return;
            }
        }
    }

    private static function minutes(mixed $time): ?int
    {
        if (! is_string($time) || preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $time, $parts) !== 1) {
            return null;
        }

        return (int) $parts[1] * 60 + (int) $parts[2];
    }
}
