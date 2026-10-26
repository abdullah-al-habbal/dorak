<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\CQRS\Command\Shared;

final readonly class TerminateAffiliationCommand
{
    public function __construct(
        public string $affiliationId,
        public string $actorType,
        public string $actorId,
    ) {}
}
