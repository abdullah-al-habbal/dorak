<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

final readonly class UpdateDashboardPasswordCommand
{
    public function __construct(
        public string $currentPassword,
        public string $password,
    ) {}
}
