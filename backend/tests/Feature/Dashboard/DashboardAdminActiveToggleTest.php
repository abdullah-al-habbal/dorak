<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Currency\Models\CurrencyModel;
use Modules\Language\Models\LanguageModel;
use Modules\Payment\Models\PaymentGatewayModel;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

/** The four admin "active" switches share one contract: a boolean flag in, the stored flag out, nothing changed on bad input. */
function activeToggleSubjects(): array
{
    return [
        'currency' => [fn () => CurrencyModel::factory()->create(['is_default' => false, 'is_active' => true]), 'currencies'],
        'language' => [fn () => LanguageModel::factory()->create(['is_default' => false, 'is_active' => true]), 'languages'],
        'payment gateway' => [fn () => PaymentGatewayModel::factory()->count(2)->create(['is_active' => true, 'is_default' => false])->first(), 'payment-gateways'],
        'catalog category' => [fn () => ServiceCatalogCategoryModel::factory()->create(['is_active' => true]), 'catalog-categories'],
    ];
}

describe('Admin active switches', function (): void {
    beforeEach(function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
    });

    it('switches off and on again and returns the stored flag', function (Closure $make, string $path): void {
        $row = $make();
        $url = "/api/v1/dashboard/admin/{$path}/{$row->getKey()}/active";

        $this->patchJson($url, ['is_active' => false])->assertOk();
        expect((bool) $row->fresh()->is_active)->toBeFalse();

        $this->patchJson($url, ['is_active' => true])->assertOk();
        expect((bool) $row->fresh()->is_active)->toBeTrue();
    })->with(activeToggleSubjects());

    it('rejects a missing or non-boolean flag and leaves the row as it was', function (Closure $make, string $path): void {
        $row = $make();
        $url = "/api/v1/dashboard/admin/{$path}/{$row->getKey()}/active";

        $this->patchJson($url, [])->assertUnprocessable()->assertJsonValidationErrors(['is_active']);
        $this->patchJson($url, ['is_active' => 'maybe'])->assertUnprocessable()->assertJsonValidationErrors(['is_active']);
        $this->patchJson($url, ['is_active' => ['x']])->assertUnprocessable()->assertJsonValidationErrors(['is_active']);

        expect((bool) $row->fresh()->is_active)->toBeTrue();
    })->with(activeToggleSubjects());
});

describe('Admin payment gateway protection', function (): void {
    it('refuses to switch off the last active gateway and the default gateway', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $last = PaymentGatewayModel::factory()->create(['is_active' => true, 'is_default' => false]);

        $this->patchJson("/api/v1/dashboard/admin/payment-gateways/{$last->id}/active", ['is_active' => false])->assertStatus(409);
        expect($last->fresh()->is_active)->toBeTrue();

        $default = PaymentGatewayModel::factory()->create(['is_active' => true, 'is_default' => true]);

        $this->patchJson("/api/v1/dashboard/admin/payment-gateways/{$default->id}/active", ['is_active' => false])->assertStatus(409);
        expect($default->fresh()->is_active)->toBeTrue();
    });
});
