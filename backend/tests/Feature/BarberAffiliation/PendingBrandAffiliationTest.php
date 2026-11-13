<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Admin\Models\AdminModel;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Branch\InviteAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Handlers\Branch\InviteAffiliationHandler;
use Modules\BarberAffiliation\Jobs\AffiliationInvitedNotification;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Branch\Services\BranchAffiliationResponder;
use Modules\Brand\Exceptions\BrandNotApprovedException;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;

/**
 * D11, resolved 2026-11-13: accepting a barber's join request counts as adding a barber, so a Pending
 * brand cannot create, send or accept an affiliation through any entry point, whoever acts.
 * Rejecting and terminating stay allowed.
 *
 * @return array{owner: ClientModel, brand: BrandModel, branch: BranchModel}
 */
function pendingBrandWorld(bool $pending = true): array
{
    $owner = ClientModel::factory()->create();
    $brand = $pending ? BrandModel::factory()->pending()->create(['owner_id' => $owner->id]) : BrandModel::factory()->create(['owner_id' => $owner->id]);

    return ['owner' => $owner, 'brand' => $brand, 'branch' => BranchModel::factory()->create(['brand_id' => $brand->id])];
}

/** A branch's invitation waiting for the barber. */
function pendingBrandInvite(BranchModel $branch, ?BarberModel $barber = null): BarberAffiliationModel
{
    return BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => ($barber ?? BarberModel::factory()->create())->id,
        'affiliable_id' => $branch->id,
        'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
        'initiated_by_id' => $branch->id,
    ]);
}

/** A barber's join request waiting for the branch. */
function pendingBrandRequest(BranchModel $branch): BarberAffiliationModel
{
    return BarberAffiliationModel::factory()->pending()->create([
        'affiliable_id' => $branch->id,
        'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
        'initiated_by_id' => null,
    ]);
}

function pendingBrandLogCount(): int
{
    return StatusChangeLogModel::query()->where('subject_type', 'affiliation')->count();
}

function pendingBrandAssertUntouched(BarberAffiliationModel $affiliation): void
{
    expect($affiliation->fresh())->status->toBe(AffiliationStatus::Pending)->accepted_at->toBeNull()
        ->and(pendingBrandLogCount())->toBe(0);
}

