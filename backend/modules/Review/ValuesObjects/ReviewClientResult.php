<?php

declare(strict_types=1);

namespace Modules\Review\ValuesObjects;

use Modules\Review\Models\ReviewModel;

final readonly class ReviewClientResult
{
    private function __construct(
        public ?ReviewModel $review,
        public ?string $errorCode,
    ) {}

    public static function success(ReviewModel $review): self
    {
        return new self($review, null);
    }

    public static function failure(string $errorCode): self
    {
        return new self(null, $errorCode);
    }

    public function status(): int
    {
        return match ($this->errorCode) {
            null => 201,
            'not_own_booking' => 403,
            'already_reviewed' => 409,
            default => 422,
        };
    }
}
