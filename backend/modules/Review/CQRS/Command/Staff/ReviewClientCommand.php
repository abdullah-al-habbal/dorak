<?php

declare(strict_types=1);

namespace Modules\Review\CQRS\Command\Staff;

final readonly class ReviewClientCommand
{
    /**
     * @param  'branch'|'barber'  $authorSide  who rates the client
     * @param  list<string>|null  $branchScope  branches the acting branch-side actor may rate for; null = any (unused today)
     */
    public function __construct(
        public string $bookingId,
        public string $authorSide,
        public ?string $barberId,
        public ?array $branchScope,
        public int $rating,
        public ?string $comment,
    ) {}
}
