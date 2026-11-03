<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Actions\Branch;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Branch\Handlers\Branch\LogoutHandler;
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
