<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\OfferedService\Models\OfferedServiceModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

function menuService(string $type, string $ownerId, array $overrides = []): OfferedServiceModel
{
    return OfferedServiceModel::factory()->create([
        'serviceable_type' => $type,
        'serviceable_id' => $ownerId,
        'catalog_item_id' => null,
        'is_active' => true,
        ...$overrides,
    ]);
}

describe('branch detail menu', function (): void {
    it('lists the brand\'s services even with no seated barbers', function (): void {
        $brand = BrandModel::factory()->create();
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $brandService = menuService('brand', $brand->id);

        $services = $this->getJson("/api/v1/explore/branches/{$branch->id}")->assertOk()->json('data.services');

        expect(collect($services)->pluck('id')->all())->toEqualCanonicalizing([$brandService->id])
            ->and(collect($services)->pluck('owner', 'id')->all())->toEqual([$brandService->id => 'brand']);
    });

    it('adds seated barbers\' services tagged as barber', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
        $barberService = menuService('barber', $barber->id);

        $services = collect($this->getJson("/api/v1/explore/branches/{$branch->id}")->json('data.services'));

        expect($services->firstWhere('id', $barberService->id)['owner'] ?? null)->toBe('barber');
    });

    it('never returns inactive services or services of an inactive catalog item', function (): void {
        $branch = BranchModel::factory()->create();
        $inactiveItem = ServiceCatalogItemModel::factory()->create(['is_active' => false]);
        menuService('brand', $branch->brand_id, ['is_active' => false]);
        menuService('brand', $branch->brand_id, ['catalog_item_id' => $inactiveItem->id]);
        $freeText = menuService('brand', $branch->brand_id);

        $ids = collect($this->getJson("/api/v1/explore/branches/{$branch->id}")->json('data.services'))->pluck('id')->all();

        expect($ids)->toBe([$freeText->id]);
    });
});

describe('floor plan chairs', function (): void {
    it('includes the seated barber\'s services and the shop menu for empty chairs', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $seated = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id]);
        $empty = ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => null]);
        $barberService = menuService('barber', $barber->id);
        $shopService = menuService('brand', $branch->brand_id);

        $startsAt = now()->addDay()->startOfHour()->utc()->format('Y-m-d\\TH:i:s\\Z');
        $data = $this->getJson("/api/v1/branches/{$branch->id}/floor-plan?starts_at={$startsAt}&duration=30")->assertOk()->json('data');
        $chairs = collect($data['chairs'])->keyBy('id');

        expect($chairs[$seated->id]['services_source'])->toBe('barber')
            ->and(collect($chairs[$seated->id]['barber']['services'])->pluck('id')->all())->toBe([$barberService->id])
            ->and($chairs[$empty->id]['services_source'])->toBe('branch')
            ->and($chairs[$empty->id]['barber'])->toBeNull()
            ->and(collect($data['branch_services'])->pluck('id')->all())->toBe([$shopService->id]);
    });
});

describe('barber detail workplaces', function (): void {
    it('lists accepted affiliations only, with the chair label', function (): void {
        $barber = BarberModel::factory()->create(['is_freelancer' => true]);
        $branch = BranchModel::factory()->create();
        $brand = BrandModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $branch->id, 'barber_id' => $barber->id, 'label' => 'Chair 4']);
        BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_type' => AffiliableType::Branch, 'affiliable_id' => $branch->id, 'status' => AffiliationStatus::Active]);
        BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_type' => AffiliableType::Brand, 'affiliable_id' => $brand->id, 'status' => AffiliationStatus::Active]);
        BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_type' => AffiliableType::Branch, 'affiliable_id' => BranchModel::factory()->create()->id, 'status' => AffiliationStatus::Pending]);
        BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_type' => AffiliableType::Branch, 'affiliable_id' => BranchModel::factory()->create()->id, 'status' => AffiliationStatus::Terminated]);

        $data = $this->getJson("/api/v1/explore/barbers/{$barber->id}")->assertOk()->json('data');

        expect($data['workplaces'])->toHaveCount(2)
            ->and(collect($data['workplaces'])->firstWhere('type', 'branch'))->toMatchArray(['id' => $branch->id, 'chair_label' => 'Chair 4'])
            ->and(collect($data['workplaces'])->firstWhere('type', 'brand'))->toMatchArray(['id' => $brand->id, 'chair_label' => null])
            ->and($data)->toHaveKeys(['rating_avg', 'rating_count']);
    });
});
