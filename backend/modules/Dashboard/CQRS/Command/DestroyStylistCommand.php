<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class DestroyStylistCommand
{
    public function __construct(public string $stylistId) {}
}
