<?php

declare(strict_types=1);

use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Activation\Models\ActivationLogModel;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Exceptions\BarberActivationException;
use Modules\Barber\Models\BarberModel;

beforeEach(function () {
    $this->barber = BarberModel::factory()->create();
    $this->actingAs(AdminModel::factory()->create(), 'admin_api');
});

it('activates a barber', function () {
    $response = $this->postJson("/api/v1/admin/barbers/{$this->barber->id}/activate", [
        'reason' => 'Approved for platform',
    ]);

    $response->assertCreated();
    expect($response->json('data.status'))->toBe(ActivationStatusEnum::Enabled->value);
    expect($response->json('data.activable_id'))->toBe($this->barber->id);
});

it('deactivates a barber', function () {
    $response = $this->postJson("/api/v1/admin/barbers/{$this->barber->id}/deactivate", [
        'reason' => 'Violation of terms',
    ]);

    $response->assertCreated();
    expect($response->json('data.status'))->toBe(ActivationStatusEnum::Disabled->value);
});

it('activates without reason', function () {
    $response = $this->postJson("/api/v1/admin/barbers/{$this->barber->id}/activate");

    $response->assertCreated();
    expect($response->json('data.status'))->toBe(ActivationStatusEnum::Enabled->value);
});

it('returns 404 for non-existent barber activation', function () {
    $response = $this->postJson('/api/v1/admin/barbers/00000000-0000-0000-0000-000000000000/activate');

    $response->assertNotFound();
});

it('returns 404 for non-existent barber deactivation', function () {
    $response = $this->postJson('/api/v1/admin/barbers/00000000-0000-0000-0000-000000000000/deactivate');

    $response->assertNotFound();
});

it('refuses to switch a pending or rejected barber on or off through the legacy admin routes', function (BarberStatusEnum $status, string $action) {
    $barber = BarberModel::factory()->create(['status' => $status]);

    $this->postJson("/api/v1/admin/barbers/{$barber->id}/{$action}")
        ->assertStatus(409)
        ->assertJsonPath('code', BarberActivationException::CODE_NOT_APPROVED);

    expect($barber->refresh()->status)->toBe($status);
    expect(ActivationLogModel::query()->where('activable_id', $barber->id)->count())->toBe(0);
})->with([
    'pending activate' => [BarberStatusEnum::Pending, 'activate'],
    'pending deactivate' => [BarberStatusEnum::Pending, 'deactivate'],
    'rejected activate' => [BarberStatusEnum::Rejected, 'activate'],
    'rejected deactivate' => [BarberStatusEnum::Rejected, 'deactivate'],
]);

it('keeps the legacy admin barber toggle idempotent for an approved barber', function () {
    $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Enabled]);

    $this->postJson("/api/v1/admin/barbers/{$barber->id}/activate")->assertCreated();
    $this->postJson("/api/v1/admin/barbers/{$barber->id}/deactivate")->assertCreated();

    expect($barber->refresh()->status)->toBe(BarberStatusEnum::Disabled);
});

it('records the acting admin on the legacy barber and branch toggles', function () {
    $admin = AdminModel::factory()->create();
    $this->actingAs($admin, 'admin_api');
    $barber = BarberModel::factory()->create(['status' => BarberStatusEnum::Enabled]);

    $this->postJson("/api/v1/admin/barbers/{$barber->id}/deactivate")->assertCreated();

    expect(ActivationLogModel::query()->where('activable_id', $barber->id)->value('activated_by_id'))->toBe($admin->id);
});
