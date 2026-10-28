<?php

declare(strict_types=1);

namespace Modules\Review\CQRS\Command\Admin;

use Modules\Review\Enums\ReviewStatus;

final readonly class ResolveReviewDisputeCommand
{
    public function __construct(
        public string $reviewId,
        public string $adminId,
        public ReviewStatus $status,
        public ?string $note = null,
    ) {}
}
