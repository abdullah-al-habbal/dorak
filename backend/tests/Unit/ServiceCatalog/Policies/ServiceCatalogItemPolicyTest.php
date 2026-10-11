<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;
use Modules\ServiceCatalog\Policies\ServiceCatalogItemPolicy;

it('allows only admins to create, update, and delete catalog items', function (): void {
    $policy = new ServiceCatalogItemPolicy;
    $item = ServiceCatalogItemModel::factory()->make();

    foreach ([AdminModel::factory()->make()] as $admin) {
        expect($policy->create($admin))->toBeTrue()
            ->and($policy->update($admin, $item))->toBeTrue()
            ->and($policy->delete($admin, $item))->toBeTrue();
    }

    foreach ([BranchModel::factory()->make(), ClientModel::factory()->make()] as $nonAdmin) {
        expect($policy->create($nonAdmin))->toBeFalse()
            ->and($policy->update($nonAdmin, $item))->toBeFalse()
            ->and($policy->delete($nonAdmin, $item))->toBeFalse();
    }
});
