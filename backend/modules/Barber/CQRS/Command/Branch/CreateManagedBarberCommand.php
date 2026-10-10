<?php

declare(strict_types=1);

namespace Modules\Barber\CQRS\Command\Branch;

final readonly class CreateManagedBarberCommand
{
    /** @param array<string, string> $name */
    public function __construct(
        public string $branchId,
        public array $name,
        public string $phone,
        public ?string $chairId,
    ) {}
}
