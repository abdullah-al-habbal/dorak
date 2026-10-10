<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class VerifyDashboardEmailChangeCommand
{
    public function __construct(public string $code) {}
}
