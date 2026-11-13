<?php

declare(strict_types=1);

use Modules\Admin\Models\AdminModel;
use Modules\Barber\Models\BarberModel;
use Modules\Booking\Enums\BookingStatus;
use Modules\Booking\Models\BookingModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\Review\Enums\ReviewAuthorTypeEnum;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Enums\ReviewSubjectTypeEnum;
use Modules\Review\Models\ReviewModel;

const CLIENT_RATING_MISSING_ID = '00000000-0000-4000-8000-0000000000a1';

function ratingUrl(BookingModel|string $booking): string
{
    return '/api/v1/dashboard/bookings/'.($booking instanceof BookingModel ? $booking->id : $booking).'/review';
}

function ratingBranch(BookingModel $booking): BranchModel
{
    return BranchModel::query()->findOrFail($booking->branch_id);
}

/** NS-11: the shop rates the client after a visit; the cases ClientReviewTest does not pin. */
describe('Rate the client from the dashboard (NS-11)', function (): void {
    it('stores the rating and note against the booking, the branch and the client', function (): void {
        $booking = BookingModel::factory()->completed()->create();
        $this->authenticateDashboardActor(ratingBranch($booking));

        $this->postJson(ratingUrl($booking), ['rating' => 4, 'body' => 'Arrived on time.'])
            ->assertCreated()
            ->assertJsonPath('data.rating', 4)
            ->assertJsonPath('data.status', ReviewStatus::Published->value);

        expect(ReviewModel::query()->sole())
            ->booking_id->toBe($booking->id)
            ->author_type->toBe(ReviewAuthorTypeEnum::Branch)
            ->author_id->toBe($booking->branch_id)
            ->subject_type->toBe(ReviewSubjectTypeEnum::Client)
            ->subject_id->toBe($booking->client_id)
            ->body->toBe('Arrived on time.');
    });

    it('allows a no-show to be rated and rejects every unfinished status with 422', function (BookingStatus $status, int $expected): void {
        $booking = BookingModel::factory()->create(['booking_status' => $status->value]);
        $this->authenticateDashboardActor(ratingBranch($booking));

        $this->postJson(ratingUrl($booking), ['rating' => 3])->assertStatus($expected);

        expect(ReviewModel::query()->count())->toBe($expected === 201 ? 1 : 0);
    })->with([
        'no show' => [BookingStatus::NoShow, 201],
        'pending' => [BookingStatus::Pending, 422],
        'confirmed' => [BookingStatus::Confirmed, 422],
        'in progress' => [BookingStatus::InProgress, 422],
        'cancelled' => [BookingStatus::Cancelled, 422],
    ]);

    it('answers 409 already_reviewed on a second rating and keeps the first', function (): void {
        $booking = BookingModel::factory()->completed()->create();
        $this->authenticateDashboardActor(ratingBranch($booking));
        $this->postJson(ratingUrl($booking), ['rating' => 5])->assertCreated();

        $this->postJson(ratingUrl($booking), ['rating' => 1])->assertStatus(409)->assertJsonPath('code', 'REVIEW_VALIDATION_FAILED');

        expect(ReviewModel::query()->sole()->rating)->toBe(5);
    });

    it('validates the rating and the note', function (array $payload, string $field): void {
        $booking = BookingModel::factory()->completed()->create();
        $this->authenticateDashboardActor(ratingBranch($booking));

        $this->postJson(ratingUrl($booking), $payload)->assertUnprocessable()->assertJsonValidationErrors($field);

        expect(ReviewModel::query()->count())->toBe(0);
    })->with([
        'missing rating' => [[], 'rating'],
        'zero' => [['rating' => 0], 'rating'],
        'six' => [['rating' => 6], 'rating'],
        'fraction' => [['rating' => 2.5], 'rating'],
        'text' => [['rating' => 'great'], 'rating'],
        'note too long' => [['rating' => 3, 'body' => str_repeat('a', 1001)], 'body'],
    ]);

    it('refuses another branch\'s manager, an unknown booking, a barber and anonymous callers', function (): void {
        $booking = BookingModel::factory()->completed()->create();

        $this->postJson(ratingUrl($booking), ['rating' => 5])->assertUnauthorized();

        $this->authenticateDashboardActor(BranchModel::factory()->create());
        $this->postJson(ratingUrl($booking), ['rating' => 5])->assertForbidden();
        $this->postJson(ratingUrl(CLIENT_RATING_MISSING_ID), ['rating' => 5])->assertForbidden();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(BarberModel::factory()->create());
        $this->postJson(ratingUrl($booking), ['rating' => 5])->assertForbidden();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->authenticateDashboardActor(AdminModel::factory()->create());
        $this->postJson(ratingUrl($booking), ['rating' => 5])->assertForbidden();

        expect(ReviewModel::query()->count())->toBe(0);
    });

    it('shows the given rating on the booking detail and null before one is given', function (): void {
        $booking = BookingModel::factory()->completed()->create();
        $this->authenticateDashboardActor(ratingBranch($booking));
        $detail = "/api/v1/dashboard/bookings/{$booking->id}";

        $this->getJson($detail)->assertOk()->assertJsonPath('data.client_review', null);

        $this->postJson(ratingUrl($booking), ['rating' => 2, 'body' => 'Late.'])->assertCreated();

        $this->getJson($detail)
            ->assertOk()
            ->assertJsonPath('data.client_review.rating', 2)
            ->assertJsonPath('data.client_review.body', 'Late.')
            ->assertJsonPath('data.client.reputation.count', 1)
            ->assertJsonPath('data.client.reputation.average', 2);
    });

    it('never exposes the shop\'s rating to the rated client', function (): void {
        $booking = BookingModel::factory()->completed()->create();
        $this->authenticateDashboardActor(ratingBranch($booking));
        $this->postJson(ratingUrl($booking), ['rating' => 1, 'body' => 'Rude.'])->assertCreated();

        app('auth')->forgetGuards();
        $this->flushHeaders();
        $this->actingAs(ClientModel::query()->findOrFail($booking->client_id), 'client');
        $response = $this->getJson("/api/v1/bookings/{$booking->id}");

        expect(json_encode($response->json()))->not->toContain('Rude.')->not->toContain('reputation');
    });
});
