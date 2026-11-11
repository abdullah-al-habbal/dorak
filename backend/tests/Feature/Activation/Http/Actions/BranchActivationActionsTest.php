<?php

declare(strict_types=1);

use Modules\Activation\Enums\ActivationStatusEnum;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Database\Factories\BarberAffiliationFactory;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;

it('activates a branch as admin', function () {
    $branch = BranchModel::factory()->create(['status' => BranchStatusEnum::Disabled]);
    $this->actingAs(AdminModel::factory()->create(), 'admin_api');

    $response = $this->postJson("/api/v1/admin/branches/{$branch->id}/activate", [
        'reason' => 'Approved for platform',
    ]);

    $response->assertCreated();
    expect($response->json('data.status'))->toBe(ActivationStatusEnum::Enabled->value);
    expect($branch->refresh()->status->value)->toBe(BranchStatusEnum::Enabled->value);
});

it('deactivates a branch as admin and does not delete it', function () {
    $branch = BranchModel::factory()->create();
    BranchModel::factory()->create(['brand_id' => $branch->brand_id]);
    $this->actingAs(AdminModel::factory()->create(), 'admin_api');

    $response = $this->postJson("/api/v1/admin/branches/{$branch->id}/deactivate");

    $response->assertCreated();
    expect($response->json('data.status'))->toBe(ActivationStatusEnum::Disabled->value);
    expect($branch->refresh()->status->value)->toBe(BranchStatusEnum::Disabled->value);
});

it('rejects branch deactivation without a token', function () {
    $branch = BranchModel::factory()->create();

    $response = $this->postJson("/api/v1/admin/branches/{$branch->id}/deactivate");

    $response->assertUnauthorized();
});

it('rejects branch deactivation with a barber token', function () {
    $branch = BranchModel::factory()->create();
    $this->actingAs(BarberModel::factory()->create(), 'barber');

    $response = $this->postJson("/api/v1/admin/branches/{$branch->id}/deactivate");

    expect($response->status())->toBeIn([401, 403]);
});

it('lets a branch deactivate a barber with an accepted affiliation', function () {
    $branch = BranchModel::factory()->create();
    $barber = BarberModel::factory()->create();
    BarberAffiliationFactory::new()->create([
        'barber_id' => $barber->id,
        'affiliable_id' => $branch->id,
    ]);
    $this->actingAs($branch, 'branch_api');

    $response = $this->postJson("/api/v1/branch/barbers/{$barber->id}/deactivate");

    $response->assertCreated();
    expect($barber->refresh()->status->value)->toBe(BarberStatusEnum::Disabled->value);
});

it('lets a branch activate a barber affiliated through its brand', function () {
    $branch = BranchModel::factory()->create();
    $barber = BarberModel::factory()->create();
    BarberAffiliationFactory::new()->create([
        'barber_id' => $barber->id,
        'affiliable_id' => $branch->brand_id,
        'affiliable_type' => AffiliableType::Brand,
    ]);
    $this->actingAs($branch, 'branch_api');

    $response = $this->postJson("/api/v1/branch/barbers/{$barber->id}/activate");

    $response->assertCreated();
    expect($barber->refresh()->status->value)->toBe(BarberStatusEnum::Enabled->value);
});

it('lets a branch manage a barber it directly owns without an affiliation row', function () {
    $branch = BranchModel::factory()->create();
    $barber = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id]);
    $this->actingAs($branch, 'branch_api');

    $response = $this->postJson("/api/v1/branch/barbers/{$barber->id}/deactivate");

    $response->assertCreated();
});

it('forbids a branch from deactivating an unaffiliated barber', function () {
    $branch = BranchModel::factory()->create();
    $barber = BarberModel::factory()->create();
    $this->actingAs($branch, 'branch_api');

    $response = $this->postJson("/api/v1/branch/barbers/{$barber->id}/deactivate");

    $response->assertForbidden();
});

it('removes a deactivated branch from explore results', function () {
    $branch = BranchModel::factory()->create([
        'latitude' => 33.5,
        'longitude' => 36.3,
    ]);
    BranchModel::factory()->create(['brand_id' => $branch->brand_id]);
    $this->actingAs(AdminModel::factory()->create(), 'admin_api');
    $this->postJson("/api/v1/admin/branches/{$branch->id}/deactivate")->assertCreated();

    $response = $this->getJson('/api/v1/explore/branches?latitude=33.5&longitude=36.3&radius=1000&universe=men&per_page=10');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(0);
});

it('keeps a suspended branch suspended on the legacy activate and deactivate routes', function (string $action) {
    $branch = BranchModel::factory()->create(['status' => BranchStatusEnum::Suspended]);
    $this->actingAs(AdminModel::factory()->create(), 'admin_api');

    $this->postJson("/api/v1/admin/branches/{$branch->id}/{$action}")->assertStatus(409);

    expect($branch->refresh()->status->value)->toBe(BranchStatusEnum::Suspended->value);
})->with(['activate', 'deactivate']);

it('refuses to deactivate the last enabled branch of a brand on the legacy route', function () {
    $branch = BranchModel::factory()->create();
    $this->actingAs(AdminModel::factory()->create(), 'admin_api');

    $this->postJson("/api/v1/admin/branches/{$branch->id}/deactivate")->assertStatus(409);

    expect($branch->refresh()->status->value)->toBe(BranchStatusEnum::Enabled->value);
});

it('records the legacy branch switch in the status history', function () {
    $branch = BranchModel::factory()->create();
    BranchModel::factory()->create(['brand_id' => $branch->brand_id]);
    $admin = AdminModel::factory()->create();
    $this->actingAs($admin, 'admin_api');

    $this->postJson("/api/v1/admin/branches/{$branch->id}/deactivate")->assertCreated();

    $this->getJson("/api/v1/admin/audit/branch/{$branch->id}")->assertOk()->assertJsonPath('data.0.to_status', 'disabled');
});

it('refuses a branch switching a pending or rejected barber it manages', function (BarberStatusEnum $status, string $action) {
    $branch = BranchModel::factory()->create();
    $barber = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id, 'status' => $status]);
    $this->actingAs($branch, 'branch_api');

    $this->postJson("/api/v1/branch/barbers/{$barber->id}/{$action}")->assertStatus(409);

    expect($barber->refresh()->status)->toBe($status);
})->with([
    'pending activate' => [BarberStatusEnum::Pending, 'activate'],
    'rejected activate' => [BarberStatusEnum::Rejected, 'activate'],
    'pending deactivate' => [BarberStatusEnum::Pending, 'deactivate'],
    'rejected deactivate' => [BarberStatusEnum::Rejected, 'deactivate'],
]);
