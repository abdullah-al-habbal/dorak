<?php

declare(strict_types=1);

namespace Modules\Review\CQRS\Command\Client;

use Modules\Review\Enums\ReviewAuthorTypeEnum;

final readonly class SubmitReviewCommand
{
    public function __construct(
        public string $bookingId,
        public string $authorId,
        public ReviewAuthorTypeEnum $authorType,
        public int $rating,
        public ?string $body,
        public ?int $barberRating = null,
    ) {}
}
