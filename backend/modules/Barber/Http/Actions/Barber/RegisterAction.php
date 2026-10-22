<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Handlers\Barber\RegisterHandler;
use Modules\Barber\Http\Requests\Barber\RegisterRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class RegisterAction extends BaseApiAction
{
    public function __construct(
        private readonly RegisterHandler $handler,
    ) {}

    public function __invoke(RegisterRequest $request): JsonResponse
    {
        return $this->created(
            data: $this->handler->handle($request->toCommand()),
            message: $this->trans('barber::messages.registered_pending_approval'),
        );
    }
}
