<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Database\Factories\BarberAffiliationFactory;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;

function chairAssignmentBranch(): BranchModel
{
    return BranchModel::factory()->create();
}

it('allows a barber managed by the branch to be assigned', function (): void {
    $branch = chairAssignmentBranch();
    $barber = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id]);
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson("/api/v1/chairs/{$chair->id}", ['barber_id' => $barber->id])->assertOk();
    expect($chair->fresh()->barber_id)->toBe($barber->id);
});

it('allows a barber with an accepted branch affiliation to be assigned', function (): void {
    $branch = chairAssignmentBranch();
    $barber = BarberModel::factory()->create();
    BarberAffiliationFactory::new()->create([
        'barber_id' => $barber->id,
        'affiliable_id' => $branch->id,
        'affiliable_type' => 'branch',
        'status' => AffiliationStatus::Active->value,
    ]);
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson("/api/v1/chairs/{$chair->id}", ['barber_id' => $barber->id])->assertOk();
    expect($chair->fresh()->barber_id)->toBe($barber->id);
});

it('allows a barber with an accepted affiliation to the branch brand', function (): void {
    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
    $barber = BarberModel::factory()->create();
    BarberAffiliationFactory::new()->create([
        'barber_id' => $barber->id,
        'affiliable_id' => $brand->id,
        'affiliable_type' => 'brand',
        'status' => AffiliationStatus::Active->value,
    ]);
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson("/api/v1/chairs/{$chair->id}", ['barber_id' => $barber->id])->assertOk();
    expect($chair->fresh()->barber_id)->toBe($barber->id);
});

it('rejects a foreign barber and leaves the chair unchanged', function (): void {
    $branch = chairAssignmentBranch();
    $current = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id]);
    $foreign = BarberModel::factory()->create();
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $current->id]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson("/api/v1/chairs/{$chair->id}", ['barber_id' => $foreign->id])
        ->assertUnprocessable()
        ->assertJsonStructure(['errors' => ['barber_id']]);
    expect($chair->fresh()->barber_id)->toBe($current->id);
});

it('clears the barber when barber_id is explicitly null', function (): void {
    $branch = chairAssignmentBranch();
    $barber = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id]);
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson("/api/v1/chairs/{$chair->id}", ['barber_id' => null])->assertOk();
    expect($chair->fresh()->barber_id)->toBeNull();
});

it('preserves the barber when barber_id is omitted', function (): void {
    $branch = chairAssignmentBranch();
    $barber = BarberModel::factory()->create(['managed_by_branch_id' => $branch->id]);
    $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
    $this->actingAs($branch, 'branch_api');

    $this->patchJson("/api/v1/chairs/{$chair->id}", ['label' => 'Updated'])->assertOk();
    expect($chair->fresh()->barber_id)->toBe($barber->id);
});
