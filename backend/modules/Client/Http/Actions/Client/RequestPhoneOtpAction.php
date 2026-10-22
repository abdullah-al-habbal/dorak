<?php

declare(strict_types=1);

namespace Modules\Client\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Client\Handlers\Client\RequestPhoneOtpHandler;
use Modules\Client\Http\Requests\Client\RequestPhoneOtpRequest;
use Modules\Core\Http\Actions\BaseApiAction;

final class RequestPhoneOtpAction extends BaseApiAction
{
    public function __construct(
        private readonly RequestPhoneOtpHandler $handler,
    ) {}

    public function __invoke(RequestPhoneOtpRequest $request): JsonResponse
    {
        $result = $this->handler->handle($request->toCommand());

        if ($result->isPhoneInUse()) {
            return $this->unprocessable(message: $this->trans('core::messages.phone_already_in_use'));
        }

        return $this->success(message: $this->trans('core::messages.phone_otp_sent'));
    }
}
