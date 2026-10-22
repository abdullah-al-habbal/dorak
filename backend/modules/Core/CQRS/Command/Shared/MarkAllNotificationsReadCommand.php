<?php

declare(strict_types=1);

namespace Modules\Core\CQRS\Command\Shared;

final readonly class MarkAllNotificationsReadCommand
{
    public function __construct(
        public string $notifiableType,
        public string $notifiableId,
    ) {}
}
