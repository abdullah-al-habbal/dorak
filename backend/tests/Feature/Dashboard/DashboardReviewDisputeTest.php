<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\PlatformEventEnum;
use Modules\Core\Models\NotificationModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;
use Tests\Support\Constants\ReviewDisputeTestConstants;

const REVIEW_DISPUTE_MISSING_ID = '00000000-0000-4000-8000-0000000000bb';

function branchReview(BranchModel $branch, array $overrides = []): ReviewModel
{
    return ReviewModel::factory()->create([
        'subject_type' => ReviewSubjectTypeEnum::Branch,
        'subject_id' => $branch->id,
        'status' => ReviewStatus::Published,
        ...$overrides,
    ]);
}

function disputeUrl(BranchModel|string $branch, ReviewModel|string $review): string
{
    $branchId = $branch instanceof BranchModel ? $branch->id : $branch;
    $reviewId = $review instanceof ReviewModel ? $review->id : $review;

    return "/api/v1/dashboard/branches/{$branchId}/reviews/{$reviewId}/dispute";
}

/** @return array{reason: string} */
function disputePayload(): array
{
    return ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON];
}

/** NS-14: a manager or owner flags a published review of their branch. */
describe('Dispute a review from the dashboard (NS-14)', function (): void {
    it('lets a manager flag a published review, holds it and notifies every active admin once', function (): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch);
        $active = AdminModel::factory()->create();
        $deactivated = AdminModel::factory()->create(['deactivated_at' => now()]);
        $this->authenticateDashboardActor($branch);

        $this->postJson(disputeUrl($branch, $review), disputePayload())
            ->assertOk()
            ->assertJsonPath('data.status', ReviewStatus::Disputed->value)
            ->assertJsonMissingPath('data.dispute_reason');

        expect($review->fresh())
            ->status->toBe(ReviewStatus::Disputed)
            ->dispute_reason->toBe(ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON)
            ->disputed_at->not->toBeNull();
        $inbox = fn (AdminModel $admin) => NotificationModel::query()->where('notifiable_id', $admin->id)->get();
        expect($inbox($active))->toHaveCount(1)
            ->and($inbox($active)->first()->data['event'])->toBe(PlatformEventEnum::ReviewDisputed->value)
            ->and($inbox($active)->first()->data['subject_id'])->toBe($review->id)
            ->and($inbox($deactivated))->toHaveCount(0);
    });

    it('lets a brand owner flag a review of one of their branches', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $review = branchReview($branch);
        $this->authenticateDashboardActor($owner);

        $this->postJson(disputeUrl($branch, $review), disputePayload())->assertOk();

        expect($review->fresh()->status)->toBe(ReviewStatus::Disputed);
    });

    it('clears a previous resolution when a republished review is disputed again', function (): void {
        $branch = BranchModel::factory()->create();
        $admin = AdminModel::factory()->create();
        $review = branchReview($branch, ['resolved_at' => now()->subDay(), 'resolved_by_id' => $admin->id, 'resolution_note' => 'Kept.']);
        $this->authenticateDashboardActor($branch);

        $this->postJson(disputeUrl($branch, $review), disputePayload())->assertOk();

        expect($review->fresh())->resolved_at->toBeNull()->resolved_by_id->toBeNull();
    });

    it('refuses the platform admin, who judges disputes, with 403', function (): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->postJson(disputeUrl($branch, $review), disputePayload())->assertForbidden();

        expect($review->fresh()->status)->toBe(ReviewStatus::Published);
    });

    it('rejects anonymous callers and barber sessions', function (): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch);

        $this->postJson(disputeUrl($branch, $review), disputePayload())->assertUnauthorized();

        $this->authenticateDashboardActor(BarberModel::factory()->create());
        $this->postJson(disputeUrl($branch, $review), disputePayload())->assertForbidden();
        expect($review->fresh()->status)->toBe(ReviewStatus::Published);
    });

    it('answers 404 for a manager of another branch and leaves the review alone', function (): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch);
        $this->authenticateDashboardActor(BranchModel::factory()->create());

        $this->postJson(disputeUrl($branch, $review), disputePayload())->assertNotFound();

        expect($review->fresh()->status)->toBe(ReviewStatus::Published);
    });

    it('answers 404 for an owner of another brand', function (): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch);
        $stranger = ClientModel::factory()->create();
        BrandModel::factory()->create(['owner_id' => $stranger->id]);
        $this->authenticateDashboardActor($stranger);

        $this->postJson(disputeUrl($branch, $review), disputePayload())->assertNotFound();

        expect($review->fresh()->status)->toBe(ReviewStatus::Published);
    });

    it('answers 404 when the review belongs to another branch, a barber or is unknown', function (): void {
        $branch = BranchModel::factory()->create();
        $foreign = branchReview(BranchModel::factory()->create());
        $barberReview = ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Barber, 'subject_id' => BarberModel::factory()->create()->id]);
        $this->authenticateDashboardActor($branch);

        $this->postJson(disputeUrl($branch, $foreign), disputePayload())->assertNotFound();
        $this->postJson(disputeUrl($branch, $barberReview), disputePayload())->assertNotFound();
        $this->postJson(disputeUrl($branch, REVIEW_DISPUTE_MISSING_ID), disputePayload())->assertNotFound();
        $this->postJson(disputeUrl($branch, 'not-a-uuid'), disputePayload())->assertNotFound();

        expect($foreign->fresh()->status)->toBe(ReviewStatus::Published)
            ->and($barberReview->fresh()->status)->toBe(ReviewStatus::Published);
    });

    it('answers 422 when the review is not published and sends no notification', function (ReviewStatus $status): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch, ['status' => $status]);
        AdminModel::factory()->create();
        $this->authenticateDashboardActor($branch);

        $this->postJson(disputeUrl($branch, $review), disputePayload())
            ->assertUnprocessable()
            ->assertJsonPath('code', 'REVIEW_VALIDATION_FAILED');

        expect($review->fresh()->status)->toBe($status)
            ->and(NotificationModel::query()->count())->toBe(0);
    })->with([ReviewStatus::Disputed, ReviewStatus::Hidden, ReviewStatus::Resolved]);

    it('validates the reason length', function (array $payload): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch);
        $this->authenticateDashboardActor($branch);

        $this->postJson(disputeUrl($branch, $review), $payload)->assertUnprocessable()->assertJsonValidationErrors('reason');

        expect($review->fresh()->status)->toBe(ReviewStatus::Published);
    })->with([
        'missing' => [[]],
        'too short' => [['reason' => 'short']],
        'too long' => [['reason' => str_repeat('a', 1001)]],
    ]);

    it('accepts the boundary lengths of 10 and 1000 characters', function (int $length): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch);
        $this->authenticateDashboardActor($branch);

        $this->postJson(disputeUrl($branch, $review), ['reason' => str_repeat('a', $length)])->assertOk();
    })->with([10, 1000]);
});