describe('A barber cannot join a Pending brand (barber app)', function (): void {
    it('refuses a join request to a branch of a Pending brand and writes nothing', function (): void {
        Queue::fake();
        $world = pendingBrandWorld();
        $barber = BarberModel::factory()->create();

        $this->actingAs($barber, 'barber')
            ->postJson("/api/v1/barbers/{$barber->id}/affiliate", ['affiliable_id' => $world['branch']->id, 'affiliable_type' => AffiliableType::Branch->value])
            ->assertForbidden()
            ->assertJsonPath('code', 'brand_not_approved')
            ->assertJsonPath('success', false);

        $this->assertDatabaseCount('barber_affiliations', 0);
        expect(pendingBrandLogCount())->toBe(0);
        Queue::assertNothingPushed();
    });

    it('refuses a join request addressed to the Pending brand itself', function (): void {
        $world = pendingBrandWorld();
        $barber = BarberModel::factory()->create();

        $this->actingAs($barber, 'barber')
            ->postJson("/api/v1/barbers/{$barber->id}/affiliate", ['affiliable_id' => $world['brand']->id, 'affiliable_type' => AffiliableType::Brand->value])
            ->assertForbidden()
            ->assertJsonPath('code', 'brand_not_approved');

        $this->assertDatabaseCount('barber_affiliations', 0);
    });

    it('still accepts a join request to an approved brand and to its branch', function (): void {
        Queue::fake();
        $world = pendingBrandWorld(pending: false);
        $barber = BarberModel::factory()->create();
        $this->actingAs($barber, 'barber');

        $this->postJson("/api/v1/barbers/{$barber->id}/affiliate", ['affiliable_id' => $world['branch']->id, 'affiliable_type' => AffiliableType::Branch->value])->assertCreated();
        $this->postJson("/api/v1/barbers/{$barber->id}/affiliate", ['affiliable_id' => $world['brand']->id, 'affiliable_type' => AffiliableType::Brand->value])->assertCreated();

        $this->assertDatabaseCount('barber_affiliations', 2);
    });

    it('refuses to accept an invitation from a Pending brand and rolls the whole change back', function (): void {
        Queue::fake();
        $world = pendingBrandWorld();
        $barber = BarberModel::factory()->create();
        $invite = pendingBrandInvite($world['branch'], $barber);

        $this->actingAs($barber, 'barber')
            ->postJson("/api/v1/affiliations/{$invite->id}/accept")
            ->assertForbidden()
            ->assertJsonPath('code', 'brand_not_approved');

        pendingBrandAssertUntouched($invite);
        Queue::assertNothingPushed();
    });

    it('lets the barber reject such an invitation and end an affiliation that already exists', function (): void {
        Queue::fake();
        $world = pendingBrandWorld();
        $barber = BarberModel::factory()->create();
        $invite = pendingBrandInvite($world['branch'], $barber);
        $existing = BarberAffiliationModel::factory()->create(['barber_id' => $barber->id, 'affiliable_id' => $world['branch']->id]);
        $this->actingAs($barber, 'barber');

        $this->postJson("/api/v1/affiliations/{$invite->id}/reject")->assertOk();
        $this->postJson("/api/v1/affiliations/{$existing->id}/terminate")->assertOk();

        expect($invite->fresh()->status)->toBe(AffiliationStatus::Rejected)
            ->and($existing->fresh()->status)->toBe(AffiliationStatus::Terminated);
    });

    it('accepts the same invitation once the brand is approved', function (): void {
        Queue::fake();
        $world = pendingBrandWorld();
        $barber = BarberModel::factory()->create();
        $invite = pendingBrandInvite($world['branch'], $barber);
        $this->actingAs($barber, 'barber');
        $this->postJson("/api/v1/affiliations/{$invite->id}/accept")->assertForbidden();

        $world['brand']->update(['status' => 'active']);

        $this->postJson("/api/v1/affiliations/{$invite->id}/accept")->assertOk();
        expect($invite->fresh())->status->toBe(AffiliationStatus::Active)->accepted_at->not->toBeNull();
    });

    it('refuses to accept a brand-level invitation while the brand is Pending', function (): void {
        $world = pendingBrandWorld();
        $barber = BarberModel::factory()->create();
        $invite = BarberAffiliationModel::factory()->pending()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $world['brand']->id,
            'affiliable_type' => AffiliableType::Brand,
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
            'initiated_by_id' => $world['branch']->id,
        ]);

        $this->actingAs($barber, 'barber')->postJson("/api/v1/affiliations/{$invite->id}/accept")->assertForbidden()->assertJsonPath('code', 'brand_not_approved');

        pendingBrandAssertUntouched($invite);
    });
});

