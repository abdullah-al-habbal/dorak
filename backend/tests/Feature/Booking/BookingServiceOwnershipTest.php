<?php

declare(strict_types=1);

use Carbon\Carbon;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    $this->brand = BrandModel::factory()->create();
    $this->branch = BranchModel::factory()->create(['brand_id' => $this->brand->id]);
    $this->barber = BarberModel::factory()->create();
    $this->chair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $this->barber->id]);
    $this->slot = Carbon::tomorrow()->startOfDay()->addHours(10);
    $this->actingAs(ClientModel::factory()->create(), 'client');
    $this->serviceFor = fn (ServiceableTypeEnum $type, string $id) => OfferedServiceModel::factory()->create([
        'serviceable_type' => $type,
        'serviceable_id' => $id,
        'duration_minutes' => 30,
    ]);
    $this->book = fn (array $overrides = []) => $this->postJson('/api/v1/bookings', array_merge([
        'chair_id' => $this->chair->id,
        'time_slot' => $this->slot->toIso8601String(),
    ], $overrides));
});

it('accepts brand and chair-barber services', function (): void {
    $ids = [
        ($this->serviceFor)(ServiceableTypeEnum::Brand, $this->brand->id)->id,
        ($this->serviceFor)(ServiceableTypeEnum::Barber, $this->barber->id)->id,
    ];

    ($this->book)(['service_ids' => $ids])->assertCreated();

    $this->assertDatabaseCount('bookings', 1);
});

it('rejects a service owned by an unrelated brand', function (): void {
    $foreign = ($this->serviceFor)(ServiceableTypeEnum::Brand, BrandModel::factory()->create()->id);

    ($this->book)(['service_ids' => [$foreign->id]])->assertUnprocessable();

    $this->assertDatabaseCount('bookings', 0);
});

it('rejects a service owned by another barber', function (): void {
    $otherBarber = ($this->serviceFor)(ServiceableTypeEnum::Barber, BarberModel::factory()->create()->id);

    ($this->book)(['service_ids' => [$otherBarber->id]])->assertUnprocessable();

    $this->assertDatabaseCount('bookings', 0);
});

it('stores the chair barber when barber_id is omitted', function (): void {
    $service = ($this->serviceFor)(ServiceableTypeEnum::Brand, $this->brand->id);

    ($this->book)(['service_ids' => [$service->id]])
        ->assertCreated()
        ->assertJsonPath('data.barber.id', $this->barber->id);

    $this->assertDatabaseHas('bookings', ['chair_id' => $this->chair->id, 'barber_id' => $this->barber->id]);
});

it('returns 409 for the same barber on another chair at an overlapping time', function (): void {
    $service = ($this->serviceFor)(ServiceableTypeEnum::Brand, $this->brand->id);
    $otherChair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $this->barber->id]);

    ($this->book)(['service_ids' => [$service->id]])->assertCreated();
    ($this->book)(['chair_id' => $otherChair->id, 'service_ids' => [$service->id]])->assertStatus(409);

    $this->assertDatabaseCount('bookings', 1);
});

it('rejects a barber_id that differs from the chair barber', function (): void {
    $service = ($this->serviceFor)(ServiceableTypeEnum::Brand, $this->brand->id);

    ($this->book)([
        'barber_id' => BarberModel::factory()->create()->id,
        'service_ids' => [$service->id],
    ])->assertUnprocessable();

    $this->assertDatabaseCount('bookings', 0);
});
