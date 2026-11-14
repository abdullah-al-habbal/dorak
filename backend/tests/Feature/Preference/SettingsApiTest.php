<?php

declare(strict_types=1);

use Illuminate\Support\Str;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\Locale;
use Modules\Currency\Models\CurrencyModel;
use Modules\Preference\Enums\PriceDisplayModeEnum;
use Modules\Preference\Enums\ThemeEnum;
use Modules\Preference\Models\PreferenceModel;
use Tests\TestCase;

it('returns defaults for a client with no settings row and creates exactly one row', function (): void {
    $client = ClientModel::factory()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/client/settings')
        ->assertOk()
        ->assertJsonPath('data.allows_notifications', true)
        ->assertJsonPath('data.preferred_language', null);

    expect(PreferenceModel::query()->where('preferenceable_type', 'client')->where('preferenceable_id', $client->id)->count())->toBe(1);

    $this->withToken($token)->getJson('/api/v1/client/settings')->assertOk();
    expect(PreferenceModel::query()->where('preferenceable_type', 'client')->where('preferenceable_id', $client->id)->count())->toBe(1);
});

it('rejects an unknown display currency with 422', function (): void {
    $client = ClientModel::factory()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)->patchJson('/api/v1/client/settings', [
        'display_currency_code' => (string) Str::uuid(),
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('display_currency_code');

    expect(PreferenceModel::query()->where('preferenceable_id', $client->id)->first()?->display_currency_code)->toBeNull();
});

it('persists a valid settings update for a client', function (): void {
    $client = ClientModel::factory()->create();
    $currency = CurrencyModel::factory()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)->patchJson('/api/v1/client/settings', [
        'preferred_language' => Locale::Ar,
        'allows_notifications' => false,
        'display_currency_code' => $currency->code,
        'theme_mode' => ThemeEnum::Dark,
        'price_display_mode' => PriceDisplayModeEnum::TaxExclusive,
    ])
        ->assertOk()
        ->assertJsonPath('data.preferred_language', 'ar')
        ->assertJsonPath('data.allows_notifications', false)
        ->assertJsonPath('data.display_currency_code', $currency->code)
        ->assertJsonPath('data.theme_mode', 'dark')
        ->assertJsonPath('data.price_display_mode', 'tax_exclusive');
});

it('scopes settings to the authenticated client only', function (): void {
    $client = ClientModel::factory()->create();
    $other = ClientModel::factory()->create();
    $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

    $this->withToken($token)->patchJson('/api/v1/client/settings', ['preferred_language' => Locale::En]);

    $this->app['auth']->forgetGuards();
    $this->withToken($other->createToken('client-app', $other->accessTokenAbilities())->plainTextToken)
        ->getJson('/api/v1/client/settings')
        ->assertOk()
        ->assertJsonPath('data.preferred_language', null);

    expect(PreferenceModel::query()->count())->toBe(2);
});

it('returns defaults and persists settings for a barber', function (): void {
    $barber = BarberModel::factory()->create();
    $token = $barber->createToken('barber-app')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/barber/settings')
        ->assertOk()
        ->assertJsonPath('data.allows_notifications', true);

    $this->withToken($token)->patchJson('/api/v1/barber/settings', ['theme_mode' => ThemeEnum::Dark])
        ->assertOk()
        ->assertJsonPath('data.theme_mode', 'dark');

    expect(PreferenceModel::query()->where('preferenceable_type', 'barber')->where('preferenceable_id', $barber->id)->count())->toBe(1);
});

it('returns defaults and persists settings for a branch', function (): void {
    $branch = BranchModel::factory()->create();
    $token = $branch->createToken('branch-app')->plainTextToken;

    $this->withToken($token)->getJson('/api/v1/branch/settings')
        ->assertOk()
        ->assertJsonPath('data.allows_notifications', true);

    $this->withToken($token)->patchJson('/api/v1/branch/settings', ['preferred_language' => Locale::Ar])
        ->assertOk()
        ->assertJsonPath('data.preferred_language', 'ar');

    expect(PreferenceModel::query()->where('preferenceable_type', 'branch')->where('preferenceable_id', $branch->id)->count())->toBe(1);
});

it('returns and persists settings for a dashboard admin actor', function (): void {
    $admin = AdminModel::factory()->create();
    $token = dashboardToken($this, $admin);

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/dashboard/settings')
        ->assertOk()
        ->assertJsonPath('data.allows_notifications', true);

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->patchJson('/api/v1/dashboard/settings', ['theme_mode' => ThemeEnum::Dark])
        ->assertOk()
        ->assertJsonPath('data.theme_mode', 'dark');

    expect(PreferenceModel::query()->where('preferenceable_type', 'admin')->where('preferenceable_id', $admin->id)->count())->toBe(1);
});

it('responds with translated resources once a barber sets an Arabic preferred language', function (): void {
    $barber = BarberModel::factory()->create(['name' => ['en' => 'John Doe', 'ar' => 'جون دو']]);
    $token = $barber->createToken('barber-app')->plainTextToken;

    $this->withToken($token)->patchJson('/api/v1/barber/settings', ['preferred_language' => Locale::Ar])->assertOk();

    $this->withToken($token)->getJson('/api/v1/barber/profile')
        ->assertOk()
        ->assertJsonPath('data.name', 'جون دو');
});

function dashboardToken(TestCase $test, AdminModel $admin): string
{
    config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);

    $login = $test->postJson('/api/v1/dashboard/login', [
        'actor_type' => 'admin',
        'email' => $admin->email,
        'password' => 'password',
    ])->assertOk();

    // The session claim is mandatory; keep it on the test instance next to the bearer the caller adds.
    $test->withHeader('X-Dashboard-Session', (string) $login->json('data.claim'));

    return (string) $login->json('data.token');
}
