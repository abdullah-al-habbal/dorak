<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class StoreServiceCommand
{
    /** @param array<string, mixed> $attributes */
    public function __construct(public array $attributes) {}
}
