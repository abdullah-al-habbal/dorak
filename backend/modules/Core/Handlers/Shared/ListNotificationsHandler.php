<?php

declare(strict_types=1);

namespace Modules\Core\Handlers\Shared;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Core\CQRS\Query\Shared\ListNotificationsQuery;
use Modules\Core\Eloquent\Resolvers\Shared\NotificationInboxEloquentResolver;
use Modules\Core\Models\NotificationModel;

final class ListNotificationsHandler
{
    public function __construct(
        private readonly NotificationInboxEloquentResolver $resolver,
    ) {}

    /**
     * @return LengthAwarePaginator<int, NotificationModel>
     */
    public function handle(ListNotificationsQuery $query): LengthAwarePaginator
    {
        return $this->resolver->paginate($query->notifiableType, $query->notifiableId, $query->perPage);
    }

    public function unreadCount(ListNotificationsQuery $query): int
    {
        return $this->resolver->unreadCount($query->notifiableType, $query->notifiableId);
    }
}
