<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final readonly class ResetDashboardPasswordCommand
{
    public function __construct(
        public DashboardActorTypeEnum $actorType,
        public string $email,
        public string $token,
        public string $password,
    ) {}
}
