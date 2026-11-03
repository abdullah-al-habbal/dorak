<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

function rateBranch(BranchModel $branch, int $rating, ReviewStatus $status = ReviewStatus::Published): ReviewModel
{
    return ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Branch, 'subject_id' => $branch->id, 'rating' => $rating, 'status' => $status]);
}

it('updates the subject aggregate when a client submits a review', function (): void {
    $booking = BookingModel::factory()->completed()->create();

    $this->actingAs(ClientModel::query()->findOrFail($booking->client_id), 'client')
        ->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 4, 'barber_rating' => 2])
        ->assertCreated();

    $branch = BranchModel::query()->findOrFail($booking->branch_id);
    $barber = BarberModel::query()->findOrFail($booking->barber_id);
    expect((float) $branch->rating_average)->toBe(4.0)
        ->and($branch->rating_count)->toBe(1)
        ->and((float) $barber->rating_average)->toBe(2.0)
        ->and($barber->rating_count)->toBe(1);
});

it('averages only published reviews and rounds to two decimals', function (): void {
    $branch = BranchModel::factory()->create();
    rateBranch($branch, 5);
    rateBranch($branch, 4);
    rateBranch($branch, 4);
    rateBranch($branch, 1, ReviewStatus::Hidden);
    rateBranch($branch, 1, ReviewStatus::Disputed);

    $branch->refresh();
    expect((float) $branch->rating_average)->toBe(4.33)
        ->and($branch->rating_count)->toBe(3);
});

it('drops a disputed review from the aggregate and restores it on resolution', function (): void {
    $branch = BranchModel::factory()->create();
    rateBranch($branch, 5);
    $disputed = rateBranch($branch, 1);
    expect((float) $branch->fresh()->rating_average)->toBe(3.0);

    $this->actingAs($branch, 'branch_api')
        ->postJson("/api/v1/branch/reviews/{$disputed->id}/dispute", ['reason' => 'Wrong appointment entirely.'])
        ->assertOk();
    expect((float) $branch->fresh()->rating_average)->toBe(5.0)
        ->and($branch->fresh()->rating_count)->toBe(1);

    $admin = AdminModel::factory()->create();
    $this->authenticateDashboardActor($admin)
        ->patchJson("/api/v1/dashboard/admin/reviews/{$disputed->id}/resolve", ['status' => ReviewStatus::Published])
        ->assertOk();
    expect((float) $branch->fresh()->rating_average)->toBe(3.0)
        ->and($branch->fresh()->rating_count)->toBe(2);
});

it('restores the aggregate when an expired dispute is auto-released', function (): void {
    $branch = BranchModel::factory()->create();
    rateBranch($branch, 5);
    rateBranch($branch, 1, ReviewStatus::Disputed)->update(['disputed_at' => now()->subHours(49)]);
    expect($branch->fresh()->rating_count)->toBe(1);

    $this->artisan('reviews:release-expired-disputes')->assertSuccessful();

    expect($branch->fresh()->rating_count)->toBe(2)
        ->and((float) $branch->fresh()->rating_average)->toBe(3.0);
});

it('clears the aggregate when the last counted review is deleted', function (): void {
    $branch = BranchModel::factory()->create();
    rateBranch($branch, 4)->delete();

    expect($branch->fresh()->rating_average)->toBeNull()
        ->and($branch->fresh()->rating_count)->toBe(0);
});

it('recomputes every aggregate on demand', function (): void {
    $branch = BranchModel::factory()->create();
    rateBranch($branch, 4);
    BranchModel::query()->whereKey($branch->id)->update(['rating_average' => null, 'rating_count' => 0]);

    $this->artisan('reviews:refresh-ratings')->assertSuccessful();

    expect((float) $branch->fresh()->rating_average)->toBe(4.0);
});

it('filters barbers by their stored barber rating', function (): void {
    $great = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3]);
    $poor = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3]);
    $unrated = BarberModel::factory()->create(['is_freelancer' => true, 'latitude' => 33.5, 'longitude' => 36.3]);
    ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Barber, 'subject_id' => $great->id, 'rating' => 5]);
    ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Barber, 'subject_id' => $great->id, 'rating' => 4]);
    ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Barber, 'subject_id' => $poor->id, 'rating' => 3]);

    $response = $this->getJson('/api/v1/explore/barbers?latitude=33.5&longitude=36.3&radius=1000&rating_min=4')->assertOk();

    expect($response->json('data.*.id'))->toBe([$great->id])
        ->and($response->json('data.0.rating_average'))->toBe(4.5)
        ->and($response->json('data.0.rating_count'))->toBe(2);
    expect($unrated->fresh()->rating_count)->toBe(0);
});

it('exposes the rating on the barber detail', function (): void {
    $barber = BarberModel::factory()->create(['is_freelancer' => true]);
    ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Barber, 'subject_id' => $barber->id, 'rating' => 3]);

    $this->getJson("/api/v1/explore/barbers/{$barber->id}")
        ->assertOk()
        ->assertJsonPath('data.rating_average', 3)
        ->assertJsonPath('data.rating_count', 1);
});
