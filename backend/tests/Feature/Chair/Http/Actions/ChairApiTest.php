<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;

it('lists chairs', function () {
    ChairModel::factory()->count(3)->create();

    $response = $this->getJson('/api/v1/chairs');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(3);
});

it('lists chairs filtered by branch', function () {
    $branchChair = ChairModel::factory()->create();
    ChairModel::factory()->create();

    $response = $this->getJson('/api/v1/chairs?branch_id='.$branchChair->branch_id);

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
});

it('lists chairs by branch route', function () {
    $branchChair = ChairModel::factory()->create();
    ChairModel::factory()->create();

    $response = $this->getJson("/api/v1/branches/{$branchChair->branch_id}/chairs");

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
});

it('shows chair', function () {
    $chair = ChairModel::factory()->create();

    $response = $this->getJson("/api/v1/chairs/{$chair->id}");

    $response->assertOk();
    expect($response->json('data.id'))->toBe($chair->id);
});

it('returns 404 for non-existent chair', function () {
    $response = $this->getJson('/api/v1/chairs/00000000-0000-0000-0000-000000000000');

    $response->assertNotFound();
});

describe('update chair', function () {
    it('updates chair status', function () {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'status' => 'available']);
        $this->actingAs($branch, 'branch_api');

        $response = $this->patchJson("/api/v1/chairs/{$chair->id}", [
            'status' => 'occupied',
        ]);

        $response->assertOk();
        expect($response->json('data.status'))->toBe('occupied');
        expect($chair->fresh()->status)->toBe(ChairStatus::Occupied);
    });

    it('updates chair label', function () {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'label' => 'Old Label']);
        $this->actingAs($branch, 'branch_api');

        $response = $this->patchJson("/api/v1/chairs/{$chair->id}", [
            'label' => 'New Label',
        ]);

        $response->assertOk();
        expect($response->json('data.label'))->toBe('New Label');
    });

    it('assigns barber to chair', function () {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
        $this->actingAs($branch, 'branch_api');

        $response = $this->patchJson("/api/v1/chairs/{$chair->id}", [
            'barber_id' => $barber->id,
        ]);

        $response->assertOk();
        expect($response->json('data.barber.id'))->toBe($barber->id);
        expect($chair->fresh()->barber_id)->toBe($barber->id);
    });

    it('rejects invalid status', function () {
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $this->actingAs($branch, 'branch_api');

        $response = $this->patchJson("/api/v1/chairs/{$chair->id}", [
            'status' => 'invalid_status',
        ]);

        $response->assertStatus(422);
    });

    it('returns forbidden when a client attempts a chair mutation', function () {
        $client = ClientModel::factory()->create();
        $chair = ChairModel::factory()->create();
        $this->actingAs($client, 'client');

        $response = $this->patchJson("/api/v1/chairs/{$chair->id}", [
            'status' => 'occupied',
        ]);

        $response->assertForbidden();
    });

    it('rejects a branch manager updating another branch chair', function () {
        $manager = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create();
        $this->actingAs($manager, 'branch_api');

        $response = $this->patchJson("/api/v1/chairs/{$chair->id}", [
            'status' => 'occupied',
        ]);

        $response->assertForbidden();
    });

    it('allows an admin to update a chair', function () {
        $admin = AdminModel::factory()->create();
        $chair = ChairModel::factory()->create();
        $this->actingAs($admin, 'admin_api');

        $response = $this->patchJson("/api/v1/chairs/{$chair->id}", [
            'status' => 'occupied',
        ]);

        $response->assertOk();
    });

    it('rejects an unauthenticated update', function () {
        $chair = ChairModel::factory()->create();

        $response = $this->patchJson("/api/v1/chairs/{$chair->id}", [
            'status' => 'occupied',
        ]);

        $response->assertUnauthorized();
    });
});
