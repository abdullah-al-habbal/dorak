<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User;
use Modules\Ban\Models\BanModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Client\Models\SocialAccountModel;
use Modules\OfferedService\Enums\ServiceableTypeEnum;
use Modules\OfferedService\Models\OfferedServiceModel;

beforeEach(function (): void {
    config([
        'dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters',
    ]);
});

it('rejects banned clients at login without issuing a token', function (): void {
    $client = ClientModel::factory()->create(['email' => 'banned-client@example.test']);
    $client->bans()->create(['reason' => 'policy', 'banned_at' => now()->subMinute()]);

    $response = $this->postJson('/api/v1/client/login', [
        'email' => $client->email,
        'password' => 'password',
    ]);

    $response->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');
    expect($response->json('data.token'))->toBeNull();
});

it('rejects banned clients from registration and social login', function (): void {
    $client = ClientModel::factory()->create(['email' => 'banned-signup@example.test']);
    $client->bans()->create(['reason' => 'policy', 'banned_at' => now()->subMinute()]);

    $this->postJson('/api/v1/client/register', [
        'name' => 'Banned Account',
        'email' => $client->email,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');

    SocialAccountModel::factory()->create([
        'client_id' => $client->id,
        'provider' => 'google',
        'provider_id' => 'banned-google-id',
    ]);
    $socialUser = new User;
    $socialUser->id = 'banned-google-id';
    $socialUser->name = 'Banned Account';
    $socialUser->email = $client->email;
    $socialUser->avatar = null;
    $statelessDriver = Mockery::mock();
    $statelessDriver->shouldReceive('userFromToken')->with('social-token')->andReturn($socialUser);
    $driver = Mockery::mock();
    $driver->shouldReceive('stateless')->andReturn($statelessDriver);
    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);

    $this->postJson('/api/v1/client/social/google', [
        'access_token' => 'social-token',
    ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');
});

it('blocks an authenticated banned client from reading bookings', function (): void {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');
    $client->bans()->create(['reason' => 'policy', 'banned_at' => now()->subMinute()]);

    $this->getJson('/api/v1/bookings')
        ->assertForbidden()
        ->assertJsonPath('code', 'ACCOUNT_BANNED');
});

it('rejects client token refresh while a ban is active', function (): void {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');
    $client->bans()->create(['reason' => 'policy', 'banned_at' => now()->subMinute()]);

    $this->postJson('/api/v1/client/refresh-token')
        ->assertForbidden()
        ->assertJsonPath('code', 'ACCOUNT_BANNED');
});

it('rejects a banned client booking without creating a booking row', function (): void {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');
    $client->bans()->create(['reason' => 'policy', 'banned_at' => now()->subMinute()]);
    $bookingCount = BookingModel::query()->count();

    $this->postJson('/api/v1/bookings', [
        'at_home_location' => [
            'latitude' => 33.5,
            'longitude' => 36.3,
            'street' => 'Al Hamra Street',
            'building' => '12',
            'unit' => '4B',
        ],
        'starts_at' => now()->addDay()->toIso8601ZuluString(),
        'service_ids' => [],
    ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');

    expect(BookingModel::query()->count())->toBe($bookingCount);
});

it('rejects a chair booking when its assigned barber is banned', function (): void {
    $client = ClientModel::factory()->create();
    $this->actingAs($client, 'client');
    $barber = BarberModel::factory()->create();
    $barber->bans()->create(['reason' => 'policy', 'banned_at' => now()->subMinute()]);
    $chair = ChairModel::factory()->create(['barber_id' => $barber->id]);
    $service = OfferedServiceModel::factory()->create(['duration_minutes' => 30, 'serviceable_type' => ServiceableTypeEnum::Brand, 'serviceable_id' => $chair->branch->brand_id]);

    $this->postJson('/api/v1/bookings', [
        'chair_id' => $chair->id,
        'starts_at' => now()->addDay()->toIso8601ZuluString(),
        'service_ids' => [$service->id],
    ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');

    expect(BookingModel::query()->count())->toBe(0);
});

it('rejects banned barbers from mobile and dashboard login', function (): void {
    $barber = BarberModel::factory()->create([
        'email' => 'banned-barber@example.test',
        'password' => Hash::make('password'),
        'has_login' => true,
        'status' => BarberStatusEnum::Enabled,
    ]);
    $barber->bans()->create(['reason' => 'policy', 'banned_at' => now()->subMinute()]);

    $this->postJson('/api/v1/barber/login', [
        'email' => $barber->email,
        'password' => 'password',
    ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');

    $this->postJson('/api/v1/dashboard/login', [
        'actor_type' => 'barber',
        'email' => $barber->email,
        'password' => 'password',
    ])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_BANNED');
});

it('allows a client login after a ban expires', function (): void {
    $client = ClientModel::factory()->create(['email' => 'expired-ban@example.test']);
    BanModel::create([
        'bannable_id' => $client->id,
        'bannable_type' => $client->getMorphClass(),
        'reason' => 'expired',
        'banned_at' => now()->subDays(2),
        'expires_at' => now()->subDay(),
    ]);

    $this->postJson('/api/v1/client/login', [
        'email' => $client->email,
        'password' => 'password',
    ])->assertOk()->assertJsonPath('data.token', fn (mixed $token): bool => is_string($token) && $token !== '');
});

it('revokes existing Sanctum tokens when an active ban is created', function (): void {
    $client = ClientModel::factory()->create();
    $client->createToken('test-token');

    $client->bans()->create(['reason' => 'policy', 'banned_at' => now()->subMinute()]);

    expect($client->tokens()->count())->toBe(0);
});
