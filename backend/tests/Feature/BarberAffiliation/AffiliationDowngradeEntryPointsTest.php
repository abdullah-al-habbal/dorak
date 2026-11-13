<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Admin\Models\AdminModel;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Jobs\AffiliationInvitedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandFeatureConstants;
use Modules\Brand\Models\BrandModel;
use Modules\Brand\Services\BrandFeatures;
use Modules\Client\Models\ClientModel;

/**
 * Batch 1 (WP-1): after a multi_branch downgrade only the brand's original branch may be managed. Inviting
 * and accepting (adding a barber) obey that on the branch API, the dashboard and the service layer alike;
 * rejecting and ending stay open. Barber-initiated paths are not given this check here: it would surface
 * 403 feature_not_enabled in the barber app, which signs the user out until the mobile fix (Batch 2).
 *
 * @return array{owner: ClientModel, brand: BrandModel, original: BranchModel, extra: BranchModel}
 */
function downgradeEntryWorld(): array
{
    $owner = ClientModel::factory()->create();
    $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
    $original = BranchModel::factory()->create(['brand_id' => $brand->id]);
    test()->travel(10)->minutes();
    $extra = BranchModel::factory()->create(['brand_id' => $brand->id]);
    app(BrandFeatures::class)->set($brand, [BrandFeatureConstants::BRAND_FEATURE_MULTI_BRANCH => false]);

    return ['owner' => $owner, 'brand' => $brand, 'original' => $original, 'extra' => $extra];
}

function downgradeEntryRequest(BranchModel $branch, AffiliationStatus $status = AffiliationStatus::Pending): BarberAffiliationModel
{
    $barber = BarberModel::factory()->create();

    return BarberAffiliationModel::factory()->create([
        'barber_id' => $barber->id,
        'affiliable_id' => $branch->id,
        'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
        'initiated_by_id' => $barber->id,
        'status' => $status,
        'accepted_at' => $status === AffiliationStatus::Active ? now() : null,
    ]);
}

describe('Branch API on a downgraded brand', function (): void {
    it('refuses to invite into a non-original branch and writes nothing, but still invites into the original', function (): void {
        Queue::fake();
        $world = downgradeEntryWorld();
        $barber = BarberModel::factory()->create();

        $this->actingAs($world['extra'], 'branch_api')->postJson('/api/v1/branch/affiliations', ['barber_id' => $barber->id])
            ->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');
        expect(BarberAffiliationModel::query()->count())->toBe(0)->and(StatusChangeLogModel::query()->count())->toBe(0);
        Queue::assertNotPushed(AffiliationInvitedNotification::class);

        app('auth')->forgetGuards();
        $this->actingAs($world['original'], 'branch_api')->postJson('/api/v1/branch/affiliations', ['barber_id' => $barber->id])->assertCreated();
    });

    it('refuses to accept a request at a non-original branch, leaves it pending, yet still lets the branch reject and end', function (): void {
        $world = downgradeEntryWorld();
        $request = downgradeEntryRequest($world['extra']);
        $active = downgradeEntryRequest($world['extra'], AffiliationStatus::Active);
        $rejected = downgradeEntryRequest($world['extra']);
        $this->actingAs($world['extra'], 'branch_api');

        $this->postJson("/api/v1/branch/affiliations/{$request->id}/accept")->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');
        expect($request->fresh())->status->toBe(AffiliationStatus::Pending)->accepted_at->toBeNull()
            ->and(StatusChangeLogModel::query()->where('subject_id', $request->id)->count())->toBe(0);

        $this->postJson("/api/v1/branch/affiliations/{$rejected->id}/reject")->assertOk();
        $this->postJson("/api/v1/branch/affiliations/{$active->id}/terminate")->assertOk();
        expect($rejected->fresh()->status)->toBe(AffiliationStatus::Rejected)->and($active->fresh()->status)->toBe(AffiliationStatus::Terminated);
    });

    it('accepts a request at the original branch', function (): void {
        $world = downgradeEntryWorld();
        $request = downgradeEntryRequest($world['original']);

        $this->actingAs($world['original'], 'branch_api')->postJson("/api/v1/branch/affiliations/{$request->id}/accept")->assertOk();

        expect($request->fresh()->status)->toBe(AffiliationStatus::Active);
    });
});

describe('Dashboard on a downgraded brand', function (): void {
    it('refuses the owner and the admin to accept at a non-original branch and keeps reject open', function (): void {
        $world = downgradeEntryWorld();
        $request = downgradeEntryRequest($world['extra']);
        $url = "/api/v1/dashboard/branches/{$world['extra']->id}/affiliations/{$request->id}";

        $this->authenticateDashboardActor($world['owner']);
        $this->postJson("{$url}/accept")->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->postJson("{$url}/accept")->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');
        expect($request->fresh()->status)->toBe(AffiliationStatus::Pending);

        $this->postJson("{$url}/reject")->assertOk();
        expect($request->fresh()->status)->toBe(AffiliationStatus::Rejected);
    });

    it('invites through the shared resolver: a non-original branch is refused with no row, for the owner and the admin', function (): void {
        $world = downgradeEntryWorld();
        $barber = BarberModel::factory()->create();

        $this->authenticateDashboardActor($world['owner']);
        $this->postJson("/api/v1/dashboard/branches/{$world['extra']->id}/affiliations", ['barber_id' => $barber->id])
            ->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->postJson("/api/v1/dashboard/branches/{$world['extra']->id}/affiliations", ['barber_id' => $barber->id])
            ->assertForbidden()->assertJsonPath('code', 'feature_not_enabled');

        expect(BarberAffiliationModel::query()->count())->toBe(0);
    });
});
