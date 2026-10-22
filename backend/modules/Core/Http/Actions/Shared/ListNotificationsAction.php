<?php

declare(strict_types=1);

namespace Modules\Core\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Handlers\Shared\ListNotificationsHandler;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Http\Requests\Shared\ListNotificationsRequest;
use Modules\Core\Http\Resources\Shared\NotificationResource;

final class ListNotificationsAction extends BaseApiAction
{
    public function __construct(
        private readonly ListNotificationsHandler $handler,
    ) {}

    public function __invoke(ListNotificationsRequest $request): JsonResponse
    {
        $query = $request->toQuery();

        return $this->paginated(
            paginator: $this->handler->handle($query),
            resourceClass: NotificationResource::class,
            meta: ['unread_count' => $this->handler->unreadCount($query)],
        );
    }
}
