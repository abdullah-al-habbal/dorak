<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Queue;
use Modules\Admin\Models\AdminModel;
use Modules\Audit\Enums\StatusChangeActorTypeEnum;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Enums\AffiliableType;
use Modules\BarberAffiliation\Enums\AffiliationInitiatorTypeEnum;
use Modules\BarberAffiliation\Enums\AffiliationStatus;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Jobs\SendBookingStatusNotificationJob;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Enums\ChairStatus;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

function latestStatusLog(string $subjectType, string $subjectId): ?StatusChangeLogModel
{
    return StatusChangeLogModel::query()
        ->where('subject_type', $subjectType)
        ->where('subject_id', $subjectId)
        ->latest('created_at')
        ->first();
}

describe('booking transitions', function (): void {
    beforeEach(function (): void {
        Queue::fake();
    });

    it('logs a dashboard admin transition', function (): void {
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);
        $chair = ChairModel::factory()->create();
        $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Pending]);

        $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}", ['status' => BookingStatus::Confirmed])->assertOk();

        $log = latestStatusLog('booking', (string) $booking->id);
        expect($log)->not->toBeNull();
        expect($log->from_status)->toBe(BookingStatus::Pending->value);
        expect($log->to_status)->toBe(BookingStatus::Confirmed->value);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Admin->value);
        expect($log->actor_id)->toBe((string) $admin->id);
    });

    it('logs a branch transition', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Pending]);

        $this->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['status' => BookingStatus::Confirmed])->assertOk();

        $log = latestStatusLog('booking', (string) $booking->id);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Branch->value);
        expect($log->actor_id)->toBe((string) $branch->id);
        expect($log->to_status)->toBe(BookingStatus::Confirmed->value);
    });

    it('logs a client cancellation', function (): void {
        $client = ClientModel::factory()->create();
        $this->actingAs($client, 'client');
        $booking = BookingModel::factory()->create(['client_id' => $client->id, 'status' => BookingStatus::Confirmed, 'time_slot' => now()->addHours(5)]);

        $this->postJson("/api/v1/client/bookings/{$booking->id}/cancel")->assertOk();

        $log = latestStatusLog('booking', (string) $booking->id);
        expect($log->actor_type->value)->toBe(StatusChangeActorTypeEnum::Client->value);
        expect($log->actor_id)->toBe((string) $client->id);
        expect($log->to_status)->toBe(BookingStatus::Canceled->value);
    });

    it('logs a barber cancellation with the reason', function (): void {
        $barber = BarberModel::factory()->create();
        $this->actingAs($barber, 'barber');
        $booking = BookingModel::factory()->create(['barber_id' => $barber->id, 'status' => BookingStatus::Confirmed, 'time_slot' => now()->addHours(5)]);

        $this->postJson("/api/v1/barber/bookings/{$booking->id}/cancel", ['cancellation_reason' => 'sick'])->assertOk();

        $log = latestStatusLog('booking', (string) $booking->id);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Barber->value);
        expect($log->actor_id)->toBe((string) $barber->id);
        expect($log->reason)->toBe('sick');
    });

    it('logs a barber lifecycle transition', function (): void {
        $barber = BarberModel::factory()->create();
        $this->actingAs($barber, 'barber');
        $booking = BookingModel::factory()->create(['barber_id' => $barber->id, 'status' => BookingStatus::Pending]);

        $this->patchJson("/api/v1/barber/bookings/{$booking->id}/accept")->assertOk();

        $log = latestStatusLog('booking', (string) $booking->id);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Barber->value);
        expect($log->to_status)->toBe(BookingStatus::Confirmed->value);
    });

    it('logs a system cancellation from forced chair maintenance', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id, 'status' => ChairStatus::Available]);
        $booking = BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'status' => BookingStatus::Confirmed,
            'time_slot' => now()->addDay(),
            'ends_at' => now()->addDay()->addMinutes(30),
        ]);

        $this->patchJson("/api/v1/branch/chairs/{$chair->id}/status", ['status' => ChairStatus::Maintenance, 'force' => true])->assertOk();

        $log = latestStatusLog('booking', (string) $booking->id);
        expect($log->actor_type->value)->toBe(StatusChangeActorTypeEnum::System->value);
        expect($log->actor_id)->toBeNull();
        expect($log->reason)->toBe('chair_maintenance');
    });

    it('creates no log row when a transition is rejected', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Completed]);

        $this->patchJson("/api/v1/branch/bookings/{$booking->id}/status", ['status' => BookingStatus::InProgress])->assertUnprocessable();

        expect(latestStatusLog('booking', (string) $booking->id))->toBeNull();
        Queue::assertNotPushed(SendBookingStatusNotificationJob::class);
    });
});

