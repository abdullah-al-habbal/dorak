<?php

declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Modules\Ban\Models\BanModel;
use Modules\Barber\Models\BarberModel;
use Modules\Barber\Models\BarberScheduleModel;
use Modules\Booking\Enums\BookingPaymentMethod;
use Modules\Booking\Enums\BookingPaymentStatus;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Events\BookingCreatedEvent;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\ClientHistory\Models\ClientServiceHistoryModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

function rebookHistory(ClientModel $client, BarberModel $barber, ?string $branchId = null): ClientServiceHistoryModel
{
    $service = OfferedServiceModel::factory()->create([
        'serviceable_id' => $barber->id,
        'serviceable_type' => ServiceableTypeEnum::Barber,
    ]);

    return ClientServiceHistoryModel::query()->create([
        'client_id' => $client->id,
        'barber_id' => $barber->id,
        'branch_id' => $branchId,
        'offered_service_id' => $service->id,
        'performed_at' => now()->subDay(),
    ]);
}

function rebookAt(ClientModel $client, ClientServiceHistoryModel $history, $startsAt)
{
    return test()->actingAs($client, 'client')
        ->postJson("/api/v1/client/history/{$history->id}/rebook", [
            'starts_at' => $startsAt->toIso8601String(),
        ]);
}

it('creates a pending booking through the booking engine and dispatches its side effects', function (): void {
    Queue::fake();
    Event::fake();
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $branch = BranchModel::factory()->create();
    $history = rebookHistory($client, $barber, $branch->id);
    $slot = now()->addDays(3)->startOfDay()->addHours(10);

    rebookAt($client, $history, $slot)
        ->assertCreated()
        ->assertJsonPath('data.booking_status', BookingStatus::Pending->value)
        ->assertJsonPath('data.payment_method', BookingPaymentMethod::PayAtSalon->value)
        ->assertJsonPath('data.payment_status', BookingPaymentStatus::UnpaidInPerson->value);

    $this->assertDatabaseHas('bookings', [
        'client_id' => $client->id,
        'barber_id' => $barber->id,
        'booking_status' => BookingStatus::Pending->value,
        'payment_method' => BookingPaymentMethod::PayAtSalon->value,
        'payment_status' => BookingPaymentStatus::UnpaidInPerson->value,
    ]);
    Queue::assertPushed(SendBookingStatusNotificationJob::class);
    Event::assertDispatched(BookingCreatedEvent::class);
});

it('rejects an overlapping rebook without creating another booking', function (BookingStatus $status): void {
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $history = rebookHistory($client, $barber);
    $slot = now()->addDays(3)->startOfDay()->addHours(10);
    BookingModel::factory()->create([
        'barber_id' => $barber->id,
        'chair_id' => null,
        'starts_at' => $slot,
        'ends_at' => $slot->copy()->addHour(),
        'booking_status' => $status,
    ]);

    rebookAt($client, $history, $slot)
        ->assertConflict();

    $this->assertDatabaseCount('bookings', 1);
})->with([
    BookingStatus::Pending,
    BookingStatus::Confirmed,
    BookingStatus::InProgress,
]);

it('forbids rebooking a history record owned by another client', function (): void {
    $owner = ClientModel::factory()->create();
    $actor = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $history = rebookHistory($owner, $barber);

    rebookAt($actor, $history, now()->addDays(3)->startOfDay()->addHours(10))
        ->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
});

it('rejects a rebook when the client or barber has an active ban', function (string $actor): void {
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $history = rebookHistory($client, $barber);

    if ($actor === 'client') {
        BanModel::query()->create([
            'bannable_id' => $client->id,
            'bannable_type' => 'client',
            'reason' => 'test',
            'banned_at' => now()->subMinute(),
        ]);
    } else {
        $barber->bans()->create([
            'reason' => 'test',
            'banned_at' => now()->subMinute(),
        ]);
    }

    rebookAt($client, $history, now()->addDays(3)->startOfDay()->addHours(10))
        ->assertForbidden();

    $this->assertDatabaseCount('bookings', 0);
})->with(['client', 'barber']);

