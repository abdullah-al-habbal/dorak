<?php

declare(strict_types=1);

use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Client\Models\ClientModel;

beforeEach(function () {
    $this->client = ClientModel::factory()->create();
    $this->actingAs($this->client, 'client');
});

function seedBooking(ClientModel $client, BookingStatus $status, bool $future): BookingModel
{
    $start = $future ? now()->addDay() : now()->subDay();

    return BookingModel::factory()->create([
        'client_id' => $client->id,
        'booking_status' => $status->value,
        'starts_at' => $start,
        'ends_at' => $start->copy()->addMinutes(30),
    ]);
}

function listedIds(string $filter): array
{
    return collect(test()->getJson("/api/v1/bookings?status={$filter}&per_page=50")->json('data'))
        ->pluck('id')
        ->all();
}

it('places a new pending booking in upcoming', function () {
    $pending = seedBooking($this->client, BookingStatus::Pending, true);

    expect(listedIds('upcoming'))->toContain($pending->id)
        ->and(listedIds('past'))->not->toContain($pending->id);
});

it('puts in_progress in upcoming even after its end time', function () {
    $live = seedBooking($this->client, BookingStatus::InProgress, false);

    expect(listedIds('upcoming'))->toContain($live->id)
        ->and(listedIds('past'))->not->toContain($live->id);
});

it('puts no_show in past', function () {
    $noShow = seedBooking($this->client, BookingStatus::NoShow, false);

    expect(listedIds('past'))->toContain($noShow->id)
        ->and(listedIds('upcoming'))->not->toContain($noShow->id);
});

it('moves a lapsed pending booking to past', function () {
    $lapsed = seedBooking($this->client, BookingStatus::Pending, false);

    expect(listedIds('past'))->toContain($lapsed->id)
        ->and(listedIds('upcoming'))->not->toContain($lapsed->id);
});

it('lists every status in exactly one bucket', function () {
    $ids = [];
    foreach (BookingStatus::cases() as $status) {
        $ids[] = seedBooking($this->client, $status, true)->id;
    }

    $upcoming = listedIds('upcoming');
    $past = listedIds('past');

    foreach ($ids as $id) {
        expect(in_array($id, $upcoming, true) xor in_array($id, $past, true))->toBeTrue();
    }
});

it('sorts upcoming ascending and past descending', function () {
    $later = seedBooking($this->client, BookingStatus::Confirmed, true);
    $later->update(['starts_at' => now()->addDays(3), 'ends_at' => now()->addDays(3)->addHour()]);
    $sooner = seedBooking($this->client, BookingStatus::Confirmed, true);

    expect(listedIds('upcoming'))->toBe([$sooner->id, $later->id]);

    $old = seedBooking($this->client, BookingStatus::Completed, false);
    $old->update(['starts_at' => now()->subDays(5), 'ends_at' => now()->subDays(5)->addHour()]);
    $recent = seedBooking($this->client, BookingStatus::Completed, false);

    expect(listedIds('past'))->toBe([$recent->id, $old->id]);
});
