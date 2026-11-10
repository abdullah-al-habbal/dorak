<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Owner;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Owner\ResendOwnerCodeHandler;
use Modules\Dashboard\Http\Requests\Owner\OwnerEmailRequest;

final class ResendOwnerCodeAction extends BaseApiAction
{
    public function __construct(private readonly ResendOwnerCodeHandler $handler) {}

    public function __invoke(OwnerEmailRequest $request): JsonResponse
    {
        $this->handler->handle($request->email());

        return $this->success(message: $this->trans('dashboard::messages.owner_check_email'));
    }
}
