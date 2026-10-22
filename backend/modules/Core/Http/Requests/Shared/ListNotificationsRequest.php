<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests\Shared;

use Modules\Core\CQRS\Query\Shared\ListNotificationsQuery;

final class ListNotificationsRequest extends NotifiableActorRequest
{
    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function toQuery(): ListNotificationsQuery
    {
        return new ListNotificationsQuery(
            notifiableType: $this->notifiableType(),
            notifiableId: $this->notifiableId(),
            perPage: $this->integer('per_page', 20),
        );
    }
}