it('rejects times outside a configured active barber schedule', function (): void {
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $history = rebookHistory($client, $barber);
    $slot = now()->addDays(3)->startOfDay()->addHours(18);
    BarberScheduleModel::factory()->create([
        'barber_id' => $barber->id,
        'day_of_week' => $slot->dayOfWeek,
        'start_time' => '09:00',
        'end_time' => '17:00',
        'is_active' => true,
    ]);

    rebookAt($client, $history, $slot)
        ->assertUnprocessable()
        ->assertJsonPath('code', 'booking_outside_schedule');

    $this->assertDatabaseCount('bookings', 0);
});

it('rejects a rebook for a service that is no longer active', function (): void {
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $history = rebookHistory($client, $barber);
    OfferedServiceModel::query()
        ->whereKey($history->offered_service_id)
        ->update(['is_active' => false]);

    rebookAt($client, $history, now()->addDays(3)->startOfDay()->addHours(10))
        ->assertUnprocessable();

    $this->assertDatabaseCount('bookings', 0);
});

it('rejects a rebook when the original chair is unavailable', function (): void {
    $client = ClientModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $branch = BranchModel::factory()->create();
    $chair = ChairModel::factory()->maintenance()->create([
        'branch_id' => $branch->id,
        'barber_id' => $barber->id,
    ]);
    $sourceBooking = BookingModel::factory()->completed()->create([
        'client_id' => $client->id,
        'barber_id' => $barber->id,
        'chair_id' => $chair->id,
    ]);
    $service = OfferedServiceModel::factory()->create([
        'serviceable_id' => $barber->id,
        'serviceable_type' => ServiceableTypeEnum::Barber,
    ]);
    $sourceBooking->services()->attach($service->id);
    $history = ClientServiceHistoryModel::query()->create([
        'client_id' => $client->id,
        'barber_id' => $barber->id,
        'branch_id' => $branch->id,
        'booking_id' => $sourceBooking->id,
        'offered_service_id' => $service->id,
        'performed_at' => now()->subDay(),
    ]);

    rebookAt($client, $history, now()->addDays(3)->startOfDay()->addHours(10))
        ->assertConflict();

    $this->assertDatabaseCount('bookings', 1);
    expect($chair->status)->toBe(ChairStatus::Maintenance);
});

describe('rebook at a branch time (BG-55)', function (): void {
    beforeEach(function (): void {
        Queue::fake();
        Event::fake();
        $this->travelTo(Carbon::parse('2026-12-01 00:00:00', 'UTC'));
        $this->client = ClientModel::factory()->create();
        $branch = BranchModel::factory()->create();
        $this->history = rebookHistory($this->client, BarberModel::factory()->create(), $branch->id);
        $this->rebook = fn (array $body) => $this->actingAs($this->client, 'client')
            ->postJson("/api/v1/client/history/{$this->history->id}/rebook", $body);
    });

    it('reads starts_at_local on the clock of the visit branch', function (): void {
        ($this->rebook)(['starts_at_local' => '2026-12-02T09:00'])
            ->assertCreated()
            ->assertJsonPath('data.starts_at', '2026-12-02T06:00:00+00:00');
    });

    it('refuses a branch time that has already passed there', function (): void {
        // 02:00 in Damascus on the 1st is 23:00 UTC on the 30th.
        ($this->rebook)(['starts_at_local' => '2026-12-01T02:00'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['starts_at_local']);

        expect(BookingModel::query()->count())->toBe(0);
    });

    it('refuses a request with both times or neither', function (array $body, string $field): void {
        ($this->rebook)($body)->assertUnprocessable()->assertJsonValidationErrors([$field]);

        expect(BookingModel::query()->count())->toBe(0);
    })->with([
        'both' => [['starts_at' => '2026-12-02T06:00:00Z', 'starts_at_local' => '2026-12-02T09:00'], 'starts_at'],
        'neither' => [[], 'starts_at'],
    ]);

    it('sends the offset of a past visit with the history', function (): void {
        $this->actingAs($this->client, 'client')->getJson('/api/v1/client/history')
            ->assertOk()
            ->assertJsonPath('data.0.utc_offset_minutes', 180);
    });
});
