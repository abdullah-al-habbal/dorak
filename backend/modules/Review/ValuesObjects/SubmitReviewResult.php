<?php

declare(strict_types=1);

namespace Modules\Review\ValuesObjects;

use Modules\Review\Models\ReviewModel;

final readonly class SubmitReviewResult
{
    private function __construct(
        public bool $success,
        public ?ReviewModel $review,
        public ?string $errorCode,
        public ?ReviewModel $barberReview = null,
    ) {}

    /**
     * $review is the primary review (the branch, or the barber when the
     * booking has no branch); $barberReview is the extra barber review written
     * alongside a branch review.
     */
    public static function success(ReviewModel $review, ?ReviewModel $barberReview = null): self
    {
        return new self(true, $review, null, $barberReview);
    }

    public static function notOwnBooking(): self
    {
        return new self(false, null, 'not_own_booking');
    }

    public static function bookingNotCompleted(): self
    {
        return new self(false, null, 'booking_not_completed');
    }

    public static function alreadyReviewed(): self
    {
        return new self(false, null, 'already_reviewed');
    }

    public static function noSubject(): self
    {
        return new self(false, null, 'no_subject');
    }
}
