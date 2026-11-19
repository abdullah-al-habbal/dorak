<?php

declare(strict_types=1);

use Modules\Booking\Constants\BookingConstants;
use Modules\Client\Models\ClientModel;
use Modules\Explore\Constants\ExploreRateLimitConstants;

const THROTTLE_MISSING_ID = '00000000-0000-4000-8000-000000000001';

/** Sends the request `$allowed` times (none may be 429), then one more that must be 429. */
function exhaust(callable $send, int $allowed): void
{
    for ($i = 0; $i < $allowed; $i++) {
        expect($send()->getStatusCode())->not->toBe(429, "request {$i} of {$allowed} was throttled");
    }

    $send()->assertTooManyRequests();
}

describe('booking writes', function (): void {
    it('limits creating bookings per client', function (): void {
        $client = ClientModel::factory()->create();
        $this->actingAs($client, 'client');

        exhaust(fn () => $this->postJson('/api/v1/bookings', []), BookingConstants::BOOKING_WRITE_PER_MINUTE);
    });

    it('counts cancelling in the same budget as creating', function (): void {
        $this->actingAs(ClientModel::factory()->create(), 'client');

        for ($i = 0; $i < BookingConstants::BOOKING_WRITE_PER_MINUTE; $i++) {
            $this->postJson('/api/v1/client/bookings/'.THROTTLE_MISSING_ID.'/cancel');
        }

        $this->postJson('/api/v1/bookings', [])->assertTooManyRequests();
    });

    it('does not let one client exhaust another client\'s budget', function (): void {
        $this->actingAs(ClientModel::factory()->create(), 'client');
        exhaust(fn () => $this->postJson('/api/v1/bookings', []), BookingConstants::BOOKING_WRITE_PER_MINUTE);

        $this->actingAs(ClientModel::factory()->create(), 'client');
        expect($this->postJson('/api/v1/bookings', [])->getStatusCode())->not->toBe(429);
    });
});

describe('booking reads', function (): void {
    it('limits listing bookings per client without touching the write budget', function (): void {
        $this->actingAs(ClientModel::factory()->create(), 'client');

        exhaust(fn () => $this->getJson('/api/v1/bookings'), BookingConstants::BOOKING_READ_PER_MINUTE);

        expect($this->postJson('/api/v1/bookings', [])->getStatusCode())->not->toBe(429);
    });
});

describe('public availability and discovery', function (): void {
    it('limits slot lookups per IP', function (): void {
        exhaust(
            fn () => $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.7'])->getJson('/api/v1/branches/'.THROTTLE_MISSING_ID.'/slots'),
            BookingConstants::BOOKING_SLOTS_PER_MINUTE,
        );

        expect($this->withServerVariables(['REMOTE_ADDR' => '198.51.100.8'])->getJson('/api/v1/barbers/'.THROTTLE_MISSING_ID.'/slots')->getStatusCode())->not->toBe(429);
    });

    it('limits explore requests per IP across its endpoints', function (): void {
        $send = fn (string $path) => $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.9'])->getJson($path);

        for ($i = 0; $i < ExploreRateLimitConstants::EXPLORE_PER_MINUTE; $i++) {
            expect($send('/api/v1/explore/search')->getStatusCode())->not->toBe(429);
        }

        $send('/api/v1/explore/branches')->assertTooManyRequests();
        expect($this->withServerVariables(['REMOTE_ADDR' => '198.51.100.10'])->getJson('/api/v1/explore/search')->getStatusCode())->not->toBe(429);
    });
});
