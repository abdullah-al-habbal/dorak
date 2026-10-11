<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Branch\Models\BranchModel;

it('forbids creating an affiliation for another barber', function (): void {
    $actor = BarberModel::factory()->create();
    $otherBarber = BarberModel::factory()->create();
    $branch = BranchModel::factory()->create();

    $this->actingAs($actor, 'barber')
        ->postJson("/api/v1/barbers/{$otherBarber->id}/affiliate", [
            'affiliable_id' => $branch->id,
            'affiliable_type' => 'branch',
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('barber_affiliations', 0);
});

it('forbids listing another barber affiliations', function (): void {
    $actor = BarberModel::factory()->create();
    $otherBarber = BarberModel::factory()->create();

    $this->actingAs($actor, 'barber')
        ->getJson("/api/v1/barbers/{$otherBarber->id}/affiliations")
        ->assertForbidden();
});

it('forbids an unrelated barber from accepting an affiliation', function (): void {
    $receivingBarber = BarberModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => $receivingBarber->id,
        'initiated_by_type' => BranchModel::class,
        'initiated_by_id' => BranchModel::factory()->create()->id,
    ]);
    $unrelatedBarber = BarberModel::factory()->create();

    $this->actingAs($unrelatedBarber, 'barber')
        ->postJson("/api/v1/affiliations/{$affiliation->id}/accept")
        ->assertForbidden();

    expect($affiliation->refresh()->status)->toBe(AffiliationStatus::Pending);
});

it('forbids an initiating barber from accepting their own affiliation request', function (): void {
    $barber = BarberModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => $barber->id,
        'initiated_by_type' => BarberModel::class,
        'initiated_by_id' => $barber->id,
    ]);

    $this->actingAs($barber, 'barber')
        ->postJson("/api/v1/affiliations/{$affiliation->id}/accept")
        ->assertForbidden();

    expect($affiliation->refresh()->status)->toBe(AffiliationStatus::Pending);
});

it('allows the receiving barber to accept an affiliation initiated by a branch', function (): void {
    $barber = BarberModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => $barber->id,
        'initiated_by_type' => BranchModel::class,
        'initiated_by_id' => BranchModel::factory()->create()->id,
    ]);

    $this->actingAs($barber, 'barber')
        ->postJson("/api/v1/affiliations/{$affiliation->id}/accept")
        ->assertOk();

    expect($affiliation->refresh()->status)->toBe(AffiliationStatus::Accepted);
});

it('allows the receiving barber to reject an affiliation initiated by a branch', function (): void {
    $barber = BarberModel::factory()->create();
    $affiliation = BarberAffiliationModel::factory()->pending()->create([
        'barber_id' => $barber->id,
        'initiated_by_type' => BranchModel::class,
        'initiated_by_id' => BranchModel::factory()->create()->id,
    ]);

    $this->actingAs($barber, 'barber')
        ->postJson("/api/v1/affiliations/{$affiliation->id}/reject")
        ->assertOk();

    expect($affiliation->refresh()->status)->toBe(AffiliationStatus::Rejected);
});
