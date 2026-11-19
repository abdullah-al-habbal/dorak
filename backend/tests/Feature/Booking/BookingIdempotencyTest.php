<?php

declare(strict_types=1);

use Carbon\Carbon;
use Illuminate\Console\Scheduling\Event as ScheduledEvent;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Event;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Constants\BookingConstants;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Events\BookingCreatedEvent;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingIdempotencyKeyModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

const IDEMPOTENCY_KEY = 'submit-0001-abcd';

beforeEach(function (): void {
    $this->branch = BranchModel::factory()->create();
    $this->barber = BarberModel::factory()->create();
    BarberAffiliationModel::factory()->create(['barber_id' => $this->barber->id, 'affiliable_id' => $this->branch->id]);
    $this->service = OfferedServiceModel::factory()->create([
        'serviceable_type' => ServiceableTypeEnum::Brand,
        'serviceable_id' => $this->branch->brand_id,
        'duration_minutes' => 30,
    ]);
    $this->slot = Carbon::tomorrow()->startOfDay()->addHours(10);
    $this->client = ClientModel::factory()->create();
    $this->actingAs($this->client, 'client');
    $this->book = fn (?string $key = IDEMPOTENCY_KEY, array $overrides = []) => $this
        ->withHeaders($key === null ? [] : [BookingConstants::BOOKING_IDEMPOTENCY_HEADER => $key])
        ->postJson('/api/v1/bookings', array_merge([
            'barber_id' => $this->barber->id,
            'branch_id' => $this->branch->id,
            'starts_at' => $this->slot->toIso8601ZuluString(),
            'service_ids' => [$this->service->id],
        ], $overrides));
});

it('returns the original booking for a retry with the same key and body, without a second booking or side effects', function (): void {
    Bus::fake([SendBookingStatusNotificationJob::class]);
    Event::fake([BookingCreatedEvent::class]);

    $first = ($this->book)()->assertCreated();
    $retry = ($this->book)()->assertCreated()->assertHeader(BookingConstants::BOOKING_IDEMPOTENCY_REPLAYED_HEADER, 'true');

    expect($retry->json('data.id'))->toBe($first->json('data.id'))
        ->and($first->headers->has(BookingConstants::BOOKING_IDEMPOTENCY_REPLAYED_HEADER))->toBeFalse()
        ->and(BookingModel::query()->count())->toBe(1)
        ->and(BookingIdempotencyKeyModel::query()->count())->toBe(1);
    Bus::assertDispatchedTimes(SendBookingStatusNotificationJob::class, 1);
    Event::assertDispatchedTimes(BookingCreatedEvent::class, 1);
});

it('requires the key: a missing or blank header is refused and nothing is created', function (?string $key): void {
    $this->omitBookingIdempotencyKey = true;

    ($this->book)($key)->assertUnprocessable()->assertJsonValidationErrors('idempotency_key');

    expect(BookingModel::query()->count())->toBe(0)
        ->and(BookingIdempotencyKeyModel::query()->count())->toBe(0);
})->with([
    'missing' => [null],
    'blank' => [''],
]);

it('refuses the same key with a different request and creates nothing', function (): void {
    ($this->book)()->assertCreated();

    ($this->book)(IDEMPOTENCY_KEY, ['starts_at' => $this->slot->copy()->addHours(2)->toIso8601ZuluString()])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'idempotency_key_reused');

    expect(BookingModel::query()->count())->toBe(1);
});

it('does not depend on the order of service ids', function (): void {
    $second = OfferedServiceModel::factory()->create([
        'serviceable_type' => ServiceableTypeEnum::Brand,
        'serviceable_id' => $this->branch->brand_id,
        'duration_minutes' => 15,
    ]);

    $first = ($this->book)(IDEMPOTENCY_KEY, ['service_ids' => [$this->service->id, $second->id]])->assertCreated();
    $retry = ($this->book)(IDEMPOTENCY_KEY, ['service_ids' => [$second->id, $this->service->id]])->assertCreated();

    expect($retry->json('data.id'))->toBe($first->json('data.id'));
});

