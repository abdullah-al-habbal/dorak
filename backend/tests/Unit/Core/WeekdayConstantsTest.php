<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Validator;
use Modules\Branch\Support\OpeningHoursRules;
use Modules\Core\Constants\WeekdayConstants;

describe('WeekdayConstants', function (): void {
    it('keeps weekdays on the 0 to 6 range', function (): void {
        expect(WeekdayConstants::betweenRule())->toBe('between:0,6')
            ->and(WeekdayConstants::WEEKDAY_DAYS_IN_WEEK)->toBe(7);
    });

    it('applies the shared range to opening hours', function (): void {
        $entry = fn (int $weekday): array => ['hours' => [['weekday' => $weekday, 'is_closed' => true]]];
        $rules = OpeningHoursRules::week('hours');

        expect(Validator::make($entry(6), $rules)->passes())->toBeTrue()
            ->and(Validator::make($entry(7), $rules)->passes())->toBeFalse();
    });
});
