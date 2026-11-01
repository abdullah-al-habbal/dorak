<?php

declare(strict_types=1);

namespace Modules\Review\CQRS\Command\Staff;

use Modules\Review\Enums\ReviewSubjectTypeEnum;

final readonly class FlagReviewDisputeCommand
{
    public function __construct(
        public string $reviewId,
        public ReviewSubjectTypeEnum $subjectType,
        public string $subjectId,
        public string $reason,
    ) {}
}
