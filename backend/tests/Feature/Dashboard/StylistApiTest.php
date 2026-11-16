<?php

declare(strict_types=1);

use Modules\Activation\Models\ActivationLogModel;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;

describe('Dashboard Stylist API', function (): void {
    beforeEach(function (): void {
        $this->admin = AdminModel::factory()->create();
        $this->branch = BranchModel::factory()->create();
        $this->otherBranch = BranchModel::factory()->create();
    });

    it('lets an admin provision a barber account with a chair assignment', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->branch->id]);
        $this->authenticateDashboardActor($this->admin);

        $this->postJson('/api/v1/dashboard/stylists', stylistPayload($chair))
            ->assertCreated()
            ->assertJsonPath('data.email', 'new-stylist@example.test');

        expect($chair->refresh()->barber_id)->not->toBeNull();
    });

    it('lets an admin update and delete a stylist account', function (): void {
        $stylist = BarberModel::factory()->create();
        $this->authenticateDashboardActor($this->admin);

        $this->putJson("/api/v1/dashboard/stylists/{$stylist->id}", [
            'name' => ['en' => 'Updated Stylist', 'ar' => 'حلاق محدث'],
            'email' => $stylist->email,
            'phone' => '00963000000001',
        ])->assertOk()->assertJsonPath('data.phone', '00963000000001');
        $this->deleteJson("/api/v1/dashboard/stylists/{$stylist->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/stylists/{$stylist->id}")->assertNotFound();
    });

    it('only exposes stylists assigned to the manager branch', function (): void {
        $ownStylist = BarberModel::factory()->create();
        $otherStylist = BarberModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $ownStylist->id]);
        ChairModel::factory()->create(['branch_id' => $this->otherBranch->id, 'barber_id' => $otherStylist->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->getJson("/api/v1/dashboard/stylists/{$ownStylist->id}")->assertOk();
        $this->getJson("/api/v1/dashboard/stylists/{$otherStylist->id}")->assertNotFound();
        $this->getJson('/api/v1/dashboard/stylists')->assertOk()->assertJsonCount(1, 'data');
    });

    it('does not let a branch manager assign a barber to another branch chair', function (): void {
        $chair = ChairModel::factory()->create(['branch_id' => $this->otherBranch->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->postJson('/api/v1/dashboard/stylists', stylistPayload($chair))
            ->assertNotFound();
    });

    it('lets a branch manager activate and deactivate their own stylist', function (): void {
        $stylist = BarberModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $stylist->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->patchJson("/api/v1/dashboard/stylists/{$stylist->id}/deactivate")
            ->assertOk()
            ->assertJsonPath('data.status', BarberStatusEnum::Disabled->value);
        $this->patchJson("/api/v1/dashboard/stylists/{$stylist->id}/activate")
            ->assertOk()
            ->assertJsonPath('data.status', BarberStatusEnum::Enabled->value);
    });

    it('records the reason a branch manager gives when deactivating a stylist', function (): void {
        $stylist = BarberModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $stylist->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->patchJson("/api/v1/dashboard/stylists/{$stylist->id}/deactivate", ['reason' => 'Left the shop.'])->assertOk();

        expect(ActivationLogModel::query()->where('activable_id', $stylist->id)->value('reason'))->toBe('Left the shop.');
    });

    it('filters stylists by chair and status and returns the assigned chair', function (): void {
        $first = BarberModel::factory()->create(['status' => BarberStatusEnum::Enabled]);
        $second = BarberModel::factory()->create(['status' => BarberStatusEnum::Disabled]);
        $firstChair = ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $first->id]);
        ChairModel::factory()->create(['branch_id' => $this->branch->id, 'barber_id' => $second->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->getJson('/api/v1/dashboard/stylists?chair_id='.$firstChair->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.chair.id', $firstChair->id)
            ->assertJsonStructure(['data' => [['name_translations' => ['en', 'ar']]]])
            ->assertJsonPath('data.0.chair.branch_id', $this->branch->id);
        $this->getJson('/api/v1/dashboard/stylists?status='.BarberStatusEnum::Disabled->value)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $second->id);
        $this->getJson('/api/v1/dashboard/stylists?status=nope')->assertUnprocessable();
    });

    it('does not let a branch manager activate a stylist outside their branch', function (): void {
        $otherStylist = BarberModel::factory()->create();
        ChairModel::factory()->create(['branch_id' => $this->otherBranch->id, 'barber_id' => $otherStylist->id]);
        $this->authenticateDashboardActor($this->branch);

        $this->patchJson("/api/v1/dashboard/stylists/{$otherStylist->id}/deactivate")
            ->assertNotFound();
    });
});

function stylistPayload(ChairModel $chair): array
{
    return [
        'name' => ['en' => 'New Stylist', 'ar' => 'حلاق جديد'],
        'email' => 'new-stylist@example.test',
        'phone' => '00963000000000',
        'password' => 'secure-dashboard-password',
        'chair_id' => $chair->id,
    ];
}
