<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Command;

use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final readonly class ForgotDashboardPasswordCommand
{
    public function __construct(
        public DashboardActorTypeEnum $actorType,
        public string $email,
        public string $requestLocale,
    ) {}
}
