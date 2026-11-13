<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;

/**
 * Batch 1 (WP-1): affiliation changes read the row under a lock, in the order barber, affiliation, brand.
 *
 * Limit: Feature tests run inside one uncommitted transaction (RefreshDatabase), so a second connection
 * cannot see their rows. These tests therefore pin the real MySQL lock statements and their order, not a live race.
 */

/** @return list<string> the tables read with FOR UPDATE, in order */
function lockOrderRecord(Closure $action): array
{
    $tables = [];
    DB::listen(function ($query) use (&$tables): void {
        if (str_contains(strtolower($query->sql), ' for update') && preg_match('/from `(\w+)`/i', $query->sql, $match) === 1) {
            $tables[] = $match[1];
        }
    });
    $action();

    return $tables;
}

/** @return array{branch: BranchModel, barber: BarberModel} */
function lockOrderWorld(): array
{
    $brand = BrandModel::factory()->create();

    return ['branch' => BranchModel::factory()->create(['brand_id' => $brand->id]), 'barber' => BarberModel::factory()->create()];
}

function lockOrderRow(array $world, AffiliationInitiatorTypeEnum $by, AffiliationStatus $status = AffiliationStatus::Pending): BarberAffiliationModel
{
    return BarberAffiliationModel::factory()->create([
        'barber_id' => $world['barber']->id,
        'affiliable_id' => $world['branch']->id,
        'initiated_by_type' => $by,
        'initiated_by_id' => $by === AffiliationInitiatorTypeEnum::Branch ? $world['branch']->id : $world['barber']->id,
        'status' => $status,
        'accepted_at' => null,
    ]);
}

describe('Lock order', function (): void {
    beforeEach(fn () => Queue::fake());

    it('locks barber, affiliation, brand when the barber accepts', function (): void {
        $world = lockOrderWorld();
        $invite = lockOrderRow($world, AffiliationInitiatorTypeEnum::Branch);
        $this->actingAs($world['barber'], 'barber');

        $tables = lockOrderRecord(fn () => $this->postJson("/api/v1/affiliations/{$invite->id}/accept")->assertOk());

        expect($tables)->toBe(['barbers', 'barber_affiliations', 'brands']);
    });

    it('locks barber, affiliation, brand when the branch answers over the branch API', function (): void {
        $world = lockOrderWorld();
        $request = lockOrderRow($world, AffiliationInitiatorTypeEnum::Barber);
        $this->actingAs($world['branch'], 'branch_api');

        $tables = lockOrderRecord(fn () => $this->postJson("/api/v1/branch/affiliations/{$request->id}/accept")->assertOk());

        expect($tables)->toBe(['barbers', 'barber_affiliations', 'brands']);
    });

    it('locks barber then brand when a barber requests and when a branch invites', function (): void {
        $world = lockOrderWorld();
        $this->actingAs($world['barber'], 'barber');
        $request = lockOrderRecord(fn () => $this->postJson("/api/v1/barbers/{$world['barber']->id}/affiliate", ['affiliable_id' => $world['branch']->id, 'affiliable_type' => 'branch'])->assertCreated());

        $other = BarberModel::factory()->create();
        app('auth')->forgetGuards();
        $this->actingAs($world['branch'], 'branch_api');
        $invite = lockOrderRecord(fn () => $this->postJson('/api/v1/branch/affiliations', ['barber_id' => $other->id])->assertCreated());

        expect($request)->toBe(['barbers', 'brands'])->and($invite)->toBe(['barbers', 'brands']);
    });

    it('locks only the affiliation when answering with a reject or an end', function (): void {
        $world = lockOrderWorld();
        $invite = lockOrderRow($world, AffiliationInitiatorTypeEnum::Branch);
        $active = lockOrderRow($world, AffiliationInitiatorTypeEnum::Branch, AffiliationStatus::Active);
        $this->actingAs($world['barber'], 'barber');

        $reject = lockOrderRecord(fn () => $this->postJson("/api/v1/affiliations/{$invite->id}/reject")->assertOk());
        $end = lockOrderRecord(fn () => $this->postJson("/api/v1/affiliations/{$active->id}/terminate")->assertOk());

        expect($reject)->toBe(['barber_affiliations'])->and($end)->toBe(['barber_affiliations']);
    });
});

describe('A second answer to the same request', function (): void {
    beforeEach(fn () => Queue::fake());

    it('is refused and leaves one audit row (barber app)', function (): void {
        $world = lockOrderWorld();
        $invite = lockOrderRow($world, AffiliationInitiatorTypeEnum::Branch);
        $this->actingAs($world['barber'], 'barber');

        $this->postJson("/api/v1/affiliations/{$invite->id}/accept")->assertOk();
        $this->postJson("/api/v1/affiliations/{$invite->id}/accept")->assertStatus(400);
        $this->postJson("/api/v1/affiliations/{$invite->id}/reject")->assertStatus(400);

        expect($invite->fresh()->status)->toBe(AffiliationStatus::Active)
            ->and(StatusChangeLogModel::query()->where('subject_id', $invite->id)->count())->toBe(1);
    });

    it('is refused and leaves one audit row (branch API)', function (): void {
        $world = lockOrderWorld();
        $request = lockOrderRow($world, AffiliationInitiatorTypeEnum::Barber);
        $this->actingAs($world['branch'], 'branch_api');

        $this->postJson("/api/v1/branch/affiliations/{$request->id}/reject")->assertOk();
        $this->postJson("/api/v1/branch/affiliations/{$request->id}/accept")->assertStatus(400);

        expect($request->fresh()->status)->toBe(AffiliationStatus::Rejected)
            ->and(StatusChangeLogModel::query()->where('subject_id', $request->id)->count())->toBe(1);
    });
});
