<?php

declare(strict_types=1);

namespace Modules\Review\CQRS\Command\Client;

final readonly class FlagReviewDisputeCommand
{
    public function __construct(
        public string $reviewId,
        public string $clientId,
        public string $reason,
    ) {}
}
