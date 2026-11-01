<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;

it('terminates pending and active affiliations pointing at a deleted brand', function (): void {
    $brand = BrandModel::factory()->create();
    $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);

    $brandAffiliation = BarberAffiliationModel::factory()->create([
        'barber_id' => BarberModel::factory()->create()->id,
        'affiliable_id' => $brand->id,
        'affiliable_type' => AffiliableType::Brand,
        'status' => AffiliationStatus::Active,
    ]);
    $branchAffiliation = BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => BarberModel::factory()->create()->id,
        'affiliable_id' => $branch->id,
        'affiliable_type' => AffiliableType::Branch,
    ]);
    $rejectedAffiliation = BarberAffiliationModel::factory()->create([
        'barber_id' => BarberModel::factory()->create()->id,
        'affiliable_id' => $brand->id,
        'affiliable_type' => AffiliableType::Brand,
        'status' => AffiliationStatus::Rejected,
    ]);

    $brand->delete();

    expect($brandAffiliation->refresh()->status)->toBe(AffiliationStatus::Terminated);
    expect($brandAffiliation->terminated_at)->not->toBeNull();
    expect($branchAffiliation->refresh()->status)->toBe(AffiliationStatus::Terminated);
    expect($rejectedAffiliation->refresh()->status)->toBe(AffiliationStatus::Rejected);
});
