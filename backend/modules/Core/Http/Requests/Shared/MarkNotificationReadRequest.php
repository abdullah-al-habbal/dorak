<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests\Shared;

use Modules\Core\CQRS\Command\Shared\MarkNotificationReadCommand;

final class MarkNotificationReadRequest extends NotifiableActorRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [];
    }

    public function toCommand(): MarkNotificationReadCommand
    {
        return new MarkNotificationReadCommand(
            notifiableType: $this->notifiableType(),
            notifiableId: $this->notifiableId(),
            notificationId: (string) $this->route('notification'),
        );
    }
}
