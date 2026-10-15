<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;

it('reports chair availability for the requested future interval', function () {
    $branch = BranchModel::factory()->create();
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
    $startsAt = Carbon::tomorrow()->setTime(15, 0);

    BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'time_slot' => $startsAt,
        'ends_at' => $startsAt->copy()->addMinutes(30),
        'status' => BookingStatus::Confirmed,
    ]);

    $response = $this->getJson('/api/v1/branches/'.$branch->id.'/floor-plan?'.http_build_query([
        'starts_at' => $startsAt->copy()->addMinutes(15)->toIso8601ZuluString(),
        'duration' => 30,
    ]));

    $response->assertOk();
    expect($response->json('data.chairs.0.availability'))->toBe('occupied');
});

it('does not mark a chair occupied outside the requested future interval', function () {
    $branch = BranchModel::factory()->create();
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
    $startsAt = Carbon::tomorrow()->setTime(15, 0);

    BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'time_slot' => $startsAt,
        'ends_at' => $startsAt->copy()->addMinutes(30),
        'status' => BookingStatus::InProgress,
    ]);

    $response = $this->getJson('/api/v1/branches/'.$branch->id.'/floor-plan?'.http_build_query([
        'starts_at' => $startsAt->copy()->setTime(16, 0)->toIso8601ZuluString(),
        'duration' => 30,
    ]));

    $response->assertOk();
    expect($response->json('data.chairs.0.availability'))->toBe('available');
});

it('requires a future availability interval', function () {
    $branch = BranchModel::factory()->create();

    $this->getJson("/api/v1/branches/{$branch->id}/floor-plan")->assertUnprocessable();
});
