<?php

declare(strict_types=1);

namespace Modules\Review\Eloquent\Resolvers\Client;

use Modules\Booking\Models\BookingModel;
use Modules\Review\Enums\ReviewStatus;
use Modules\Review\Models\ReviewModel;

final class SubmitReviewEloquentResolver
{
    /** Locks the booking so two concurrent submissions cannot both pass the duplicate check. */
    public function findBookingForReview(string $bookingId): BookingModel
    {
        return BookingModel::query()->with('chair')->lockForUpdate()->findOrFail($bookingId);
    }

    public function authorHasReviewed(BookingModel $booking, string $authorId, string $authorType): bool
    {
        return $booking->reviews()
            ->where('author_id', $authorId)
            ->where('author_type', $authorType)
            ->exists();
    }

    public function createReview(array $data): ReviewModel
    {
        $data['status'] = ReviewStatus::Published;

        $review = ReviewModel::create($data);
        $review->load('author');

        return $review;
    }
}
