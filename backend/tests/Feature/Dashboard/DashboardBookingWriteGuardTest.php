<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\OfferedService\Models\OfferedServiceModel;

/** S4 (F-01 bookings): cancel stays allowed under suspension; status changes, reschedule, review and walk-in obey the guard. */
function bookingWorld(BrandStatusEnum $brand = BrandStatusEnum::Active, BranchStatusEnum $branch = BranchStatusEnum::Enabled, BookingStatus $status = BookingStatus::Pending): array
{
    $owner = ClientModel::factory()->create();
    $brandModel = BrandModel::factory()->create(['owner_id' => $owner->id, 'status' => $brand]);
    $branchModel = BranchModel::factory()->create(['brand_id' => $brandModel->id, 'status' => $branch]);
    $chair = ChairModel::factory()->create(['branch_id' => $branchModel->id]);

    return [
        'owner' => $owner,
        'brand' => $brandModel,
        'branch' => $branchModel,
        'chair' => $chair,
        'booking' => BookingModel::factory()->create([
            'chair_id' => $chair->id,
            'booking_status' => $status,
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDay()->addMinutes(30),
        ]),
    ];
}

function walkInPayload(array $world): array
{
    return [
        'branch_id' => $world['branch']->id,
        'chair_id' => $world['chair']->id,
        'barber_id' => BarberModel::factory()->create()->id,
        'customer_name' => 'Walk In',
        'customer_email' => 'walk@example.test',
        'service_ids' => [OfferedServiceModel::factory()->create(['serviceable_id' => $world['brand']->id, 'duration_minutes' => 30])->id],
        'starts_at' => now()->addDay()->toIso8601String(),
    ];
}

describe('Booking writes on a Suspended brand or branch (F-01, S4)', function (): void {
    it('refuses status change, reschedule and walk-in, but lets the owner cancel', function (BrandStatusEnum $brand, BranchStatusEnum $branch, string $code): void {
        $world = bookingWorld($brand, $branch);
        $this->authenticateDashboardActor($world['owner']);
        $url = "/api/v1/dashboard/bookings/{$world['booking']->id}";

        $this->patchJson($url, ['booking_status' => BookingStatus::Confirmed->value])->assertForbidden()->assertJsonPath('code', $code);
        $this->patchJson("{$url}/reschedule", ['starts_at' => now()->addDays(3)->toIso8601String(), 'ends_at' => now()->addDays(3)->addMinutes(30)->toIso8601String()])
            ->assertForbidden()->assertJsonPath('code', $code);
        $this->postJson('/api/v1/dashboard/bookings/walk-in', walkInPayload($world))->assertForbidden()->assertJsonPath('code', $code);
        expect($world['booking']->fresh()->booking_status)->toBe(BookingStatus::Pending);

        $this->patchJson("{$url}/cancel")->assertOk()->assertJsonPath('data.booking_status', BookingStatus::Cancelled->value);
    })->with([
        'suspended brand' => [BrandStatusEnum::Suspended, BranchStatusEnum::Enabled, 'brand_suspended'],
        'suspended branch' => [BrandStatusEnum::Active, BranchStatusEnum::Suspended, 'branch_read_only'],
    ]);

    it('lets the owner cancel through the status endpoint while suspended, but nothing else', function (): void {
        $world = bookingWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($world['owner']);

        $this->patchJson("/api/v1/dashboard/bookings/{$world['booking']->id}", ['booking_status' => BookingStatus::Cancelled->value])
            ->assertOk()->assertJsonPath('data.booking_status', BookingStatus::Cancelled->value);
    });

    it('refuses to review a client on a Suspended branch', function (): void {
        $world = bookingWorld(branch: BranchStatusEnum::Suspended, status: BookingStatus::Completed);
        $this->authenticateDashboardActor($world['owner']);

        $this->postJson("/api/v1/dashboard/bookings/{$world['booking']->id}/review", ['rating' => 5, 'comment' => 'Great'])
            ->assertForbidden()->assertJsonPath('code', 'branch_read_only');
    });

    it('refuses a walk-in on a Disabled branch with branch_not_operational but keeps other setup writable', function (): void {
        $world = bookingWorld(branch: BranchStatusEnum::Disabled);
        $this->authenticateDashboardActor($world['owner']);

        $this->postJson('/api/v1/dashboard/bookings/walk-in', walkInPayload($world))->assertForbidden()->assertJsonPath('code', 'branch_not_operational');
        $this->patchJson("/api/v1/dashboard/bookings/{$world['booking']->id}", ['booking_status' => BookingStatus::Confirmed->value])->assertOk();
    });

    it('still lets the platform admin act on a Suspended branch', function (): void {
        $world = bookingWorld(BrandStatusEnum::Suspended, BranchStatusEnum::Suspended);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson("/api/v1/dashboard/bookings/{$world['booking']->id}", ['booking_status' => BookingStatus::Confirmed->value])->assertOk();
    });

    it('hides a booking of another tenant instead of revealing its suspended state', function (): void {
        $mine = bookingWorld();
        $theirs = bookingWorld(BrandStatusEnum::Suspended);
        $this->authenticateDashboardActor($mine['owner']);

        $this->patchJson("/api/v1/dashboard/bookings/{$theirs['booking']->id}", ['booking_status' => BookingStatus::Confirmed->value])->assertNotFound();
    });
});
