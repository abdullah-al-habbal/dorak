<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Handlers\DashboardLoginHandler;
use Modules\Dashboard\Http\Requests\Shared\DashboardLoginRequest;
use Modules\Dashboard\Support\DashboardSessionIssuer;

final class DashboardLoginAction extends BaseApiAction
{
    public function __construct(
        private readonly DashboardLoginHandler $handler,
        private readonly DashboardSessionIssuer $sessions,
    ) {}

    public function __invoke(DashboardLoginRequest $request): JsonResponse
    {
        $actorType = DashboardActorTypeEnum::tryFrom((string) $request->validated('actor_type'));
        $email = $request->validated('email');
        $password = $request->validated('password');

        if ($actorType === null || ! is_string($email) || ! is_string($password)) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        try {
            $actor = $this->handler->authenticate(
                $actorType,
                $email,
                $password,
            );
        } catch (AccountBannedException) {
            return $this->forbidden(message: $this->trans('ban::ui.account_banned'), code: 'ACCOUNT_BANNED');
        }
        if ($actor === null) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_credentials'));
        }

        return $this->success(data: $this->sessions->issue($actor));
    }
}
