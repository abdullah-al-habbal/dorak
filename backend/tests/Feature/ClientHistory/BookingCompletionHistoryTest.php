<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\ClientRecommendation\Enums\EdgeTypeEnum;
use Modules\ClientRecommendation\Models\RecommendationEdgeModel;
use Modules\OfferedService\Models\OfferedServiceModel;

it('records a null-barber booking service and a branch history edge', function (): void {
    $branch = BranchModel::factory()->create();
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
    $booking = BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'barber_id' => null,
        'status' => BookingStatus::Confirmed,
    ]);
    $service = OfferedServiceModel::factory()->create();
    $booking->services()->attach($service->id);
    $booking->update(['status' => BookingStatus::Completed]);

    $history = ClientServiceHistoryModel::query()->where('booking_id', $booking->id)->sole();
    expect($history->barber_id)->toBeNull()
        ->and($history->offered_service_id)->toBe($service->id);
    $edge = RecommendationEdgeModel::query()
        ->where('source_id', $booking->client_id)
        ->where('target_type', 'branch')
        ->where('target_id', $branch->id)
        ->where('edge_type', EdgeTypeEnum::History)
        ->sole();
    expect($edge->target_id)->toBe($branch->id)
        ->and(RecommendationEdgeModel::query()->where('source_id', $booking->client_id)->whereNull('target_id')->exists())->toBeFalse();

    $this->actingAs($booking->client, 'client')
        ->getJson('/api/v1/client/history')
        ->assertOk()
        ->assertJsonPath('data.0.barber', null);
});

it('uses the chair barber when the booking barber is null', function (): void {
    $barber = BarberModel::factory()->create();
    $chair = ChairModel::factory()->create(['barber_id' => $barber->id]);
    $booking = BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'barber_id' => null,
        'status' => BookingStatus::Confirmed,
    ]);
    $booking->services()->attach(OfferedServiceModel::factory()->create()->id);
    $booking->update(['status' => BookingStatus::Completed]);

    expect(ClientServiceHistoryModel::query()->where('booking_id', $booking->id)->sole()->barber_id)->toBe($barber->id);
    expect(RecommendationEdgeModel::query()
        ->where('source_id', $booking->client_id)
        ->where('target_type', 'barber')
        ->where('target_id', $barber->id)
        ->where('edge_type', EdgeTypeEnum::History)
        ->exists())->toBeTrue();
});

it('writes one history row for every booked service', function (): void {
    $booking = BookingModel::factory()->create(['status' => BookingStatus::Confirmed]);
    $services = OfferedServiceModel::factory()->count(2)->create();
    $booking->services()->attach($services->modelKeys());
    $booking->update(['status' => BookingStatus::Completed]);

    expect(ClientServiceHistoryModel::query()->where('booking_id', $booking->id)->count())->toBe(2)
        ->and(ClientServiceHistoryModel::query()->where('booking_id', $booking->id)->pluck('offered_service_id')->all())
        ->toContain(...$services->modelKeys());
});

it('completes an unassigned booking through the branch endpoint', function (): void {
    $branch = BranchModel::factory()->create();
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'barber_id' => null]);
    $this->actingAs($branch, 'branch_api')
        ->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['status' => BookingStatus::Completed->value])
        ->assertOk()
        ->assertJsonPath('data.status', BookingStatus::Completed->value);

    expect($booking->fresh()->status)->toBe(BookingStatus::Completed);
});

it('completes an unassigned booking through the dashboard endpoint', function (): void {
    $branch = BranchModel::factory()->create();
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
    $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'barber_id' => null]);
    $this->authenticateDashboardActor($branch)
        ->patchJson("/api/v1/dashboard/bookings/{$booking->id}", ['status' => BookingStatus::InProgress->value])
        ->assertOk();
    $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}", ['status' => BookingStatus::Completed->value])
        ->assertOk()
        ->assertJsonPath('data.status', BookingStatus::Completed->value);

    expect($booking->fresh()->status)->toBe(BookingStatus::Completed);
});

it('keeps the barber completion endpoint scoped to assigned bookings', function (): void {
    $barber = BarberModel::factory()->create();
    $chair = ChairModel::factory()->create(['barber_id' => null]);
    $booking = BookingModel::factory()->create([
        'chair_id' => $chair->id,
        'barber_id' => null,
        'status' => BookingStatus::InProgress,
    ]);

    $this->actingAs($barber, 'barber')
        ->patchJson("/api/v1/barber/bookings/{$booking->id}/complete")
        ->assertForbidden();

    expect($booking->fresh()->status)->toBe(BookingStatus::InProgress);
});
