<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final readonly class GetNotificationPreferencesQuery
{
    public function __construct(
        public DashboardActorTypeEnum $actorType,
        public string $actorId,
    ) {}
}
