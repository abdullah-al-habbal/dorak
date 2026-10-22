<?php

declare(strict_types=1);

namespace Modules\Review\CQRS\Command\Staff;

final readonly class FlagReviewDisputeCommand
{
    /** @param 'branch'|'barber' $subjectType the reviewed party raising the dispute */
    public function __construct(
        public string $reviewId,
        public string $subjectType,
        public string $subjectId,
        public string $reason,
    ) {}
}
