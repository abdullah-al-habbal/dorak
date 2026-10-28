<?php

declare(strict_types=1);

namespace Modules\Subscription\CQRS\Command;

final readonly class AssignSubscriptionCommand
{
    public function __construct(
        public string $brandId,
        public string $planId,
    ) {}
}
