<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class UpdateDashboardProfileCommand
{
    public function __construct(public string $displayName) {}
}
