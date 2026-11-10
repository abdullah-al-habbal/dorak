<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Owner;

use Illuminate\Http\JsonResponse;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Handlers\Owner\CreateOwnerBrandHandler;
use Modules\Dashboard\Http\Requests\Owner\CreateOwnerBrandRequest;
use Modules\Dashboard\Support\DashboardSessionIssuer;

final class CreateOwnerBrandAction extends BaseApiAction
{
    public function __construct(
        private readonly CreateOwnerBrandHandler $handler,
        private readonly DashboardSessionIssuer $sessions,
    ) {}

    public function __invoke(CreateOwnerBrandRequest $request): JsonResponse
    {
        try {
            $actor = $this->handler->handle($request->toCommand());
        } catch (AccountBannedException) {
            return $this->forbidden(message: $this->trans('ban::ui.account_banned'), code: 'ACCOUNT_BANNED');
        }

        if ($actor === null) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        return $this->created(data: $this->sessions->issue($actor));
    }
}
