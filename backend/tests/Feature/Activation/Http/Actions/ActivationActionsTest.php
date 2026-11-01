<?php

declare(strict_types=1);

use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Admin\Models\AdminModel;
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
