<?php

declare(strict_types=1);

namespace Modules\Core\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Handlers\Shared\MarkAllNotificationsReadHandler;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Http\Requests\Shared\MarkAllNotificationsReadRequest;

final class MarkAllNotificationsReadAction extends BaseApiAction
{
    public function __construct(
        private readonly MarkAllNotificationsReadHandler $handler,
    ) {}

    public function __invoke(MarkAllNotificationsReadRequest $request): JsonResponse
    {
        return $this->updated(data: [
            'updated' => $this->handler->handle($request->toCommand()),
            'unread_count' => 0,
        ]);
    }
}
