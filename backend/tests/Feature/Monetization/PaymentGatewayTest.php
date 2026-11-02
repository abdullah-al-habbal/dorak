<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Modules\Admin\Models\AdminModel;
use Modules\Payment\Database\Seeders\PaymentGatewaySeeder;
use Modules\Payment\Enums\PaymentGatewayDriver;
use Modules\Payment\Models\PaymentGatewayModel;

function gatewayPayload(array $overrides = []): array
{
    return [
        'code' => 'syriatel_cash',
        'name' => ['en' => 'Syriatel Cash', 'ar' => 'سيريتل كاش'],
        'driver' => PaymentGatewayDriver::Offline->value,
        'is_active' => true,
        'gateway_settings' => ['merchant_id' => 'm-1', 'secret' => 's3cret'],
        ...$overrides,
    ];
}

describe('Payment gateways', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('seeds pay at salon as the default offline gateway', function (): void {
        $this->seed(PaymentGatewaySeeder::class);
        $this->seed(PaymentGatewaySeeder::class);

        $gateway = PaymentGatewayModel::query()->where('code', 'pay_at_salon')->sole();
        expect($gateway->is_default)->toBeTrue()
            ->and($gateway->is_active)->toBeTrue()
            ->and($gateway->driver)->toBe(PaymentGatewayDriver::Offline);
    });

    it('creates a gateway, stores config encrypted and never returns its values', function (): void {
        $response = $this->postJson('/api/v1/dashboard/admin/payment-gateways', gatewayPayload())
            ->assertCreated()
            ->assertJsonPath('data.gateway_setting_keys', ['merchant_id', 'secret']);

        expect(json_encode($response->json()))->not->toContain('s3cret');
        $raw = DB::table('payment_gateways')->where('code', 'syriatel_cash')->value('gateway_settings');
        expect($raw)->not->toContain('s3cret');
        expect(PaymentGatewayModel::query()->where('code', 'syriatel_cash')->sole()->gateway_settings['secret'])->toBe('s3cret');
    });

    it('validates code format and uniqueness', function (): void {
        PaymentGatewayModel::factory()->create(['code' => 'taken']);

        $this->postJson('/api/v1/dashboard/admin/payment-gateways', gatewayPayload(['code' => 'taken']))->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/admin/payment-gateways', gatewayPayload(['code' => 'Bad Code']))->assertUnprocessable();
        $this->postJson('/api/v1/dashboard/admin/payment-gateways', [])->assertUnprocessable();
    });

    it('rejects a driver outside the PaymentGatewayDriver enum', function (): void {
        $this->postJson('/api/v1/dashboard/admin/payment-gateways', gatewayPayload(['driver' => 'wallet']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['driver']);
        expect(PaymentGatewayModel::query()->count())->toBe(0);
    });

    it('lists gateways', function (): void {
        PaymentGatewayModel::factory()->count(2)->create();

        $this->getJson('/api/v1/dashboard/admin/payment-gateways')->assertOk()->assertJsonCount(2, 'data');
    });

    it('keeps exactly one default gateway', function (): void {
        $first = PaymentGatewayModel::factory()->create(['is_default' => true]);

        $this->postJson('/api/v1/dashboard/admin/payment-gateways', gatewayPayload(['is_default' => true]))->assertCreated();

        expect($first->fresh()->is_default)->toBeFalse()
            ->and(PaymentGatewayModel::query()->where('is_default', true)->count())->toBe(1);
    });

    it('updates a gateway and keeps its stored config when none is sent', function (): void {
        $gateway = PaymentGatewayModel::factory()->create(['code' => 'old', 'gateway_settings' => ['k' => 'v']]);
        $payload = gatewayPayload(['code' => 'old', 'name' => ['en' => 'Renamed', 'ar' => 'جديد']]);
        unset($payload['gateway_settings']);

        $this->putJson("/api/v1/dashboard/admin/payment-gateways/{$gateway->id}", $payload)
            ->assertOk()
            ->assertJsonPath('data.driver', 'offline')
            ->assertJsonPath('data.name.en', 'Renamed')
            ->assertJsonPath('data.gateway_setting_keys', ['k']);
    });

    it('toggles a gateway but protects the default and the last active one', function (): void {
        $default = PaymentGatewayModel::factory()->create(['is_default' => true]);
        $other = PaymentGatewayModel::factory()->create();

        $this->patchJson("/api/v1/dashboard/admin/payment-gateways/{$default->id}/active", ['is_active' => false])->assertConflict();
        $this->patchJson("/api/v1/dashboard/admin/payment-gateways/{$other->id}/active", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.is_active', false);
        $this->patchJson("/api/v1/dashboard/admin/payment-gateways/{$other->id}/active", ['is_active' => true])->assertOk();
        $this->patchJson("/api/v1/dashboard/admin/payment-gateways/{$other->id}/active", [])->assertUnprocessable();
    });

    it('refuses to deactivate the only active gateway', function (): void {
        $only = PaymentGatewayModel::factory()->create();

        $this->patchJson("/api/v1/dashboard/admin/payment-gateways/{$only->id}/active", ['is_active' => false])->assertConflict();
    });

    it('deletes a non-default gateway only', function (): void {
        $default = PaymentGatewayModel::factory()->create(['is_default' => true]);
        $other = PaymentGatewayModel::factory()->create();

        $this->deleteJson("/api/v1/dashboard/admin/payment-gateways/{$default->id}")->assertConflict();
        $this->deleteJson("/api/v1/dashboard/admin/payment-gateways/{$other->id}")->assertOk();

        expect(PaymentGatewayModel::query()->count())->toBe(1);
    });
});
