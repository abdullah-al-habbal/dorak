<?php

declare(strict_types=1);

use Modules\Barber\Models\BarberModel;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

beforeEach(function (): void {
    $this->client = ClientModel::factory()->create();
    $this->actingAs($this->client, 'client');
});

describe('review subject resolution', function (): void {
    it('reviews the barber of a completed at-home booking', function (): void {
        $barber = BarberModel::factory()->create();
        $booking = BookingModel::factory()->completed()->atHome()->create([
            'client_id' => $this->client->id,
            'barber_id' => $barber->id,
            'chair_id' => null,
            'branch_id' => null,
        ]);

        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 4, 'body' => 'Great fade'])
            ->assertCreated()
            ->assertJsonPath('data.subject_type', ReviewSubjectTypeEnum::Barber->value)
            ->assertJsonPath('data.subject_id', $barber->id)
            ->assertJsonMissingPath('meta.barber_review');

        $reviews = ReviewModel::query()->where('booking_id', $booking->id)->get();
        expect($reviews)->toHaveCount(1)
            ->and($reviews->first()->subject_type)->toBe(ReviewSubjectTypeEnum::Barber)
            ->and($reviews->first()->subject_id)->toBe($barber->id)
            ->and($reviews->first()->rating)->toBe(4);
    });

    it('reviews both the branch and the barber of a chair booking', function (): void {
        $booking = BookingModel::factory()->completed()->create(['client_id' => $this->client->id]);
        $branchId = $booking->chair->branch_id;

        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 5, 'barber_rating' => 3])
            ->assertCreated()
            ->assertJsonPath('data.subject_type', ReviewSubjectTypeEnum::Branch->value)
            ->assertJsonPath('data.subject_id', $branchId)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('meta.barber_review.subject_type', ReviewSubjectTypeEnum::Barber->value)
            ->assertJsonPath('meta.barber_review.subject_id', $booking->barber_id)
            ->assertJsonPath('meta.barber_review.rating', 3);

        expect(ReviewModel::query()->where('booking_id', $booking->id)->count())->toBe(2);
    });

    it('uses the shop rating for the barber when no barber rating is given', function (): void {
        $booking = BookingModel::factory()->completed()->create(['client_id' => $this->client->id]);

        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 4])
            ->assertCreated()
            ->assertJsonPath('meta.barber_review.rating', 4);
    });

    it('reviews only the branch of a chair booking without a barber', function (): void {
        $booking = BookingModel::factory()->completed()->create(['client_id' => $this->client->id, 'barber_id' => null]);

        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertCreated()
            ->assertJsonPath('data.subject_type', ReviewSubjectTypeEnum::Branch->value)
            ->assertJsonMissingPath('meta.barber_review');

        expect(ReviewModel::query()->where('booking_id', $booking->id)->count())->toBe(1);
    });

    it('reviews the branch of a chairless in-shop barber booking', function (): void {
        $branch = BranchModel::factory()->create();
        $booking = BookingModel::factory()->completed()->create([
            'client_id' => $this->client->id,
            'chair_id' => null,
            'branch_id' => $branch->id,
        ]);

        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertCreated()
            ->assertJsonPath('data.subject_id', $branch->id)
            ->assertJsonPath('meta.barber_review.subject_id', $booking->barber_id);
    });

    it('returns no_subject for a booking with neither chair nor barber', function (): void {
        $booking = BookingModel::factory()->completed()->atHome()->create([
            'client_id' => $this->client->id,
            'chair_id' => null,
            'branch_id' => null,
            'barber_id' => null,
        ]);

        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 5])
            ->assertStatus(422)
            ->assertJsonPath('code', 'REVIEW_VALIDATION_FAILED')
            ->assertJsonPath('message', __('review::messages.no_subject'));

        expect(ReviewModel::query()->count())->toBe(0);
    });

    it('rejects a second review of the same booking after both subjects were reviewed', function (): void {
        $booking = BookingModel::factory()->completed()->create(['client_id' => $this->client->id]);

        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 5])->assertCreated();
        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 1])->assertStatus(409);

        expect(ReviewModel::query()->where('booking_id', $booking->id)->count())->toBe(2);
    });

    it('validates the barber rating range', function (): void {
        $booking = BookingModel::factory()->completed()->create(['client_id' => $this->client->id]);

        $this->postJson("/api/v1/client/bookings/{$booking->id}/review", ['rating' => 5, 'barber_rating' => 9])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['barber_rating']);
    });
});

describe('GET /api/v1/barbers/{barber}/reviews', function (): void {
    it('lists only published reviews of the barber, paginated', function (): void {
        $barber = BarberModel::factory()->create();
        ReviewModel::factory()->count(3)->create(['subject_id' => $barber->id, 'subject_type' => ReviewSubjectTypeEnum::Barber]);
        ReviewModel::factory()->create(['subject_id' => $barber->id, 'subject_type' => ReviewSubjectTypeEnum::Barber, 'status' => ReviewStatus::Hidden]);
        ReviewModel::factory()->create(['subject_id' => $barber->id, 'subject_type' => ReviewSubjectTypeEnum::Barber, 'status' => ReviewStatus::Disputed]);
        ReviewModel::factory()->create(['subject_id' => BarberModel::factory()->create()->id, 'subject_type' => ReviewSubjectTypeEnum::Barber]);

        $this->getJson("/api/v1/barbers/{$barber->id}/reviews?per_page=2")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.pagination.total', 3)
            ->assertJsonPath('data.0.subject_type', ReviewSubjectTypeEnum::Barber->value);
    });

    it('returns 404 for an unknown barber', function (): void {
        $this->getJson('/api/v1/barbers/00000000-0000-0000-0000-000000000000/reviews')->assertNotFound();
    });
});
