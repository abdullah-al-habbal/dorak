<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class DestroyBarberServiceOverrideCommand
{
    public function __construct(
        public string $barberId,
        public string $serviceId,
        public string $brandId,
    ) {}
}
