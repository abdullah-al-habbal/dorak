<?php

declare(strict_types=1);

namespace Modules\Review\ValuesObjects;

use Modules\Review\Models\ReviewModel;

final readonly class FlagReviewDisputeResult
{
    private function __construct(
        public ?ReviewModel $review,
        public ?string $errorCode,
    ) {}

    public static function success(ReviewModel $review): self
    {
        return new self($review, null);
    }

    public static function notReviewedParty(): self
    {
        return new self(null, 'dispute_not_reviewed_party');
    }

    public static function notPublished(): self
    {
        return new self(null, 'dispute_not_allowed');
    }
}
