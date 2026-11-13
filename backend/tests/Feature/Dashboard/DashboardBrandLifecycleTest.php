<?php

declare(strict_types=1);

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;
use Modules\Admin\Models\AdminModel;
use Modules\Audit\Models\StatusChangeLogModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Constants\BrandReviewConstants;
use Modules\Brand\Enums\BrandStatusEnum;
use Modules\Brand\Exceptions\BrandReviewException;
use Modules\Brand\Models\BrandModel;
use Modules\Chair\Models\ChairModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Models\NotificationModel;
use Modules\Dashboard\Mail\OwnerBrandApproved;
use Modules\Dashboard\Mail\OwnerBrandReactivated;
use Modules\Dashboard\Mail\OwnerBrandRejected;
use Modules\Dashboard\Mail\OwnerBrandSuspended;

const BRAND_LIFECYCLE_URL = '/api/v1/dashboard/admin/brands';
const BRAND_LIFECYCLE_MISSING_ID = '00000000-0000-4000-8000-0000000000cc';

function lifecycleBrand(BrandStatusEnum $status, array $overrides = []): BrandModel
{
    return BrandModel::factory()->create([
        'owner_id' => ClientModel::factory()->create()->id,
        'status' => $status,
        ...$overrides,
    ]);
}

function brandLogs(BrandModel $brand): Collection
{
    return StatusChangeLogModel::query()->where('subject_id', $brand->id)->orderBy('created_at')->get();
}

/** NS-06 (D8, D9): admin approve, reject, suspend and reactivate, and the owner's resubmission. */
describe('Approve a brand', function (): void {
    it('activates a pending brand, wakes its pending branch as disabled, logs it and emails the owner', function (): void {
        Mail::fake();
        $admin = AdminModel::factory()->create();
        $brand = lifecycleBrand(BrandStatusEnum::Pending);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id, 'status' => BranchStatusEnum::Pending]);
        $this->authenticateDashboardActor($admin);

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', BrandStatusEnum::Active->value);

        expect($brand->fresh()->status)->toBe(BrandStatusEnum::Active)
            ->and($branch->fresh()->status)->toBe(BranchStatusEnum::Disabled)
            ->and(brandLogs($brand))->toHaveCount(1)
            ->and(brandLogs($brand)->first())
            ->from_status->toBe('pending')->to_status->toBe('active')->actor_id->toBe($admin->id);
        Mail::assertQueued(OwnerBrandApproved::class);
    });

    it('is a no-op for an already active brand and sends nothing', function (): void {
        Mail::fake();
        $brand = lifecycleBrand(BrandStatusEnum::Active);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/approve")->assertOk();

        expect(brandLogs($brand))->toHaveCount(0);
        Mail::assertNothingOutgoing();
    });

    it('answers 409 for a rejected brand and 404 for an unknown one', function (): void {
        $brand = lifecycleBrand(BrandStatusEnum::Rejected);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/approve")
            ->assertStatus(409)
            ->assertJsonPath('code', BrandReviewException::CODE_NOT_PENDING);
        $this->patchJson(BRAND_LIFECYCLE_URL.'/'.BRAND_LIFECYCLE_MISSING_ID.'/approve')->assertNotFound();
    });

    it('answers 422 and keeps the brand pending while the owner email is unverified', function (): void {
        $owner = ClientModel::factory()->create(['email_verified_at' => null]);
        $brand = lifecycleBrand(BrandStatusEnum::Pending, ['owner_id' => $owner->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/approve")->assertUnprocessable();

        expect($brand->fresh()->status)->toBe(BrandStatusEnum::Pending);
    });
});

