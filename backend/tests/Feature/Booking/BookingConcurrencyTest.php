<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
    $this->branch = BranchModel::factory()->create();
    $this->service = OfferedServiceModel::factory()->create(['duration_minutes' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $this->branch->brand_id]);
    $this->actingAs($this->client, 'client');
});

it('rejects second booking when same chair+slot already confirmed', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $startsAt = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'starts_at' => $startsAt,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'starts_at' => $startsAt,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(409);
    expect(BookingModel::where('chair_id', $chair->id)
        ->whereNotIn('status', ['cancelled'])
        ->count()
    )->toBe(1);
});

it('allows bookings on different chairs for same starts_at', function () {
    $chairA = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $chairB = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $startsAt = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chairA->id,
        'starts_at' => $startsAt,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chairB->id,
        'starts_at' => $startsAt,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    expect(BookingModel::where('starts_at', Carbon::parse($startsAt)->toDateTimeString())->count())->toBe(2);
});

it('handles race condition: direct DB insert then API attempt', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $startsAt = Carbon::now()->addDay()->toIso8601ZuluString();

    BookingModel::create([
        'client_id' => $this->client->id,
        'chair_id' => $chair->id,
        'starts_at' => $startsAt,
        'ends_at' => Carbon::parse($startsAt)->addMinutes(30),
        'booking_status' => BookingStatus::Confirmed,
    ]);

    $response = $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'starts_at' => $startsAt,
        'service_ids' => [$this->service->id],
    ]);

    $response->assertStatus(409);
});

it('allows re-booking after cancellation on same chair+slot', function () {
    $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
    $startsAt = Carbon::now()->addDay()->toIso8601ZuluString();

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'starts_at' => $startsAt,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    $booking = BookingModel::first();
    $booking->update(['booking_status' => BookingStatus::Cancelled]);

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'starts_at' => $startsAt,
        'service_ids' => [$this->service->id],
    ])->assertCreated();

    expect(BookingModel::where('chair_id', $chair->id)
        ->where('starts_at', Carbon::parse($startsAt)->toDateTimeString())
        ->count()
    )->toBe(2);
});
