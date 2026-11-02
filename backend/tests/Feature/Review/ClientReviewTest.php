<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

function finishedBooking(array $overrides = []): BookingModel
{
    return BookingModel::factory()->completed()->create($overrides);
}

function branchOf(BookingModel $booking): BranchModel
{
    return BranchModel::query()->findOrFail($booking->branch_id);
}

describe('POST /api/v1/branch/bookings/{booking}/review', function (): void {
    it('lets the branch rate the client of its completed booking', function (): void {
        $booking = finishedBooking();

        $this->actingAs(branchOf($booking), 'branch_api')
            ->postJson("/api/v1/branch/bookings/{$booking->id}/review", ['rating' => 2, 'body' => 'Arrived 30 minutes late'])
            ->assertCreated()
            ->assertJsonPath('data.subject_type', ReviewSubjectTypeEnum::Client->value)
            ->assertJsonPath('data.subject_id', $booking->client_id)
            ->assertJsonPath('data.rating', 2);

        $review = ReviewModel::query()->sole();
        expect($review->author_type)->toBe(ReviewAuthorTypeEnum::Branch)
            ->and($review->author_id)->toBe($booking->branch_id)
            ->and($review->status)->toBe(ReviewStatus::Published);
    });

    it('also accepts a no-show booking', function (): void {
        $booking = BookingModel::factory()->create(['booking_status' => BookingStatus::NoShow]);

        $this->actingAs(branchOf($booking), 'branch_api')
            ->postJson("/api/v1/branch/bookings/{$booking->id}/review", ['rating' => 1])
            ->assertCreated();
    });

    it('lets a booking hold one client-authored and one branch-authored review', function (): void {
        $booking = finishedBooking();
        $this->actingAs(ClientModel::query()->findOrFail($booking->client_id), 'client')
            ->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertCreated();

        $this->actingAs(branchOf($booking), 'branch_api')
            ->postJson("/api/v1/branch/bookings/{$booking->id}/review", ['rating' => 4])
            ->assertCreated();

        expect(ReviewModel::query()->where('booking_id', $booking->id)->where('author_type', ReviewAuthorTypeEnum::Client)->count())->toBe(2)
            ->and(ReviewModel::query()->where('booking_id', $booking->id)->where('author_type', ReviewAuthorTypeEnum::Branch)->count())->toBe(1);
    });

    it('rejects a second branch review of the same booking with 409', function (): void {
        $booking = finishedBooking();
        $branch = branchOf($booking);

        $this->actingAs($branch, 'branch_api')->postJson("/api/v1/branch/bookings/{$booking->id}/review", ['rating' => 4])->assertCreated();
        $this->actingAs($branch, 'branch_api')->postJson("/api/v1/branch/bookings/{$booking->id}/review", ['rating' => 1])->assertStatus(409);

        expect(ReviewModel::query()->count())->toBe(1);
    });

    it('rejects another branch\'s booking with 403', function (): void {
        $booking = finishedBooking();

        $this->actingAs(BranchModel::factory()->create(), 'branch_api')
            ->postJson("/api/v1/branch/bookings/{$booking->id}/review", ['rating' => 4])
            ->assertForbidden();

        expect(ReviewModel::query()->count())->toBe(0);
    });

    it('rejects a booking that is not completed or no-show with 422', function (BookingStatus $status): void {
        $booking = BookingModel::factory()->create(['booking_status' => $status]);

        $this->actingAs(branchOf($booking), 'branch_api')
            ->postJson("/api/v1/branch/bookings/{$booking->id}/review", ['rating' => 4])
            ->assertStatus(422)
            ->assertJsonPath('message', __('review::messages.booking_not_finished'));
    })->with([
        'pending' => [BookingStatus::Pending],
        'confirmed' => [BookingStatus::Confirmed],
        'in progress' => [BookingStatus::InProgress],
        'cancelled' => [BookingStatus::Cancelled],
    ]);

    it('validates the rating', function (): void {
        $booking = finishedBooking();

        $this->actingAs(branchOf($booking), 'branch_api')
            ->postJson("/api/v1/branch/bookings/{$booking->id}/review", ['rating' => 6])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);
    });
});