describe('Reject a brand', function (): void {
    it('rejects a pending brand with a trimmed reason, logs it, notifies and emails the owner', function (): void {
        Mail::fake();
        $admin = AdminModel::factory()->create();
        $brand = lifecycleBrand(BrandStatusEnum::Pending);
        $this->authenticateDashboardActor($admin);

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/reject", ['reason' => '  Logo is missing.  '])
            ->assertOk()
            ->assertJsonPath('data.status', BrandStatusEnum::Rejected->value);

        expect($brand->fresh())->status->toBe(BrandStatusEnum::Rejected)->status_reason->toBe('Logo is missing.')
            ->and(brandLogs($brand)->first())->reason->toBe('Logo is missing.')->to_status->toBe('rejected')
            ->and(NotificationModel::query()->where('notifiable_id', $brand->owner_id)->count())->toBe(1);
        Mail::assertQueued(OwnerBrandRejected::class);
    });

    it('validates the reason', function (array $payload): void {
        $brand = lifecycleBrand(BrandStatusEnum::Pending);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/reject", $payload)->assertUnprocessable()->assertJsonValidationErrors('reason');

        expect($brand->fresh()->status)->toBe(BrandStatusEnum::Pending);
    })->with([
        'missing' => [[]],
        'too short' => [['reason' => 'ab']],
        'too long' => [['reason' => str_repeat('a', BrandReviewConstants::BRAND_REASON_MAX_LENGTH + 1)]],
    ]);

    it('answers 409 unless the brand is pending', function (BrandStatusEnum $status): void {
        $brand = lifecycleBrand($status);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/reject", ['reason' => 'Not good enough.'])->assertStatus(409);

        expect($brand->fresh()->status)->toBe($status);
    })->with([BrandStatusEnum::Active, BrandStatusEnum::Rejected, BrandStatusEnum::Suspended]);
});

describe('Resubmit a rejected brand', function (): void {
    it('lets the owner resubmit, returning the brand to pending and counting the submission', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = lifecycleBrand(BrandStatusEnum::Rejected, ['owner_id' => $owner->id, 'submission_count' => 1]);
        $this->authenticateDashboardActor($owner);

        $this->postJson("/api/v1/dashboard/brands/{$brand->id}/resubmit")
            ->assertOk()
            ->assertJsonPath('data.status', BrandStatusEnum::Pending->value);

        expect($brand->fresh())->status->toBe(BrandStatusEnum::Pending)->submission_count->toBe(2)
            ->and(brandLogs($brand)->first())->from_status->toBe('rejected')->to_status->toBe('pending')->actor_id->toBe($owner->id);
    });

    it('refuses the fourth submission with the stable limit code', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = lifecycleBrand(BrandStatusEnum::Rejected, ['owner_id' => $owner->id, 'submission_count' => BrandReviewConstants::BRAND_MAX_SUBMISSIONS]);
        $this->authenticateDashboardActor($owner);

        $this->postJson("/api/v1/dashboard/brands/{$brand->id}/resubmit")
            ->assertStatus(409)
            ->assertJsonPath('code', BrandReviewException::CODE_RESUBMISSION_LIMIT);

        expect($brand->fresh())->status->toBe(BrandStatusEnum::Rejected)->submission_count->toBe(BrandReviewConstants::BRAND_MAX_SUBMISSIONS);
    });

    it('answers 409 when the brand is not rejected', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = lifecycleBrand(BrandStatusEnum::Pending, ['owner_id' => $owner->id]);
        $this->authenticateDashboardActor($owner);

        $this->postJson("/api/v1/dashboard/brands/{$brand->id}/resubmit")
            ->assertStatus(409)
            ->assertJsonPath('code', BrandReviewException::CODE_NOT_REJECTED);
    });

    it('answers 404 for another owner and the admin, and 403 for a manager', function (): void {
        $brand = lifecycleBrand(BrandStatusEnum::Rejected);
        $stranger = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $stranger->id]);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);

        $expected = [[$stranger, 404], [$branch, 403], [AdminModel::factory()->create(), 404]];
        $seen = [];
        foreach ($expected as [$actor]) {
            app('auth')->forgetGuards();
            $this->flushHeaders();
            $this->authenticateDashboardActor($actor);
            $seen[] = $this->postJson("/api/v1/dashboard/brands/{$brand->id}/resubmit")->status();
        }

        expect($seen)->toBe(array_column($expected, 1))
            ->and($brand->fresh()->status)->toBe(BrandStatusEnum::Rejected);
    });
});

