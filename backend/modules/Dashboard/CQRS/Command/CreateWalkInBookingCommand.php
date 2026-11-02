<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

use Carbon\Carbon;

final readonly class CreateWalkInBookingCommand
{
    public function __construct(
        public string $branchId,
        public string $chairId,
        public ?string $barberId,
        public ?string $clientId,
        public string $customerName,
        public string $customerEmail,
        public ?string $customerPhone,
        public Carbon $startsAt,
        public array $serviceIds,
    ) {}
}
