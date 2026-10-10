<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class UpdateChairCommand
{
    /** @param array<string, mixed> $attributes */
    public function __construct(public array $attributes, public ?string $branchId) {}
}
