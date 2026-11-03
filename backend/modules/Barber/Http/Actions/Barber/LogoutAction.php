<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Actions\Barber;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Barber\Handlers\Barber\LogoutHandler;
use Modules\Core\Http\Actions\BaseApiAction;

final class LogoutAction extends BaseApiAction
{
    public function __construct(
        private readonly LogoutHandler $handler,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $this->handler->handle($request->user());

        return $this->noContent();
    }
}
