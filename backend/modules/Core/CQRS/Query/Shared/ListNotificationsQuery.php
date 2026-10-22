<?php

declare(strict_types=1);

namespace Modules\Core\CQRS\Query\Shared;

final readonly class ListNotificationsQuery
{
    public function __construct(
        public string $notifiableType,
        public string $notifiableId,
        public int $perPage,
    ) {}
}
