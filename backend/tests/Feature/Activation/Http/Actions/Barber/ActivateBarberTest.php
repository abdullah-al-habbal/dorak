<?php

declare(strict_types=1);

use Modules\Activation\Enums\ActivableTypeEnum;
use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;

beforeEach(function () {
    $this->barber = BarberModel::factory()->create();
    $this->actingAs($this->barber, 'barber');
});

it('activates a barber', function () {
    $response = $this->postJson("/api/v1/barbers/{$this->barber->id}/activate");

    $response->assertCreated();
    expect($response->json('data.status'))->toBe(ActivationStatusEnum::Enabled->value);
    expect($response->json('data.activable_id'))->toBe($this->barber->id);
    expect(ActivationLogModel::where('activable_id', $this->barber->id)->count())->toBe(1);
});

it('activates a barber with reason', function () {
    $response = $this->postJson("/api/v1/barbers/{$this->barber->id}/activate", [
        'reason' => 'Approved for platform',
    ]);

    $response->assertCreated();
    expect($response->json('data.status'))->toBe(ActivationStatusEnum::Enabled->value);
});

it('returns 401 without authentication', function () {
    $this->app->get('auth')->forgetGuards();

    $response = $this->postJson("/api/v1/barbers/{$this->barber->id}/activate");

    $response->assertUnauthorized();
});

it('returns 403 when activating another barber', function () {
    $otherBarber = BarberModel::factory()->create();

    $response = $this->postJson("/api/v1/barbers/{$otherBarber->id}/activate");

    $response->assertForbidden();
});

it('returns 404 for non-existent barber', function () {
    $response = $this->postJson('/api/v1/barbers/00000000-0000-0000-0000-000000000000/activate');

    $response->assertNotFound();
});

it('blocks a barber an admin deactivated from switching themselves back on', function () {
    ActivationLogModel::factory()->create([
        'activable_id' => $this->barber->id,
        'activable_type' => ActivableTypeEnum::Barber,
        'status' => ActivationStatusEnum::Disabled,
        'activated_at' => now(),
    ]);

    $response = $this->postJson("/api/v1/barbers/{$this->barber->id}/activate");

    $response->assertForbidden();
    expect($response->json('code'))->toBe('barber_deactivated_by_admin');
    expect(ActivationLogModel::where('activable_id', $this->barber->id)->count())->toBe(1);
});

it('lets a barber who switched themselves off switch back on', function () {
    ActivationLogModel::factory()->create([
        'activable_id' => $this->barber->id,
        'activable_type' => ActivableTypeEnum::Barber,
        'status' => ActivationStatusEnum::Disabled,
        'activated_by_id' => null,
        'activated_at' => now(),
    ]);

    $this->postJson("/api/v1/barbers/{$this->barber->id}/activate")->assertCreated();
});

it('lets the barber back on once an admin has reactivated them', function () {
    $admin = AdminModel::factory()->create();
    ActivationLogModel::factory()->create([
        'activable_id' => $this->barber->id, 'activable_type' => ActivableTypeEnum::Barber,
        'status' => ActivationStatusEnum::Disabled, 'activated_by_id' => $admin->id, 'activated_at' => now()->subMinutes(2),
    ]);
    ActivationLogModel::factory()->create([
        'activable_id' => $this->barber->id, 'activable_type' => ActivableTypeEnum::Barber,
        'status' => ActivationStatusEnum::Enabled, 'activated_by_id' => $admin->id, 'activated_at' => now()->subMinute(),
    ]);
    ActivationLogModel::factory()->create([
        'activable_id' => $this->barber->id, 'activable_type' => ActivableTypeEnum::Barber,
        'status' => ActivationStatusEnum::Disabled, 'activated_by_id' => null, 'activated_at' => now(),
    ]);

    $this->postJson("/api/v1/barbers/{$this->barber->id}/activate")->assertCreated();
});
