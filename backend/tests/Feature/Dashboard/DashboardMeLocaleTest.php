<?php

declare(strict_types=1);

use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Modules\Admin\Models\AdminModel;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Models\PreferenceModel;

beforeEach(function (): void {
    $this->withoutMiddleware(ThrottleRequests::class);
    config(['dashboard.dashboard.session_secret' => 'dashboard-session-secret-that-is-at-least-thirty-two-characters']);
});

function meDisplayName(AdminModel $admin, ?string $acceptLanguage): ?string
{
    app('auth')->forgetGuards();
    $login = test()->postJson('/api/v1/dashboard/login', ['actor_type' => 'admin', 'email' => $admin->email, 'password' => 'password'])->assertOk();
    $headers = ['Authorization' => 'Bearer '.$login->json('data.token'), 'X-Dashboard-Session' => $login->json('data.claim')];

    app('auth')->forgetGuards();

    // The framework's synthetic requests carry a default `en-us` header; `null` here means the header really is absent.
    return test()->withServerVariables(['HTTP_ACCEPT_LANGUAGE' => $acceptLanguage ?? ''])
        ->withHeaders($headers)
        ->getJson('/api/v1/dashboard/me')
        ->assertOk()
        ->json('data.display_name');
}

function localisedAdmin(): AdminModel
{
    return AdminModel::factory()->create(['name' => ['en' => 'Admin', 'ar' => 'مدير النظام'], 'password' => Hash::make('password')]);
}

it('answers /me with the name in the Accept-Language the dashboard sends', function (): void {
    $admin = localisedAdmin();

    expect(meDisplayName($admin, 'ar'))->toBe('مدير النظام')
        ->and(meDisplayName($admin, 'ar-SY,ar;q=0.9,en;q=0.5'))->toBe('مدير النظام')
        ->and(meDisplayName($admin, 'en'))->toBe('Admin');
});

it('keeps the default language when Accept-Language is absent or names no supported language', function (): void {
    $admin = localisedAdmin();

    expect(meDisplayName($admin, null))->toBe('Admin')
        ->and(meDisplayName($admin, 'fr-FR'))->toBe('Admin');
});

it('lets the page language win over the stored preference, and uses the preference without a header', function (): void {
    $admin = localisedAdmin();
    PreferenceModel::factory()->create([
        'preferenceable_type' => PreferenceableTypeEnum::Admin->value,
        'preferenceable_id' => $admin->id,
        'preferred_language' => 'ar',
    ]);

    expect(meDisplayName($admin, null))->toBe('مدير النظام')
        ->and(meDisplayName($admin, 'en'))->toBe('Admin');
});
