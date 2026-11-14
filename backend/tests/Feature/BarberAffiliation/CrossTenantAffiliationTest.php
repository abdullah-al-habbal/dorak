<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;

/**
 * Batch 1 remediation: an actor who owns nothing in a brand or branch cannot answer, end or read that branch's
 * affiliations. Every refusal is checked for the response, for unchanged rows and for no audit row or notice.
 * A control request from the real owner runs first, so a refusal cannot be a mistyped URL.
 */
function crossTenantWorld(): array
{
    $make = function (): array {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);

        return ['owner' => $owner, 'brand' => $brand, 'branch' => BranchModel::factory()->create(['brand_id' => $brand->id])];
    };

    return ['mine' => $make(), 'theirs' => $make()];
}

function crossTenantRequest(BranchModel $branch, bool $active = false): BarberAffiliationModel
{
    $barber = BarberModel::factory()->create();
    $factory = $active ? BarberAffiliationModel::factory() : BarberAffiliationModel::factory()->pending();

    return $factory->create([
        'barber_id' => $barber->id,
        'affiliable_id' => $branch->id,
        'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
        'initiated_by_id' => $barber->id,
    ]);
}

/** @return array{rows: array<int, object>, logs: int} */
function crossTenantSnapshot(): array
{
    return [
        'rows' => DB::table('barber_affiliations')->orderBy('id')->get()->all(),
        'logs' => DB::table('status_change_logs')->count(),
    ];
}

function crossTenantActAs(object $actor): void
{
    app('auth')->forgetGuards();
    test()->flushHeaders();
    test()->authenticateDashboardActor($actor);
}

describe('Branch API', function (): void {
    it('answers 404 to another branch and changes nothing', function (): void {
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $world = crossTenantWorld();
        $theirs = $this->actingAs($world['theirs']['branch'], 'branch_api');
        $theirs->postJson('/api/v1/branch/affiliations/'.crossTenantRequest($world['theirs']['branch'])->id.'/reject')->assertOk();
        $theirs->postJson('/api/v1/branch/affiliations/'.crossTenantRequest($world['theirs']['branch'], active: true)->id.'/terminate')->assertOk();

        $pending = crossTenantRequest($world['theirs']['branch']);
        $active = crossTenantRequest($world['theirs']['branch'], active: true);
        $before = crossTenantSnapshot();
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $intruder = $this->actingAs($world['mine']['branch'], 'branch_api');

        $intruder->postJson("/api/v1/branch/affiliations/{$pending->id}/accept")->assertNotFound();
        $intruder->postJson("/api/v1/branch/affiliations/{$pending->id}/reject")->assertNotFound();
        $intruder->postJson("/api/v1/branch/affiliations/{$active->id}/terminate")->assertNotFound();

        expect(crossTenantSnapshot())->toEqual($before);
        Queue::assertNothingPushed();
        Notification::assertNothingSent();
        Mail::assertNothingSent();
    });

    it('does not list another branch\'s affiliations', function (): void {
        $world = crossTenantWorld();
        $theirs = crossTenantRequest($world['theirs']['branch']);
        crossTenantRequest($world['mine']['branch']);

        $ids = collect($this->actingAs($world['mine']['branch'], 'branch_api')->getJson('/api/v1/branch/affiliations')->assertOk()->json('data'))->pluck('id');

        expect($ids)->toHaveCount(1)->and($ids->contains($theirs->id))->toBeFalse();
    });
});

describe('Dashboard', function (): void {
    it('answers 404 to another brand\'s owner on a foreign branch and on his own branch, and changes nothing', function (): void {
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $world = crossTenantWorld();
        $control = crossTenantRequest($world['mine']['branch']);
        crossTenantActAs($world['mine']['owner']);
        $this->postJson("/api/v1/dashboard/branches/{$world['mine']['branch']->id}/affiliations/{$control->id}/accept")->assertOk();

        $pending = crossTenantRequest($world['theirs']['branch']);
        $active = crossTenantRequest($world['theirs']['branch'], active: true);
        $before = crossTenantSnapshot();
        Queue::fake();
        Notification::fake();
        Mail::fake();

        foreach ([$world['theirs']['branch'], $world['mine']['branch']] as $branch) {
            $base = "/api/v1/dashboard/branches/{$branch->id}/affiliations";
            $this->postJson("{$base}/{$pending->id}/accept")->assertNotFound();
            $this->postJson("{$base}/{$pending->id}/reject")->assertNotFound();
            $this->postJson("{$base}/{$active->id}/terminate")->assertNotFound();
        }

        expect(crossTenantSnapshot())->toEqual($before);
        Queue::assertNothingPushed();
        Notification::assertNothingSent();
        Mail::assertNothingSent();
    });

    it('answers 404 to listing and inviting for another brand\'s branch and writes nothing', function (): void {
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $world = crossTenantWorld();
        $barber = BarberModel::factory()->create();
        crossTenantActAs($world['mine']['owner']);
        $own = "/api/v1/dashboard/branches/{$world['mine']['branch']->id}/affiliations";
        $this->getJson($own)->assertOk();
        $foreign = "/api/v1/dashboard/branches/{$world['theirs']['branch']->id}/affiliations";
        $before = crossTenantSnapshot();

        $this->getJson($foreign)->assertNotFound();
        $this->postJson($foreign, ['barber_id' => $barber->id])->assertNotFound();

        expect(crossTenantSnapshot())->toEqual($before);
        Queue::assertNothingPushed();
        Notification::assertNothingSent();
        Mail::assertNothingSent();
    });
});

describe('Barber API', function (): void {
    it('forbids another barber from answering or ending someone else\'s affiliation', function (): void {
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $branch = crossTenantWorld()['theirs']['branch'];
        $pending = BarberAffiliationModel::factory()->pending()->create(['affiliable_id' => $branch->id, 'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch, 'initiated_by_id' => $branch->id]);
        $active = BarberAffiliationModel::factory()->create(['affiliable_id' => $branch->id]);
        $owner = $this->actingAs(BarberModel::query()->findOrFail($pending->barber_id), 'barber');
        $control = BarberAffiliationModel::factory()->pending()->create(['barber_id' => $pending->barber_id, 'affiliable_id' => $branch->id, 'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch, 'initiated_by_id' => $branch->id]);
        $owner->postJson("/api/v1/affiliations/{$control->id}/reject")->assertOk();
        Queue::fake();
        Notification::fake();
        Mail::fake();
        $before = crossTenantSnapshot();

        $intruder = $this->actingAs(BarberModel::factory()->create(), 'barber');
        $intruder->postJson("/api/v1/affiliations/{$pending->id}/accept")->assertForbidden();
        $intruder->postJson("/api/v1/affiliations/{$pending->id}/reject")->assertForbidden();
        $intruder->postJson("/api/v1/affiliations/{$active->id}/terminate")->assertForbidden();

        expect(crossTenantSnapshot())->toEqual($before);
        Queue::assertNothingPushed();
        Notification::assertNothingSent();
        Mail::assertNothingSent();
    });
});
