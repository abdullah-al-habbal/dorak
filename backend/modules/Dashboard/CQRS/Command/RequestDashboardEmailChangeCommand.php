<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class RequestDashboardEmailChangeCommand
{
    public function __construct(public string $email) {}
}
