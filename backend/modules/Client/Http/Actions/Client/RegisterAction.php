<?php

declare(strict_types=1);

namespace Modules\Client\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Client\Handlers\Client\RegisterHandler;
use Modules\Client\Http\Requests\Client\RegisterRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class RegisterAction extends BaseApiAction
{
    public function __construct(
        private readonly RegisterHandler $handler,
    ) {}

    public function __invoke(RegisterRequest $request): JsonResponse
    {
        try {
            $result = $this->handler->handle($request->toCommand());
        } catch (AccountBannedException) {
            return $this->forbidden(message: $this->trans('ban::ui.account_banned'), code: 'ACCOUNT_BANNED');
        }

        return $this->created(data: [
            'token' => $result->token,
            'client' => $result->client,
        ]);
    }
}
