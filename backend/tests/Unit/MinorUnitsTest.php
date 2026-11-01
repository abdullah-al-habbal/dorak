<?php

declare(strict_types=1);

use Modules\Currency\Support\MinorUnits;

it('converts integer minor units to a major-unit decimal', function (): void {
    expect(MinorUnits::toMajor(1250))->toBe(12.5)
        ->and(MinorUnits::toMajor('7'))->toBe(0.07)
        ->and(MinorUnits::toMajor(0))->toBe(0.0);
});