describe('Suspend and reactivate a brand', function (): void {
    it('suspends an active brand, keeps future bookings by default and emails the owner', function (): void {
        Mail::fake();
        $brand = lifecycleBrand(BrandStatusEnum::Active);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $booking = BookingModel::factory()->create(['chair_id' => ChairModel::factory()->create(['branch_id' => $branch->id])->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/suspend", ['reason' => 'Chargebacks.'])
            ->assertOk()
            ->assertJsonPath('data.status', BrandStatusEnum::Suspended->value);

        expect($brand->fresh())->status->toBe(BrandStatusEnum::Suspended)->status_reason->toBe('Chargebacks.')
            ->and($booking->fresh()->booking_status)->toBe(BookingStatus::Confirmed);
        Mail::assertQueued(OwnerBrandSuspended::class);
    });

    it('cancels only future bookings of its own branches when asked', function (): void {
        $brand = lifecycleBrand(BrandStatusEnum::Active);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $chair = ChairModel::factory()->create(['branch_id' => $branch->id]);
        $future = BookingModel::factory()->create(['chair_id' => $chair->id]);
        $past = BookingModel::factory()->create(['chair_id' => $chair->id, 'starts_at' => now()->subDay(), 'ends_at' => now()->subDay()->addMinutes(30)]);
        $foreign = BookingModel::factory()->create();
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/suspend", ['reason' => 'Fraud.', 'cancel_future_bookings' => true])->assertOk();

        expect($future->fresh()->booking_status)->toBe(BookingStatus::Cancelled)
            ->and($past->fresh()->booking_status)->toBe(BookingStatus::Confirmed)
            ->and($foreign->fresh()->booking_status)->toBe(BookingStatus::Confirmed);
    });

    it('validates the reason and the cancel flag', function (array $payload, string $field): void {
        $brand = lifecycleBrand(BrandStatusEnum::Active);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/suspend", $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect($brand->fresh()->status)->toBe(BrandStatusEnum::Active);
    })->with([
        'missing reason' => [[], 'reason'],
        'short reason' => [['reason' => 'x'], 'reason'],
        'bad flag' => [['reason' => 'Valid reason.', 'cancel_future_bookings' => 'maybe'], 'cancel_future_bookings'],
    ]);

    it('answers 409 unless the brand is active', function (BrandStatusEnum $status): void {
        $brand = lifecycleBrand($status);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/suspend", ['reason' => 'Valid reason.'])
            ->assertStatus(409)
            ->assertJsonPath('code', BrandReviewException::CODE_NOT_ACTIVE);
    })->with([BrandStatusEnum::Pending, BrandStatusEnum::Rejected, BrandStatusEnum::Suspended]);

    it('reactivates a suspended brand, logs it and emails the owner', function (): void {
        Mail::fake();
        $brand = lifecycleBrand(BrandStatusEnum::Suspended, ['status_reason' => 'Chargebacks.']);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/reactivate")
            ->assertOk()
            ->assertJsonPath('data.status', BrandStatusEnum::Active->value);

        expect($brand->fresh())->status->toBe(BrandStatusEnum::Active)->status_reason->toBeNull()
            ->and(brandLogs($brand)->first())->from_status->toBe('suspended')->to_status->toBe('active');
        Mail::assertQueued(OwnerBrandReactivated::class);
    });

    it('answers 409 when reactivating a brand that is not suspended', function (): void {
        $brand = lifecycleBrand(BrandStatusEnum::Active);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/reactivate")
            ->assertStatus(409)
            ->assertJsonPath('code', BrandReviewException::CODE_NOT_SUSPENDED);
    });

    it('makes a suspended brand read-only for its owner and manager with brand_suspended', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = lifecycleBrand(BrandStatusEnum::Suspended, ['owner_id' => $owner->id]);
        $this->authenticateDashboardActor($owner);

        $this->putJson("/api/v1/dashboard/brands/{$brand->id}", ['name' => ['en' => 'Renamed', 'ar' => 'جديد']])
            ->assertForbidden()
            ->assertJsonPath('code', 'brand_suspended');

        expect($brand->fresh()->getTranslation('name', 'en'))->not->toBe('Renamed');
    });
});

describe('Lifecycle routes are admin only', function (): void {
    it('rejects anonymous callers, owners and managers on every lifecycle route', function (string $method, string $path): void {
        $owner = ClientModel::factory()->create();
        $brand = lifecycleBrand(BrandStatusEnum::Pending, ['owner_id' => $owner->id]);
        $url = BRAND_LIFECYCLE_URL."/{$brand->id}/{$path}";

        $this->json($method, $url, ['reason' => 'Valid reason.'])->assertUnauthorized();

        foreach ([$owner, BranchModel::factory()->create(['brand_id' => $brand->id])] as $actor) {
            app('auth')->forgetGuards();
            $this->flushHeaders();
            $this->authenticateDashboardActor($actor);
            $this->json($method, $url, ['reason' => 'Valid reason.'])->assertForbidden();
        }

        expect($brand->fresh()->status)->toBe(BrandStatusEnum::Pending);
    })->with([
        ['PATCH', 'approve'], ['PATCH', 'reject'], ['PATCH', 'suspend'], ['PATCH', 'reactivate'],
        ['GET', 'features'], ['PATCH', 'features'],
    ]);
});

describe('Brand feature overrides', function (): void {
    it('reads and switches the two flags independently', function (): void {
        $brand = lifecycleBrand(BrandStatusEnum::Active);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson(BRAND_LIFECYCLE_URL."/{$brand->id}/features")
            ->assertOk()->assertJsonPath('data.multi_branch', false)->assertJsonPath('data.job_board', false);

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/features", ['multi_branch' => true])
            ->assertOk()->assertJsonPath('data.multi_branch', true)->assertJsonPath('data.job_board', false);

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/features", ['multi_branch' => false, 'job_board' => true])
            ->assertOk()->assertJsonPath('data.multi_branch', false)->assertJsonPath('data.job_board', true);
    });

    it('does not leak a flag from one brand to another', function (): void {
        $first = lifecycleBrand(BrandStatusEnum::Active);
        $second = lifecycleBrand(BrandStatusEnum::Active);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$first->id}/features", ['job_board' => true])->assertOk();

        $this->getJson(BRAND_LIFECYCLE_URL."/{$second->id}/features")->assertOk()->assertJsonPath('data.job_board', false);
    });

    it('rejects non-boolean flags with 422 and answers 404 for an unknown brand', function (): void {
        $brand = lifecycleBrand(BrandStatusEnum::Active);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/features", ['job_board' => 'sometimes'])
            ->assertUnprocessable()->assertJsonValidationErrors('job_board');
        $this->getJson(BRAND_LIFECYCLE_URL.'/'.BRAND_LIFECYCLE_MISSING_ID.'/features')->assertNotFound();
        $this->patchJson(BRAND_LIFECYCLE_URL.'/'.BRAND_LIFECYCLE_MISSING_ID.'/features', ['job_board' => true])->assertNotFound();
    });
});

