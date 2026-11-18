<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;

/** BG-4: public barber payloads carry no personal contact data and only a rounded location. */
const PRIVATE_BARBER_KEYS = ['phone', 'has_login', 'rejection_reason', 'submission_count', 'email_verified_at'];

function privateBarber(): BarberModel
{
    return BarberModel::factory()->create([
        'is_freelancer' => true,
        'email' => 'private.barber@example.com',
        'phone' => '+963911111111',
        'latitude' => 33.512345,
        'longitude' => 36.298765,
    ]);
}

function expectNoPersonalData(array $barber): void
{
    foreach (PRIVATE_BARBER_KEYS as $key) {
        expect($barber)->not->toHaveKey($key);
    }
    expect($barber['email'])->toBe('');
    expect(json_encode($barber))->not->toContain('private.barber@example.com')->not->toContain('+963911111111');
    expect($barber['latitude'])->toBe(33.51)->and($barber['longitude'])->toBe(36.3);
}

describe('public barber resource', function () {
    it('hides contact data and rounds the location in the barber list', function () {
        privateBarber();

        $response = $this->getJson('/api/v1/explore/barbers?latitude=33.5&longitude=36.3&radius=1000');

        $response->assertOk();
        expectNoPersonalData($response->json('data.0'));
    });

    it('hides contact data and rounds the location in the barber detail', function () {
        $barber = privateBarber();

        $response = $this->getJson("/api/v1/explore/barbers/{$barber->id}");

        $response->assertOk();
        expectNoPersonalData($response->json('data'));
        expect($response->json('data'))->toHaveKeys(['id', 'name', 'bio', 'rating_average', 'rating_count', 'services', 'workplaces']);
    });

    it('keeps the fields shipped mobile builds read, so old apps still parse it', function () {
        $barber = privateBarber();

        $data = $this->getJson("/api/v1/explore/barbers/{$barber->id}")->json('data');

        expect($data)->toHaveKeys(['id', 'name', 'email', 'is_freelancer', 'status', 'latitude', 'longitude', 'rating_count', 'is_workstation_online', 'created_at']);
    });

    it('still shows the barber their own full profile', function () {
        $barber = privateBarber();
        $token = $barber->createToken('barber', ['barber-app'])->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/barber/profile');

        $response->assertOk();
        expect($response->json('data.email'))->toBe('private.barber@example.com');
    });
});
