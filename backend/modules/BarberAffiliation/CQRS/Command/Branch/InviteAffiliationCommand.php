<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\CQRS\Command\Branch;

use Modules\BarberAffiliation\ValuesObjects\AffiliationActor;

final readonly class InviteAffiliationCommand
{
    public function __construct(
        public string $branchId,
        public string $barberId,
        public ?float $commissionPercent,
        public ?AffiliationActor $actor = null,
    ) {}
}