describe('POST /api/v1/barber/bookings/{booking}/review', function (): void {
    it('lets the barber rate the client of an at-home booking', function (): void {
        $barber = BarberModel::factory()->create(['has_login' => true]);
        $booking = BookingModel::factory()->completed()->atHome()->create(['barber_id' => $barber->id, 'branch_id' => null]);

        $this->actingAs($barber, 'barber')
            ->postJson("/api/v1/barber/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertCreated()
            ->assertJsonPath('data.subject_type', ReviewSubjectTypeEnum::Client->value);

        expect(ReviewModel::query()->sole()->author_type)->toBe(ReviewAuthorTypeEnum::Barber);
    });

    it('leaves in-shop bookings to the branch', function (): void {
        $booking = finishedBooking();

        $this->actingAs(BarberModel::query()->findOrFail($booking->barber_id), 'barber')
            ->postJson("/api/v1/barber/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertStatus(422)
            ->assertJsonPath('message', __('review::messages.branch_rates_client'));
    });

    it('rejects another barber\'s booking with 403', function (): void {
        $booking = BookingModel::factory()->completed()->atHome()->create(['branch_id' => null]);

        $this->actingAs(BarberModel::factory()->create(), 'barber')
            ->postJson("/api/v1/barber/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertForbidden();
    });
});

describe('client reputation', function (): void {
    it('is exposed on branch booking lists', function (): void {
        $client = ClientModel::factory()->create();
        $booking = finishedBooking(['client_id' => $client->id]);
        $branch = branchOf($booking);
        foreach ([4, 2] as $rating) {
            ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Client, 'subject_id' => $client->id, 'rating' => $rating]);
        }
        ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Client, 'subject_id' => $client->id, 'rating' => 5, 'status' => ReviewStatus::Hidden]);

        $this->actingAs($branch, 'branch_api')
            ->getJson('/api/v1/branch/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.client.id', $client->id)
            ->assertJsonPath('data.0.client.reputation.average', 3)
            ->assertJsonPath('data.0.client.reputation.count', 2);
    });

    it('is null with a zero count for a client nobody rated', function (): void {
        $booking = finishedBooking();

        $this->actingAs(branchOf($booking), 'branch_api')
            ->getJson('/api/v1/branch/bookings')
            ->assertOk()
            ->assertJsonPath('data.0.client.reputation.average', null)
            ->assertJsonPath('data.0.client.reputation.count', 0);
    });

    it('is never shown to the client on their own bookings', function (): void {
        $client = ClientModel::factory()->create();
        finishedBooking(['client_id' => $client->id]);

        $response = $this->actingAs($client, 'client')->getJson('/api/v1/bookings')->assertOk();

        expect($response->json('data.0'))->not->toHaveKey('client')
            ->and(json_encode($response->json()))->not->toContain('reputation');
    });
});

describe('dashboard client review', function (): void {
    it('lets a branch manager rate the client of its booking', function (): void {
        $booking = finishedBooking();

        $this->authenticateDashboardActor(branchOf($booking))
            ->postJson("/api/v1/dashboard/bookings/{$booking->id}/review", ['rating' => 3])
            ->assertCreated();

        expect(ReviewModel::query()->sole()->author_id)->toBe($booking->branch_id);
    });

    it('lets a brand owner rate on behalf of an owned branch only', function (): void {
        $owner = ClientModel::factory()->create();
        $brand = BrandModel::factory()->create(['owner_id' => $owner->id]);
        $branch = BranchModel::factory()->create(['brand_id' => $brand->id]);
        $own = finishedBooking(['branch_id' => $branch->id, 'chair_id' => null]);
        $foreign = finishedBooking();

        $this->authenticateDashboardActor($owner)
            ->postJson("/api/v1/dashboard/bookings/{$own->id}/review", ['rating' => 5])
            ->assertCreated();
        $this->authenticateDashboardActor($owner)
            ->postJson("/api/v1/dashboard/bookings/{$foreign->id}/review", ['rating' => 5])
            ->assertForbidden();
    });

    it('refuses the platform admin', function (): void {
        $booking = finishedBooking();

        $this->authenticateDashboardActor(AdminModel::factory()->create())
            ->postJson("/api/v1/dashboard/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertForbidden();
    });

    it('returns the client reputation in dashboard booking details', function (): void {
        $booking = finishedBooking();
        ReviewModel::factory()->create(['subject_type' => ReviewSubjectTypeEnum::Client, 'subject_id' => $booking->client_id, 'rating' => 4]);

        $this->authenticateDashboardActor(branchOf($booking))
            ->getJson("/api/v1/dashboard/bookings/{$booking->id}")
            ->assertOk()
            ->assertJsonPath('data.client.reputation.count', 1);
    });
});