describe('A Pending brand cannot add a barber (branch account API and service layer)', function (): void {
    it('keeps the branch account closed on every affiliation route while the brand is Pending', function (): void {
        Queue::fake();
        $world = pendingBrandWorld();
        $request = pendingBrandRequest($world['branch']);
        $this->actingAs($world['branch'], 'branch_api');

        // EnsureBranchAccountAccess answers first, for invite, accept, reject and terminate alike.
        $this->postJson('/api/v1/branch/affiliations', ['barber_id' => BarberModel::factory()->create()->id])->assertForbidden()->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');
        $this->postJson("/api/v1/branch/affiliations/{$request->id}/accept")->assertForbidden()->assertJsonPath('code', 'ACCOUNT_NOT_ACTIVE');

        $this->assertDatabaseCount('barber_affiliations', 1);
        pendingBrandAssertUntouched($request);
        Queue::assertNothingPushed();
    });

    it('refuses to invite and to accept in the service layer even when the route guard is bypassed', function (): void {
        $world = pendingBrandWorld();
        $request = pendingBrandRequest($world['branch']);
        $barber = BarberModel::factory()->create();

        expect(fn () => app(InviteAffiliationHandler::class)->handle(new InviteAffiliationCommand($world['branch']->id, $barber->id, null)))
            ->toThrow(BrandNotApprovedException::class);
        expect(fn () => app(BranchAffiliationResponder::class)->respond($world['branch'], $request->id, accept: true))
            ->toThrow(BrandNotApprovedException::class);

        $this->assertDatabaseCount('barber_affiliations', 1);
        pendingBrandAssertUntouched($request);
    });

    it('still lets the service layer reject a request, and invite and accept once the brand is approved', function (): void {
        Queue::fake();
        $pending = pendingBrandWorld();
        $rejected = pendingBrandRequest($pending['branch']);
        $approved = pendingBrandWorld(pending: false);
        $accepted = pendingBrandRequest($approved['branch']);

        $reject = app(BranchAffiliationResponder::class)->respond($pending['branch'], $rejected->id, accept: false);
        $accept = app(BranchAffiliationResponder::class)->respond($approved['branch'], $accepted->id, accept: true);
        $invite = app(InviteAffiliationHandler::class)->handle(new InviteAffiliationCommand($approved['branch']->id, BarberModel::factory()->create()->id, null));

        expect($reject->status)->toBe(AffiliationStatus::Rejected)
            ->and($accept->status)->toBe(AffiliationStatus::Active)
            ->and($invite->status)->toBe(AffiliationStatus::Pending);
    });

    it('keeps inviting and accepting over the branch API for an approved brand', function (): void {
        Queue::fake();
        $world = pendingBrandWorld(pending: false);
        $request = pendingBrandRequest($world['branch']);
        $this->actingAs($world['branch'], 'branch_api');

        $this->postJson('/api/v1/branch/affiliations', ['barber_id' => BarberModel::factory()->create()->id])->assertCreated();
        $this->postJson("/api/v1/branch/affiliations/{$request->id}/accept")->assertOk();

        expect($request->fresh()->status)->toBe(AffiliationStatus::Active);
        Queue::assertPushed(AffiliationInvitedNotification::class, 1);
    });
});

describe('A Pending brand cannot add a barber (dashboard)', function (): void {
    it('refuses accept for the owner, the manager and the platform admin, and leaves the request pending', function (): void {
        Queue::fake();
        $world = pendingBrandWorld();
        $request = pendingBrandRequest($world['branch']);
        $url = "/api/v1/dashboard/branches/{$world['branch']->id}/affiliations/{$request->id}/accept";

        foreach ([$world['owner'], $world['branch'], AdminModel::factory()->create()] as $actor) {
            app('auth')->forgetGuards();
            $this->flushHeaders();
            $this->authenticateDashboardActor($actor);
            $this->postJson($url)->assertForbidden()->assertJsonPath('code', 'brand_not_approved');
        }

        pendingBrandAssertUntouched($request);
        Queue::assertNothingPushed();
    });

    it('refuses an invitation from the platform admin as it does from the owner', function (): void {
        $world = pendingBrandWorld();
        $barber = BarberModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson("/api/v1/dashboard/branches/{$world['branch']->id}/affiliations", ['barber_id' => $barber->id])
            ->assertForbidden()
            ->assertJsonPath('code', 'brand_not_approved');

        $this->assertDatabaseCount('barber_affiliations', 0);
    });

    it('still lets the owner reject a request and end an affiliation', function (): void {
        $world = pendingBrandWorld();
        $request = pendingBrandRequest($world['branch']);
        $active = BarberAffiliationModel::factory()->create(['affiliable_id' => $world['branch']->id]);
        $this->authenticateDashboardActor($world['owner']);
        $base = "/api/v1/dashboard/branches/{$world['branch']->id}/affiliations";

        $this->postJson("{$base}/{$request->id}/reject")->assertOk();
        $this->postJson("{$base}/{$active->id}/terminate")->assertOk();

        expect($request->fresh()->status)->toBe(AffiliationStatus::Rejected)
            ->and($active->fresh()->status)->toBe(AffiliationStatus::Terminated);
    });

    it('accepts the request once the brand is approved', function (): void {
        $world = pendingBrandWorld();
        $request = pendingBrandRequest($world['branch']);
        $this->authenticateDashboardActor($world['owner']);
        $url = "/api/v1/dashboard/branches/{$world['branch']->id}/affiliations/{$request->id}/accept";
        $this->postJson($url)->assertForbidden();

        $world['brand']->update(['status' => 'active']);

        $this->postJson($url)->assertOk()->assertJsonPath('data.status', 'active');
    });
});
