<?php

declare(strict_types=1);

use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Route as RouteFacade;
use Illuminate\Testing\TestResponse;
use Modules\Barber\Models\BarberModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware;
use Modules\Preference\Models\PreferenceModel;

/*
 * C1 (extended): a signed-in owner or barber with a stored Arabic preference and no Accept-Language gets Arabic validation
 * errors on the write routes, not only on the few routes the first tests named. The structural test below keeps every
 * dashboard write route behind the language middleware, so a new route cannot ship without it.
 */

/** @return list<string> */
function dashboardWriteRoutesWithoutLocaleMiddleware(): array
{
    $missing = [];

    foreach (RouteFacade::getRoutes() as $route) {
        /** @var Route $route */
        $isDashboard = str_starts_with($route->uri(), 'api/v1/dashboard/');
        $writes = array_intersect($route->methods(), ['POST', 'PUT', 'PATCH', 'DELETE']) !== [];
        $hasLocale = collect($route->gatherMiddleware())->contains(fn (mixed $middleware): bool => is_string($middleware) && str_starts_with($middleware, ApplyPreferredLocaleMiddleware::class));

        if ($isDashboard && $writes && ! $hasLocale) {
            $missing[] = implode('|', array_diff($route->methods(), ['HEAD'])).' '.$route->uri();
        }
    }

    return $missing;
}

/** Every message is Arabic: it has Arabic letters and does not open with an English framework sentence. */
function expectArabicValidationMessages(TestResponse $response): void
{
    $response->assertUnprocessable();

    $messages = collect($response->json('errors'))->flatten();

    expect($messages)->not->toBeEmpty();

    foreach ($messages as $message) {
        expect($message)->toMatch('/\p{Arabic}/u')->not->toMatch('/^The /');
    }
}

function arabicPreference(PreferenceableTypeEnum $type, string $id): void
{
    PreferenceModel::factory()->create(['preferenceable_type' => $type->value, 'preferenceable_id' => $id, 'preferred_language' => 'ar']);
}

describe('Stored-language fallback on write routes', function (): void {
    it('puts every dashboard write route behind the language middleware', function (): void {
        expect(dashboardWriteRoutesWithoutLocaleMiddleware())->toBe([]);
    });

    it('answers an owner in Arabic on every owner write route when the page sends no language', function (string $method, string $uri, array $body): void {
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        arabicPreference(PreferenceableTypeEnum::Client, (string) $owner->id);
        $this->authenticateDashboardActor($owner);

        expectArabicValidationMessages($this->withServerVariables(['HTTP_ACCEPT_LANGUAGE' => ''])->json($method, $uri, $body));
    })->with([
        'chairs' => ['POST', '/api/v1/dashboard/chairs', []],
        'services' => ['POST', '/api/v1/dashboard/services', []],
        'stylists' => ['POST', '/api/v1/dashboard/stylists', []],
        'settings' => ['PATCH', '/api/v1/dashboard/settings', ['preferred_language' => 'zz']],
    ]);

    it('answers a barber in Arabic on the dashboard and mobile settings routes when the request sends no language', function (string $uri): void {
        $barber = BarberModel::factory()->create();
        arabicPreference(PreferenceableTypeEnum::Barber, (string) $barber->id);
        $this->authenticateDashboardActor($barber);

        expectArabicValidationMessages($this->withServerVariables(['HTTP_ACCEPT_LANGUAGE' => ''])->patchJson($uri, ['theme_mode' => 'zz']));
    })->with(['dashboard settings' => ['/api/v1/dashboard/settings']]);

    it('answers a mobile barber in Arabic on the settings route', function (): void {
        $barber = BarberModel::factory()->create();
        arabicPreference(PreferenceableTypeEnum::Barber, (string) $barber->id);

        expectArabicValidationMessages(
            $this->actingAs($barber, 'barber')->withServerVariables(['HTTP_ACCEPT_LANGUAGE' => ''])->patchJson('/api/v1/barber/settings', ['theme_mode' => 'zz']),
        );
    });
});
