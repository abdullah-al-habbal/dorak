<?php

declare(strict_types=1);

use Illuminate\Console\Scheduling\Schedule;
use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;
use Tests\Support\Constants\ReviewDisputeTestConstants;

it('lets the reviewed branch dispute a published review', function () {
    $branch = BranchModel::factory()->create();
    $review = ReviewModel::factory()->create([
        'subject_id' => $branch->id,
        'subject_type' => ReviewSubjectTypeEnum::Branch,
        'status' => ReviewStatus::Published,
    ]);

    $this->actingAs($branch, 'branch_api')
        ->postJson("/api/v1/branch/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertOk()
        ->assertJsonPath('data.status', ReviewStatus::Disputed->value);

    $fresh = $review->fresh();
    expect($fresh->status)->toBe(ReviewStatus::Disputed)
        ->and($fresh->dispute_reason)->toBe(ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON)
        ->and($fresh->disputed_at)->not->toBeNull();
});

it('refuses a branch disputing another branch\'s review with 403', function () {
    $review = ReviewModel::factory()->create([
        'subject_id' => BranchModel::factory()->create()->id,
        'subject_type' => ReviewSubjectTypeEnum::Branch,
    ]);

    $this->actingAs(BranchModel::factory()->create(), 'branch_api')
        ->postJson("/api/v1/branch/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertForbidden();

    expect($review->fresh()->status)->toBe(ReviewStatus::Published);
});

it('lets the reviewed barber dispute a barber review', function () {
    $barber = BarberModel::factory()->create(['has_login' => true]);
    $review = ReviewModel::factory()->create(['subject_id' => $barber->id, 'subject_type' => ReviewSubjectTypeEnum::Barber]);

    $this->actingAs($barber, 'barber')
        ->postJson("/api/v1/barber/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertOk();

    $this->actingAs($barber, 'barber')
        ->postJson("/api/v1/barber/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertStatus(422);
});

it('does not let a branch dispute a barber review about one of its barbers', function () {
    $branch = BranchModel::factory()->create();
    $review = ReviewModel::factory()->create(['subject_id' => BarberModel::factory()->create()->id, 'subject_type' => ReviewSubjectTypeEnum::Barber]);

    $this->actingAs($branch, 'branch_api')
        ->postJson("/api/v1/branch/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertForbidden();
});

it('returns the review payload without leaking the dispute reason', function () {
    $branch = BranchModel::factory()->create();
    $review = ReviewModel::factory()->create([
        'subject_id' => $branch->id,
        'subject_type' => ReviewSubjectTypeEnum::Branch,
        'status' => ReviewStatus::Published,
    ]);

    $this->actingAs($branch, 'branch_api')
        ->postJson("/api/v1/branch/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertOk()
        ->assertJsonStructure(['data' => ['id', 'subject_type', 'subject_id', 'rating', 'body', 'status', 'disputed_at', 'resolved_at', 'created_at']])
        ->assertJsonPath('data.id', $review->id)
        ->assertJsonPath('data.subject_type', ReviewSubjectTypeEnum::Branch->value)
        ->assertJsonPath('data.subject_id', $branch->id)
        ->assertJsonPath('data.status', ReviewStatus::Disputed->value)
        ->assertJsonPath('data.resolved_at', null)
        ->assertJsonMissingPath('data.dispute_reason');
});

it('refuses to dispute a review that is not published', function (ReviewStatus $status) {
    $branch = BranchModel::factory()->create();
    $review = ReviewModel::factory()->create([
        'subject_id' => $branch->id,
        'subject_type' => ReviewSubjectTypeEnum::Branch,
        'status' => $status,
    ]);

    $this->actingAs($branch, 'branch_api')
        ->postJson("/api/v1/branch/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertStatus(422)
        ->assertJsonPath('code', 'REVIEW_VALIDATION_FAILED');

    expect($review->fresh()->status)->toBe($status)
        ->and($review->fresh()->dispute_reason)->toBeNull();
})->with([
    'already disputed' => ReviewStatus::Disputed,
    'resolved' => ReviewStatus::Resolved,
    'hidden' => ReviewStatus::Hidden,
]);

it('refuses a barber disputing another barber\'s review with 403', function () {
    $review = ReviewModel::factory()->create([
        'subject_id' => BarberModel::factory()->create()->id,
        'subject_type' => ReviewSubjectTypeEnum::Barber,
    ]);

    $this->actingAs(BarberModel::factory()->create(['has_login' => true]), 'barber')
        ->postJson("/api/v1/barber/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertForbidden();

    expect($review->fresh()->status)->toBe(ReviewStatus::Published);
});

it('rejects unauthenticated and wrong-guard callers on both dispute routes', function () {
    $review = ReviewModel::factory()->create();

    foreach (['branch', 'barber'] as $side) {
        $this->postJson("/api/v1/{$side}/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
            ->assertUnauthorized();
    }

    $this->actingAs(ClientModel::factory()->create(), 'client')
        ->postJson("/api/v1/branch/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertUnauthorized();
    $this->actingAs(BranchModel::factory()->create(), 'branch_api')
        ->postJson("/api/v1/barber/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertUnauthorized();

    expect($review->fresh()->status)->toBe(ReviewStatus::Published);
});

it('rejects a dispute reason longer than 1000 characters', function () {
    $barber = BarberModel::factory()->create(['has_login' => true]);
    $review = ReviewModel::factory()->create(['subject_id' => $barber->id, 'subject_type' => ReviewSubjectTypeEnum::Barber]);

    $this->actingAs($barber, 'barber')
        ->postJson("/api/v1/barber/reviews/{$review->id}/dispute", ['reason' => str_repeat('a', 1001)])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['reason']);
});

it('has no client dispute route', function () {
    $client = ClientModel::factory()->create();
    $review = ReviewModel::factory()->create(['author_id' => $client->id, 'author_type' => ReviewAuthorTypeEnum::Client]);

    $this->actingAs($client, 'client')
        ->postJson("/api/v1/client/reviews/{$review->id}/dispute", ['reason' => ReviewDisputeTestConstants::REVIEW_DISPUTE_TEST_REASON])
        ->assertNotFound();
});

it('requires a dispute reason of at least 10 characters', function () {
    $branch = BranchModel::factory()->create();
    $review = ReviewModel::factory()->create(['subject_id' => $branch->id, 'subject_type' => ReviewSubjectTypeEnum::Branch]);

    $this->actingAs($branch, 'branch_api')
        ->postJson("/api/v1/branch/reviews/{$review->id}/dispute", ['reason' => 'short'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['reason']);
});

it('lets an admin resolve a dispute inside the 48-hour window', function () {
    $review = ReviewModel::factory()->create([
        'status' => ReviewStatus::Disputed,
        'disputed_at' => now()->subHour(),
    ]);
    $admin = AdminModel::factory()->create();

    $this->authenticateDashboardActor($admin)
        ->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => ReviewStatus::Published->value])
        ->assertOk()
        ->assertJsonPath('data.status', ReviewStatus::Published->value);
});

it('refuses to resolve a review that is not disputed', function () {
    $review = ReviewModel::factory()->create(['status' => ReviewStatus::Published]);
    $admin = AdminModel::factory()->create();

    $this->authenticateDashboardActor($admin)
        ->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => ReviewStatus::Hidden->value])
        ->assertStatus(422);
});

it('re-publishes disputes nobody resolved within 48 hours', function () {
    $expired = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()]);
    $recent = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()]);
    $hidden = ReviewModel::factory()->create(['status' => ReviewStatus::Hidden, 'disputed_at' => now()]);

    $this->travel(47)->hours();
    $recent->update(['disputed_at' => now()]);
    $this->travel(2)->hours();

    $this->artisan('reviews:release-expired-disputes')->assertSuccessful();

    expect($expired->fresh()->status)->toBe(ReviewStatus::Published)
        ->and($expired->fresh()->resolved_at)->not->toBeNull()
        ->and($recent->fresh()->status)->toBe(ReviewStatus::Disputed)
        ->and($hidden->fresh()->status)->toBe(ReviewStatus::Hidden);
});

it('schedules the dispute release hourly', function () {
    $events = collect(app(Schedule::class)->events())
        ->filter(fn ($event) => str_contains((string) $event->command, 'reviews:release-expired-disputes'));

    expect($events)->toHaveCount(1)
        ->and($events->first()->expression)->toBe('0 * * * *');
});

it('lets an admin resolve a dispute after the window as well', function () {
    $review = ReviewModel::factory()->create([
        'status' => ReviewStatus::Disputed,
        'disputed_at' => now()->subHours(49),
    ]);
    $admin = AdminModel::factory()->create();
    $response = $this
        ->authenticateDashboardActor($admin)
        ->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", [
            'status' => ReviewStatus::Hidden->value,
        ]);

    $response->assertOk()->assertJsonPath('data.status', ReviewStatus::Hidden->value);
    $this->assertDatabaseHas('reviews', [
        'id' => $review->id,
        'status' => ReviewStatus::Hidden->value,
        'resolved_by_id' => $admin->id,
    ]);
});

it('rejects barber and branch dashboard sessions when resolving a dispute', function () {
    $review = ReviewModel::factory()->create([
        'status' => ReviewStatus::Disputed,
    ]);

    foreach ([BarberModel::factory()->create(), BranchModel::factory()->create()] as $actor) {
        $this->authenticateDashboardActor($actor)
            ->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", [
                'status' => ReviewStatus::Hidden->value,
            ])
            ->assertForbidden();
    }

    expect($review->fresh()->status)->toBe(ReviewStatus::Disputed);
});

it('rejects a resolution status outside the allowed outcomes', function (string $status) {
    $review = ReviewModel::factory()->create(['status' => ReviewStatus::Disputed, 'disputed_at' => now()]);
    $admin = AdminModel::factory()->create();

    $this->authenticateDashboardActor($admin)
        ->patchJson("/api/v1/dashboard/admin/reviews/{$review->id}/resolve", ['status' => $status])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');

    expect($review->fresh()->status)->toBe(ReviewStatus::Disputed);
})->with([
    'disputed' => ReviewStatus::Disputed->value,
    'resolved' => ReviewStatus::Resolved->value,
    'unknown' => 'archived',
]);

it('rejects an unknown status filter on the admin review list', function () {
    $admin = AdminModel::factory()->create();

    $this->authenticateDashboardActor($admin)
        ->getJson('/api/v1/dashboard/admin/reviews?status=archived')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('status');
});
