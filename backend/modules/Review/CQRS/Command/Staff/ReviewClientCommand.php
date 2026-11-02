<?php

declare(strict_types=1);

namespace Modules\Review\CQRS\Command\Staff;

use Modules\Review\Enums\ReviewAuthorTypeEnum;

final readonly class ReviewClientCommand
{
    /**
     * @param  list<string>|null  $branchScope  branches the acting branch-side actor may rate for; null = any (unused today)
     */
    public function __construct(
        public string $bookingId,
        public ReviewAuthorTypeEnum $authorSide,
        public ?string $barberId,
        public ?array $branchScope,
        public int $rating,
        public ?string $body,
    ) {}
}
