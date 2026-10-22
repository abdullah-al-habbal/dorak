<?php

declare(strict_types=1);

namespace Modules\Core\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Handlers\Shared\MarkNotificationReadHandler;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Http\Requests\Shared\MarkNotificationReadRequest;
use Modules\Core\Http\Resources\Shared\NotificationResource;

final class MarkNotificationReadAction extends BaseApiAction
{
    public function __construct(
        private readonly MarkNotificationReadHandler $handler,
    ) {}

    public function __invoke(MarkNotificationReadRequest $request): JsonResponse
    {
        return $this->updated(data: NotificationResource::make($this->handler->handle($request->toCommand())));
    }
}
