<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class StoreBranchCommand
{
    public function __construct(public array $attributes) {}
}