describe('affiliation lifecycle', function (): void {
    it('logs a barber-created affiliation', function (): void {
        $barber = BarberModel::factory()->create();
        $this->actingAs($barber, 'barber');
        $branch = BranchModel::factory()->create();

        $this->postJson("/api/v1/barbers/{$barber->id}/affiliate", ['affiliable_id' => $branch->id, 'affiliable_type' => AffiliableType::Branch])->assertCreated();

        $affiliation = BarberAffiliationModel::where('barber_id', $barber->id)->first();
        $log = latestStatusLog('affiliation', (string) $affiliation->id);
        expect($log->from_status)->toBeNull();
        expect($log->to_status)->toBe(AffiliationStatus::Pending->value);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Barber->value);
        expect($log->actor_id)->toBe((string) $barber->id);
    });

    it('logs a branch invite', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');
        $barber = BarberModel::factory()->create();

        $this->postJson('/api/v1/branch/affiliations', ['barber_id' => $barber->id])->assertCreated();

        $affiliation = BarberAffiliationModel::where('barber_id', $barber->id)->first();
        $log = latestStatusLog('affiliation', (string) $affiliation->id);
        expect($log->from_status)->toBeNull();
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Branch->value);
        expect($log->actor_id)->toBe((string) $branch->id);
    });

    it('logs a barber accepting a branch invite', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'affiliable_type' => AffiliableType::Branch,
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
            'initiated_by_id' => $branch->id,
            'status' => AffiliationStatus::Pending,
        ]);
        $this->actingAs($barber, 'barber');

        $this->postJson("/api/v1/affiliations/{$affiliation->id}/accept")->assertOk();

        $log = latestStatusLog('affiliation', (string) $affiliation->id);
        expect($log->from_status)->toBe(AffiliationStatus::Pending->value);
        expect($log->to_status)->toBe(AffiliationStatus::Active->value);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Barber->value);
        expect($log->actor_id)->toBe((string) $barber->id);
    });

    it('logs a branch accepting a barber request', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'affiliable_type' => AffiliableType::Branch,
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Barber,
            'initiated_by_id' => $barber->id,
            'status' => AffiliationStatus::Pending,
        ]);
        $this->actingAs($branch, 'branch_api');

        $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/accept")->assertOk();

        $log = latestStatusLog('affiliation', (string) $affiliation->id);
        expect($log->to_status)->toBe(AffiliationStatus::Active->value);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Branch->value);
        expect($log->actor_id)->toBe((string) $branch->id);
    });

    it('logs a barber rejecting a branch invite', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'affiliable_type' => AffiliableType::Branch,
            'initiated_by_type' => AffiliationInitiatorTypeEnum::Branch,
            'initiated_by_id' => $branch->id,
            'status' => AffiliationStatus::Pending,
        ]);
        $this->actingAs($barber, 'barber');

        $this->postJson("/api/v1/affiliations/{$affiliation->id}/reject")->assertOk();

        $log = latestStatusLog('affiliation', (string) $affiliation->id);
        expect($log->to_status)->toBe(AffiliationStatus::Rejected->value);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Barber->value);
    });

    it('logs a barber terminating their own affiliation', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'affiliable_type' => AffiliableType::Branch,
            'status' => AffiliationStatus::Active,
        ]);
        $this->actingAs($barber, 'barber');

        $this->postJson("/api/v1/affiliations/{$affiliation->id}/terminate")->assertOk();

        $log = latestStatusLog('affiliation', (string) $affiliation->id);
        expect($log->to_status)->toBe(AffiliationStatus::Terminated->value);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Barber->value);
        expect($log->actor_id)->toBe((string) $barber->id);
    });

    it('logs a branch terminating an affiliation', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'affiliable_type' => AffiliableType::Branch,
            'status' => AffiliationStatus::Active,
        ]);
        $this->actingAs($branch, 'branch_api');

        $this->postJson("/api/v1/branch/affiliations/{$affiliation->id}/terminate")->assertOk();

        $log = latestStatusLog('affiliation', (string) $affiliation->id);
        expect($log->to_status)->toBe(AffiliationStatus::Terminated->value);
        expect($log->actor_type->value)->toBe(DashboardActorTypeEnum::Branch->value);
        expect($log->actor_id)->toBe((string) $branch->id);
    });

    it('creates no log row for an invalid-status affiliation action', function (): void {
        $branch = BranchModel::factory()->create();
        $barber = BarberModel::factory()->create();
        $affiliation = BarberAffiliationModel::factory()->create([
            'barber_id' => $barber->id,
            'affiliable_id' => $branch->id,
            'affiliable_type' => AffiliableType::Branch,
            'status' => AffiliationStatus::Rejected,
        ]);
        $this->actingAs($barber, 'barber');

        $this->postJson("/api/v1/affiliations/{$affiliation->id}/terminate")->assertStatus(400);

        expect(latestStatusLog('affiliation', (string) $affiliation->id))->toBeNull();
    });
});

