<?php

declare(strict_types=1);

namespace Modules\Core\CQRS\Command\Shared;

final readonly class MarkNotificationReadCommand
{
    public function __construct(
        public string $notifiableType,
        public string $notifiableId,
        public string $notificationId,
    ) {}
}
