<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class GetNotificationPreferencesQuery
{
    public function __construct(
        public string $actorType,
        public string $actorId,
    ) {}
}