describe('Brand status history', function (): void {
    it('lists the moves of one brand in order and nothing from another', function (): void {
        $admin = AdminModel::factory()->create();
        $brand = lifecycleBrand(BrandStatusEnum::Pending);
        $other = lifecycleBrand(BrandStatusEnum::Pending);
        $this->authenticateDashboardActor($admin);
        $this->patchJson(BRAND_LIFECYCLE_URL."/{$brand->id}/reject", ['reason' => 'Fix the logo.'])->assertOk();
        $this->patchJson(BRAND_LIFECYCLE_URL."/{$other->id}/approve")->assertOk();

        $history = $this->getJson("/api/v1/dashboard/admin/audit/brand/{$brand->id}")->assertOk();

        $history->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.to_status', 'rejected')
            ->assertJsonPath('data.0.reason', 'Fix the logo.')
            ->assertJsonPath('data.0.actor_id', $admin->id);
    });

    it('rejects an unknown subject type and a bad page size, and keeps owners out', function (): void {
        $brand = lifecycleBrand(BrandStatusEnum::Pending, ['owner_id' => ($owner = ClientModel::factory()->create())->id]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson("/api/v1/dashboard/admin/audit/spaceship/{$brand->id}")->assertUnprocessable();
        $this->getJson("/api/v1/dashboard/admin/audit/brand/{$brand->id}?per_page=0")->assertUnprocessable();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor($owner);
        $this->getJson("/api/v1/dashboard/admin/audit/brand/{$brand->id}")->assertForbidden();
    });
});