it('scopes a key to its client', function (): void {
    ($this->book)()->assertCreated();
    $this->actingAs(ClientModel::factory()->create(), 'client');
    $other = $this->book;

    // Same key, other client: not a replay. The slot is taken, so this is an ordinary double booking.
    $other()->assertStatus(409);
    expect(BookingIdempotencyKeyModel::query()->count())->toBe(1);
});

it('stores no key for a failed attempt, so the retry can succeed once the slot is free', function (): void {
    $blocker = BookingModel::factory()->create([
        'barber_id' => $this->barber->id,
        'branch_id' => $this->branch->id,
        'booking_status' => BookingStatus::Confirmed->value,
        'starts_at' => $this->slot,
        'ends_at' => $this->slot->copy()->addMinutes(30),
    ]);

    ($this->book)()->assertStatus(409);
    expect(BookingIdempotencyKeyModel::query()->count())->toBe(0);

    $blocker->update(['booking_status' => BookingStatus::Cancelled->value]);
    ($this->book)()->assertCreated();
    expect(BookingIdempotencyKeyModel::query()->count())->toBe(1);
});

it('forgets an expired key and lets it create a new booking', function (): void {
    $first = ($this->book)()->assertCreated();
    BookingModel::query()->whereKey($first->json('data.id'))->update(['booking_status' => BookingStatus::Cancelled->value]);
    BookingIdempotencyKeyModel::query()->update(['expires_at' => now()->subMinute()]);

    $second = ($this->book)()->assertCreated();

    expect($second->json('data.id'))->not->toBe($first->json('data.id'))
        ->and($second->headers->has(BookingConstants::BOOKING_IDEMPOTENCY_REPLAYED_HEADER))->toBeFalse()
        ->and(BookingIdempotencyKeyModel::query()->count())->toBe(1);
});

it('rejects a malformed key', function (string $key): void {
    ($this->book)($key)->assertUnprocessable();

    expect(BookingModel::query()->count())->toBe(0);
})->with([
    'too short' => ['short'],
    'too long' => [str_repeat('a', BookingConstants::BOOKING_IDEMPOTENCY_KEY_MAX_LENGTH + 1)],
    'illegal characters' => ['has spaces and <tags>'],
]);

it('ignores an idempotency_key field in the body', function (): void {
    $this->omitBookingIdempotencyKey = true;

    ($this->book)(null, ['idempotency_key' => IDEMPOTENCY_KEY])->assertUnprocessable()->assertJsonValidationErrors('idempotency_key');

    expect(BookingModel::query()->count())->toBe(0);
});

it('prunes expired keys daily and keeps live ones', function (): void {
    $first = ($this->book)()->assertCreated();
    $kept = BookingIdempotencyKeyModel::query()->firstOrFail();
    $expired = BookingIdempotencyKeyModel::query()->create([
        'client_id' => $this->client->id,
        'booking_id' => $first->json('data.id'),
        'key' => 'expired-key-0001',
        'request_hash' => str_repeat('a', 64),
        'expires_at' => now()->subMinute(),
    ]);

    $this->artisan('model:prune', ['--model' => [BookingIdempotencyKeyModel::class]])->assertSuccessful();

    expect(BookingIdempotencyKeyModel::query()->find($expired->id))->toBeNull()
        ->and(BookingIdempotencyKeyModel::query()->find($kept->id))->not->toBeNull();
    $commands = collect(app(Schedule::class)->events())->map(fn (ScheduledEvent $event): string => (string) $event->command);
    expect($commands->contains(fn (string $command): bool => str_contains($command, 'model:prune') && str_contains($command, 'BookingIdempotencyKeyModel')))->toBeTrue();
});

it('removes a key together with its booking', function (): void {
    ($this->book)()->assertCreated();

    BookingModel::query()->delete();

    expect(BookingIdempotencyKeyModel::query()->count())->toBe(0);
});
