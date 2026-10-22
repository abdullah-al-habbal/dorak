<?php

declare(strict_types=1);

namespace Modules\Core\Handlers\Shared;

use Modules\Core\CQRS\Command\Shared\MarkNotificationReadCommand;
use Modules\Core\Eloquent\Resolvers\Shared\NotificationInboxEloquentResolver;
use Modules\Core\Models\NotificationModel;

final class MarkNotificationReadHandler
{
    public function __construct(
        private readonly NotificationInboxEloquentResolver $resolver,
    ) {}

    public function handle(MarkNotificationReadCommand $command): NotificationModel
    {
        return $this->resolver->markRead($command->notifiableType, $command->notifiableId, $command->notificationId);
    }
}
