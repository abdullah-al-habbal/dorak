<?php

declare(strict_types=1);

use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\VenueUniverse;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

it('excludes inactive and banned branches from explore and brand listings', function (): void {
    $brand = BrandModel::factory()->create(['universe' => VenueUniverse::Men]);
    $active = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Enabled, 'latitude' => 33.5, 'longitude' => 36.3]);
    $disabled = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Disabled, 'latitude' => 33.5, 'longitude' => 36.3]);
    $banned = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Enabled, 'latitude' => 33.5, 'longitude' => 36.3]);
    $banned->bans()->create(['reason' => 'policy', 'banned_from' => now()->subMinute()]);

    $this->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=1000&universe=men')
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $active->id);
    $this->getJson("/api/v1/explore/branches/{$disabled->id}")->assertNotFound();
    $this->getJson("/api/v1/brands/{$brand->id}")
        ->assertOk()->assertJsonPath('data.branches_count', 1);
});

it('excludes inactive and banned barbers from explore and detail', function (): void {
    $active = BarberModel::factory()->freelancer()->create(['status' => BarberStatusEnum::Enabled, 'latitude' => 33.5, 'longitude' => 36.3]);
    BarberModel::factory()->freelancer()->create(['status' => BarberStatusEnum::Disabled, 'latitude' => 33.5, 'longitude' => 36.3]);
    $banned = BarberModel::factory()->freelancer()->create(['status' => BarberStatusEnum::Enabled, 'latitude' => 33.5, 'longitude' => 36.3]);
    $banned->bans()->create(['reason' => 'policy', 'banned_from' => now()->subMinute()]);

    $this->getJson('/api/v1/explore/barbers?latitude=33.5&longitude=36.3&radius=1000')
        ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $active->id);
    $this->getJson("/api/v1/explore/barbers/{$banned->id}")->assertNotFound();
});

it('rejects booking a chair in an inactive branch with 422', function (): void {
    $client = ClientModel::factory()->create();
    $token = $client->createToken('booking-test', ['client-active'])->plainTextToken;
    $chair = ChairModel::factory()->create();
    $chair->branch->update(['status' => BranchStatusEnum::Disabled]);
    $service = OfferedServiceModel::factory()->create(['duration_minutes' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $chair->branch->brand_id]);

    $this->withToken($token)->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'time_slot' => now()->addDay()->toIso8601ZuluString(),
        'service_ids' => [$service->id],
    ])->assertUnprocessable()->assertJsonPath('code', 'ENTITY_NOT_DISCOVERABLE');

    expect(BookingModel::query()->count())->toBe(0);
});

it('hides an inactive branch floor plan', function (): void {
    $branch = BranchModel::factory()->create(['status' => BranchStatusEnum::Disabled]);

    $this->getJson('/api/v1/branches/'.$branch->id.'/floor-plan?'.http_build_query([
        'starts_at' => now()->addDay()->toIso8601ZuluString(),
        'duration_minutes' => 30,
    ]))
        ->assertNotFound();
});
