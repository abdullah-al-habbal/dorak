<?php

declare(strict_types=1);

use Illuminate\Validation\ValidationException;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\CQRS\Command\Barber\CreateAffiliationCommand;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Handlers\Barber\CreateAffiliationHandler;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;

/**
 * Batch 1 (WP-1): a brand-level affiliation can never reach Active, because no party can answer it.
 * New requests are refused; rows that already exist are left alone and stay readable and endable.
 */
function brandLevelWorld(): array
{
    $brand = BrandModel::factory()->create();

    return ['brand' => $brand, 'branch' => BranchModel::factory()->create(['brand_id' => $brand->id])];
}

function brandLevelRow(BarberModel $barber, BrandModel $brand, BranchModel $branch, AffiliationStatus $status): BarberAffiliationModel
{
    return BarberAffiliationModel::factory()->create([
        'barber_id' => $barber->id,
        'affiliable_id' => $brand->id,
        'affiliable_type' => AffiliableType::Brand,
        'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
        'initiated_by_id' => $branch->id,
        'status' => $status,
        'accepted_at' => $status === AffiliationStatus::Active ? now() : null,
    ]);
}

describe('New brand-level requests are closed', function (): void {
    it('answers 422 on the affiliable_type field for an approved brand and writes nothing', function (): void {
        $world = brandLevelWorld();
        $barber = BarberModel::factory()->create();

        $this->actingAs($barber, 'barber')
            ->postJson("/api/v1/barbers/{$barber->id}/affiliate", ['affiliable_id' => $world['brand']->id, 'affiliable_type' => AffiliableType::Brand->value])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('affiliable_type');

        $this->assertDatabaseCount('barber_affiliations', 0);
        expect(StatusChangeLogModel::query()->count())->toBe(0);
    });

    it('refuses a brand-level command in the service layer even if the route validation is bypassed', function (): void {
        $world = brandLevelWorld();
        $barber = BarberModel::factory()->create();

        expect(fn () => app(CreateAffiliationHandler::class)->handle(new CreateAffiliationCommand($barber->id, $world['brand']->id, AffiliableType::Brand, null)))
            ->toThrow(ValidationException::class);

        $this->assertDatabaseCount('barber_affiliations', 0);
    });

    it('keeps a branch request working for the same barber', function (): void {
        $world = brandLevelWorld();
        $barber = BarberModel::factory()->create();

        $this->actingAs($barber, 'barber')
            ->postJson("/api/v1/barbers/{$barber->id}/affiliate", ['affiliable_id' => $world['branch']->id, 'affiliable_type' => AffiliableType::Branch->value])
            ->assertCreated();

        expect(BarberAffiliationModel::query()->where('barber_id', $barber->id)->count())->toBe(1);
    });
});

describe('Existing brand-level rows are handled safely', function (): void {
    it('refuses to accept a legacy pending brand-level invitation, even for an approved brand, and changes nothing', function (): void {
        $world = brandLevelWorld();
        $barber = BarberModel::factory()->create();
        $legacy = brandLevelRow($barber, $world['brand'], $world['branch'], AffiliationStatus::Pending);

        $this->actingAs($barber, 'barber')->postJson("/api/v1/affiliations/{$legacy->id}/accept")->assertStatus(400);

        expect($legacy->fresh())->status->toBe(AffiliationStatus::Pending)->accepted_at->toBeNull()
            ->and(StatusChangeLogModel::query()->count())->toBe(0);
    });

    it('still lets the barber reject a legacy pending brand-level invitation, with an audit row', function (): void {
        $world = brandLevelWorld();
        $barber = BarberModel::factory()->create();
        $legacy = brandLevelRow($barber, $world['brand'], $world['branch'], AffiliationStatus::Pending);

        $this->actingAs($barber, 'barber')->postJson("/api/v1/affiliations/{$legacy->id}/reject")->assertOk();

        expect($legacy->fresh()->status)->toBe(AffiliationStatus::Rejected)
            ->and(StatusChangeLogModel::query()->where('subject_id', $legacy->id)->where('to_status', 'rejected')->count())->toBe(1);
    });

    it('keeps a legacy Active brand-level row listed and lets the barber end it', function (): void {
        $world = brandLevelWorld();
        $barber = BarberModel::factory()->create();
        $legacy = brandLevelRow($barber, $world['brand'], $world['branch'], AffiliationStatus::Active);
        $this->actingAs($barber, 'barber');

        $this->getJson("/api/v1/barbers/{$barber->id}/affiliations")->assertOk()->assertJsonFragment(['id' => $legacy->id]);
        $this->postJson("/api/v1/affiliations/{$legacy->id}/terminate")->assertOk();

        expect($legacy->fresh())->status->toBe(AffiliationStatus::Terminated)->terminated_at->not->toBeNull();
    });
});
