<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class UpsertBarberServiceOverrideCommand
{
    public function __construct(
        public string $barberId,
        public string $serviceId,
        public string $brandId,
        public ?int $priceAmountMinor,
        public ?int $durationMinutes,
    ) {}
}
