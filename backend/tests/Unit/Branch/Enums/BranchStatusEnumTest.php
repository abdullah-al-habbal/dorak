<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schema;
use Modules\Branch\Constants\BranchFloorPlanConstants;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Enums\FloorPlanCanvasUnit;

it('translates status labels in english and arabic', function () {
    app()->setLocale('en');
    expect(BranchStatusEnum::Enabled->label())->toBe('Enabled')
        ->and(BranchStatusEnum::Pending->label())->toBe('Pending');

    app()->setLocale('ar');
    expect(BranchStatusEnum::Disabled->label())->toBe('معطّل');
});

it('derives the default floor plan canvas unit from the enum', function () {
    expect(BranchFloorPlanConstants::BRANCH_FLOOR_PLAN_DEFAULT_CANVAS['unit'])
        ->toBe(FloorPlanCanvasUnit::Meters->value);
});

it('indexes the branches status column', function () {
    expect(Schema::hasIndex('branches', ['status']))->toBeTrue();
});