describe('GET /api/v1/dashboard/bookings/{booking}/history', function (): void {
    it('lets an admin see any booking history', function (): void {
        $admin = AdminModel::factory()->create();
        $this->authenticateDashboardActor($admin);
        $branch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $booking = BookingModel::factory()->create(['chair_id' => $chair->id, 'status' => BookingStatus::Pending]);

        $this->patchJson("/api/v1/dashboard/bookings/{$booking->id}", ['status' => BookingStatus::Confirmed])->assertOk();

        $this->getJson("/api/v1/dashboard/bookings/{$booking->id}/history")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('rejects a manager viewing a booking from another branch', function (): void {
        $otherBranch = BranchModel::factory()->create();
        $chair = ChairModel::factory()->create(['branch_id' => $otherBranch->id]);
        $booking = BookingModel::factory()->create(['chair_id' => $chair->id]);
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->getJson("/api/v1/dashboard/bookings/{$booking->id}/history")->assertNotFound();
    });
});

describe('GET /api/v1/admin/audit/{subjectType}/{subjectId}', function (): void {
    it('returns the history for an admin', function (): void {
        $admin = AdminModel::factory()->create();
        $booking = BookingModel::factory()->create();
        StatusChangeLogModel::create([
            'subject_type' => 'booking',
            'subject_id' => $booking->id,
            'from_status' => 'pending',
            'to_status' => 'confirmed',
            'actor_type' => 'admin',
            'actor_id' => $admin->id,
            'created_at' => now(),
        ]);
        $this->actingAs($admin, 'admin_api');

        $this->getJson("/api/v1/admin/audit/booking/{$booking->id}")
            ->assertOk()
            ->assertJsonCount(1, 'data');
    });

    it('rejects an unauthenticated request', function (): void {
        $booking = BookingModel::factory()->create();

        $this->getJson("/api/v1/admin/audit/booking/{$booking->id}")->assertUnauthorized();
    });

    it('rejects a client token', function (): void {
        $client = ClientModel::factory()->create();
        $this->actingAs($client, 'client');
        $booking = BookingModel::factory()->create();

        $this->getJson("/api/v1/admin/audit/booking/{$booking->id}")->assertUnauthorized();
    });

    it('rejects a barber token', function (): void {
        $barber = BarberModel::factory()->create();
        $this->actingAs($barber, 'barber');
        $booking = BookingModel::factory()->create();

        $this->getJson("/api/v1/admin/audit/booking/{$booking->id}")->assertUnauthorized();
    });

    it('rejects a branch token', function (): void {
        $branch = BranchModel::factory()->create();
        $this->actingAs($branch, 'branch_api');
        $booking = BookingModel::factory()->create();

        $this->getJson("/api/v1/admin/audit/booking/{$booking->id}")->assertUnauthorized();
    });
});
