<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests\Shared;

use Modules\Core\CQRS\Command\Shared\MarkAllNotificationsReadCommand;

final class MarkAllNotificationsReadRequest extends NotifiableActorRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [];
    }

    public function toCommand(): MarkAllNotificationsReadCommand
    {
        return new MarkAllNotificationsReadCommand(
            notifiableType: $this->notifiableType(),
            notifiableId: $this->notifiableId(),
        );
    }
}
