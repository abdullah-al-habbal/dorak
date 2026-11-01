<?php

declare(strict_types=1);

namespace Modules\Client\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Client\Enums\SocialProviderEnum;
use Modules\Client\Handlers\Client\SocialLoginHandler;
use Modules\Client\Http\Requests\Client\SocialLoginRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class SocialLoginAction extends BaseApiAction
{
    public function __construct(
        private readonly SocialLoginHandler $handler,
    ) {}

    public function __invoke(SocialProviderEnum $provider, SocialLoginRequest $request): JsonResponse
    {
        try {
            $result = $this->handler->handle($request->toCommand($provider));
        } catch (AccountBannedException) {
            return $this->forbidden(message: $this->trans('ban::ui.account_banned'), code: 'ACCOUNT_BANNED');
        } catch (AccountNotActiveException) {
            return $this->forbidden(message: $this->trans('activation::messages.account_not_active'), code: 'ACCOUNT_NOT_ACTIVE');
        }

        if ($result->isInvalidToken()) {
            return $this->unauthorized(message: $this->trans('core::messages.invalid_social_token'));
        }

        return $this->success(data: [
            'token' => $result->token,
            'client' => $result->client,
        ]);
    }
}
