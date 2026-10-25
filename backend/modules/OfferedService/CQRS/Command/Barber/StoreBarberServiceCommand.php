<?php

declare(strict_types=1);

namespace Modules\OfferedService\CQRS\Command\Barber;

final readonly class StoreBarberServiceCommand
{
    /** @param array<string, mixed> $attributes */
    public function __construct(public string $barberId, public array $attributes) {}
}
