<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\CQRS\Command\Branch;

final readonly class InviteAffiliationCommand
{
    public function __construct(
        public string $branchId,
        public string $barberId,
        public ?float $commissionRate,
    ) {}
}
