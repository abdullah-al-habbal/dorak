<?php

declare(strict_types=1);

namespace Modules\Payout\CQRS\Command;

use Modules\Payout\Enums\PayoutStatus;

final readonly class TransitionPayoutCommand
{
    public function __construct(
        public PayoutStatus $next,
        public string $adminId,
        public ?string $reference = null,
        public ?string $notes = null,
    ) {}
}