/** NS-05: the moderation queue and resolution outcomes, beyond the cases in DashboardAdminModerationTest. */
describe('Moderate a disputed review (NS-05)', function (): void {
    it('shows the reviewed subject name and the dispute reason in the queue', function (): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch, ['status' => ReviewStatus::Disputed, 'dispute_reason' => 'Wrong appointment.', 'disputed_at' => now()]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson('/api/v1/dashboard/admin/reviews')
            ->assertOk()
            ->assertJsonPath('data.0.id', $review->id)
            ->assertJsonPath('data.0.subject_type', 'branch')
            ->assertJsonPath('data.0.subject_name', (string) $branch->name)
            ->assertJsonPath('data.0.dispute_reason', 'Wrong appointment.');
    });

    it('orders the queue by the most recent dispute and paginates it', function (): void {
        $older = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()->subDay()]);
        $newer = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()]);
        ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()->subDays(2)]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $page = $this->getJson('/api/v1/dashboard/admin/reviews?per_page=2')->assertOk()->assertJsonCount(2, 'data');

        expect($page->json('data.0.id'))->toBe($newer->id)
            ->and($page->json('data.1.id'))->toBe($older->id);
        $page->assertJsonPath('meta.pagination.total', 3);
    });

    it('rejects a per_page outside the allowed range', function (int $perPage): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->getJson("/api/v1/dashboard/admin/reviews?per_page={$perPage}")->assertUnprocessable()->assertJsonValidationErrors('per_page');
    })->with([0, 100000]);

    it('keeps the review published when the admin keeps it, and records who resolved it and when', function (): void {
        $admin = AdminModel::factory()->create();
        $review = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()]);
        $this->authenticateDashboardActor($admin);

        $this->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => ReviewStatus::Published->value])
            ->assertOk()
            ->assertJsonPath('data.status', ReviewStatus::Published->value)
            ->assertJsonPath('data.resolution_note', null);

        expect($review->fresh())->resolved_by_id->toBe($admin->id)->resolved_at->not->toBeNull();
    });

    it('answers 422 on a second resolution and keeps the first decision', function (): void {
        $review = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $url = "/api/v1/dashboard/admin/reviews/{$review->id}/resolve";

        $this->patchJson($url, ['status' => ReviewStatus::Hidden->value, 'note' => 'First.'])->assertOk();
        $this->patchJson($url, ['status' => ReviewStatus::Published->value, 'note' => 'Second.'])->assertUnprocessable();

        expect($review->fresh())->status->toBe(ReviewStatus::Hidden)->resolution_note->toBe('First.');
    });

    it('answers 404 for an unknown review', function (): void {
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson('/api/v1/dashboard/admin/reviews/'.REVIEW_DISPUTE_MISSING_ID.'/resolve', ['status' => ReviewStatus::Hidden->value])
            ->assertNotFound();
    });

    it('validates the status and the note length', function (array $payload, string $field): void {
        $review = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()]);
        $this->authenticateDashboardActor(AdminModel::factory()->create());

        $this->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect($review->fresh()->status)->toBe(ReviewStatus::Disputed);
    })->with([
        'missing status' => [[], 'status'],
        'note too long' => [['status' => 'hidden', 'note' => str_repeat('a', 1001)], 'note'],
    ]);

    it('rejects anonymous callers on resolve', function (): void {
        $review = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()]);

        $this->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => 'hidden'])->assertUnauthorized();
    });

    it('lets the admin hide a review the manager disputed, end to end', function (): void {
        $branch = BranchModel::factory()->create();
        $review = branchReview($branch);
        $this->authenticateDashboardActor($branch);
        $this->postJson(disputeUrl($branch, $review), disputePayload())->assertOk();

        $this->flushHeaders();
        app('auth')->forgetGuards();
        $this->authenticateDashboardActor(AdminModel::factory()->create())
            ->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => ReviewStatus::Hidden->value])
            ->assertOk();

        expect($review->fresh()->status)->toBe(ReviewStatus::Hidden);
    });
});
