<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Language\Models\LanguageModel;
use Modules\Payment\Enums\PaymentGatewayDriver;
use Modules\Payment\Models\PaymentGatewayModel;

const ADMIN_BACK_OFFICE_ID = '00000000-0000-4000-8000-000000000001';

/** NS-04 to NS-25: every admin back-office route sits behind the platform-admin middleware. */
describe('Admin back-office routes are platform-admin only', function (): void {
    $routes = [
        ['GET', 'admins'], ['POST', 'admins'], ['PUT', 'admins/{id}'], ['PATCH', 'admins/{id}/deactivate'],
        ['PATCH', 'admins/{id}/reactivate'], ['POST', 'admins/{id}/resend-invite'],
        ['GET', 'clients'], ['GET', 'clients/{id}'], ['POST', 'clients/{id}/ban'], ['PATCH', 'clients/{id}/unban'],
        ['GET', 'barbers'], ['PATCH', 'barbers/{id}/approve'], ['PATCH', 'barbers/{id}/activate'],
        ['PATCH', 'barbers/{id}/deactivate'], ['POST', 'barbers/{id}/ban'], ['PATCH', 'barbers/{id}/unban'],
        ['PATCH', 'barbers/{id}/reject'], ['GET', 'currencies'], ['POST', 'currencies'], ['PUT', 'currencies/{id}'],
        ['PATCH', 'currencies/{id}/active'], ['POST', 'exchange-rates'], ['DELETE', 'exchange-rates/{id}'],
        ['GET', 'languages'], ['PATCH', 'languages/{id}/active'], ['GET', 'catalog-tags'], ['POST', 'catalog-tags'],
        ['PUT', 'catalog-tags/{id}'], ['DELETE', 'catalog-tags/{id}'], ['GET', 'payment-gateways'],
        ['POST', 'payment-gateways'], ['PUT', 'payment-gateways/{id}'], ['PATCH', 'payment-gateways/{id}/active'],
        ['DELETE', 'payment-gateways/{id}'], ['GET', 'payouts/{id}/entries'], ['GET', 'marketing-pages'],
        ['PUT', 'marketing-pages/{id}'], ['PUT', 'marketing-sections/{id}'], ['POST', 'testimonials'],
        ['PUT', 'testimonials/{id}'], ['DELETE', 'testimonials/{id}'], ['GET', 'onboarding-configs'],
        ['PUT', 'onboarding-configs/{id}'],
    ];
    $dataset = array_map(static fn (array $route): array => $route, $routes);

    it('rejects anonymous callers', function (string $method, string $path): void {
        $url = '/api/v1/dashboard/admin/'.str_replace('{id}', ADMIN_BACK_OFFICE_ID, $path);

        $this->json($method, $url)->assertUnauthorized();
    })->with($dataset);

    it('rejects owners, managers and stylists', function (string $method, string $path): void {
        $owner = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $owner->id]);
        $url = '/api/v1/dashboard/admin/'.str_replace('{id}', ADMIN_BACK_OFFICE_ID, $path);

        foreach ([BranchModel::factory()->create(), BarberModel::factory()->create(), $owner] as $actor) {
            $this->authenticateDashboardActor($actor);
            $this->json($method, $url, [])->assertForbidden();
        }
    })->with($dataset);
});

describe('Admin user guards', function (): void {
    it('refuses to deactivate yourself and keeps the account active', function (): void {
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);

        $this->patchJson("/api/v1/dashboard/admin/admins/{$admin->id}/deactivate")->assertStatus(409);

        expect($admin->fresh()->deactivated_at)->toBeNull();
    });

    it('deactivates and reactivates another admin', function (): void {
        $actor = AdminModel::factory()->create();
        $other = AdminModel::factory()->create();
        $this->authenticateDashboardActor($actor);

        $this->patchJson("/api/v1/dashboard/admin/admins/{$other->id}/deactivate")->assertOk();
        expect($other->fresh()->deactivated_at)->not->toBeNull();

        $this->patchJson("/api/v1/dashboard/admin/admins/{$other->id}/reactivate")->assertOk();
        expect($other->fresh()->deactivated_at)->toBeNull();
    });
});

describe('Payment gateway credentials are write-only', function (): void {
    it('never returns a secret value from create, update, list or activate', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $secret = 'sk_live_super_secret_value';
        $payload = [
            'code' => 'acme_pay',
            'name' => ['en' => 'Acme', 'ar' => 'أكمي'],
            'driver' => PaymentGatewayDriver::cases()[0]->value,
            'is_active' => false,
            'gateway_settings' => ['secret_key' => $secret],
        ];

        $created = $this->postJson('/api/v1/dashboard/admin/payment-gateways', $payload)->assertSuccessful();
        $id = $created->json('data.id');
        $responses = [
            $created,
            $this->putJson("/api/v1/dashboard/admin/payment-gateways/{$id}", $payload)->assertSuccessful(),
            $this->getJson('/api/v1/dashboard/admin/payment-gateways')->assertOk(),
            $this->patchJson("/api/v1/dashboard/admin/payment-gateways/{$id}/active", ['is_active' => true]),
        ];

        foreach ($responses as $response) {
            expect($response->getContent())->not->toContain($secret);
        }
        expect($created->json('data.gateway_setting_keys'))->toBe(['secret_key']);
        expect(PaymentGatewayModel::query()->findOrFail($id)->gateway_settings)->not->toBeNull();
    });
});

describe('Reference data guards', function (): void {
    it('refuses to retire the default currency', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $currency = CurrencyModel::factory()->create(['is_default' => true, 'is_active' => true]);

        $this->patchJson("/api/v1/dashboard/admin/currencies/{$currency->id}/active", ['is_active' => false])->assertStatus(409);

        expect($currency->fresh()->is_active)->toBeTrue();
    });

    it('switches a language off and on', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $language = LanguageModel::factory()->create(['is_default' => false]);

        $this->patchJson("/api/v1/dashboard/admin/languages/{$language->id}/active", ['is_active' => false])->assertOk();
        expect($language->fresh()->is_active)->toBeFalse();

        $this->patchJson("/api/v1/dashboard/admin/languages/{$language->id}/active", ['is_active' => true])->assertOk();
        expect($language->fresh()->is_active)->toBeTrue();
    });
});
