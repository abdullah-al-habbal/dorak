<?php

declare(strict_types=1);

namespace Modules\Core\Handlers\Shared;

use Modules\Core\CQRS\Command\Shared\MarkAllNotificationsReadCommand;
use Modules\Core\Eloquent\Resolvers\Shared\NotificationInboxEloquentResolver;

final class MarkAllNotificationsReadHandler
{
    public function __construct(
        private readonly NotificationInboxEloquentResolver $resolver,
    ) {}

    public function handle(MarkAllNotificationsReadCommand $command): int
    {
        return $this->resolver->markAllRead($command->notifiableType, $command->notifiableId);
    }
}
