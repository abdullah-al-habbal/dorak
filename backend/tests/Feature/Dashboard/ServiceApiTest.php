<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\OfferedService\Models\OfferedServiceModel;

describe('Dashboard Service API', function (): void {
    beforeEach(function (): void {
        $this->admin = AdminModel::factory()->create();
        $this->branch = BranchModel::factory()->create();
        $this->otherBranch = BranchModel::factory()->create();
    });

    it('lets an admin create a branch-owned service', function (): void {
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->branch, $currency))
            ->assertCreated()
            ->assertJsonPath('data.serviceable_id', $this->branch->id);
    });

    it('lets an admin update and delete a service', function (): void {
        $service = OfferedServiceModel::factory()->branchService()->create(['serviceable_id' => $this->branch->id]);
        $this->authenticateDashboardActor($this->admin);
        $currency = CurrencyModel::factory()->create();

        $this->putJson("/api/v1/dashboard/services/{$service->id}", servicePayload($this->branch, $currency, ['price' => 31]))
            ->assertOk()
            ->assertJsonPath('data.price', 31);
        $this->deleteJson("/api/v1/dashboard/services/{$service->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/services/{$service->id}")->assertNotFound();
    });

    it('scopes a branch manager to services owned by its branch', function (): void {
        $own = OfferedServiceModel::factory()->branchService()->create(['serviceable_id' => $this->branch->id]);
        $other = OfferedServiceModel::factory()->branchService()->create(['serviceable_id' => $this->otherBranch->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->getJson("/api/v1/dashboard/services/{$own->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/services/{$other->id}")->assertNotFound();
        $this->getJson('/api/v1/dashboard/services')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('rejects a branch manager attempting to create a service for another owner', function (): void {
        $this->authenticateDashboardActor($this->branch);
        $currency = CurrencyModel::factory()->create();

        $this->postJson('/api/v1/dashboard/services', servicePayload($this->otherBranch, $currency))
            ->assertForbidden();
    });
});

function servicePayload(BranchModel $branch, CurrencyModel $currency, array $overrides = []): array
{
    return array_replace([
        'serviceable_id' => $branch->id,
        'serviceable_type' => 'branch',
        'catalog_item_id' => null,
        'currency_id' => $currency->id,
        'name' => ['en' => 'Haircut', 'ar' => 'قص شعر'],
        'price' => 25,
        'duration' => 30,
        'active' => true,
    ], $overrides);
}
