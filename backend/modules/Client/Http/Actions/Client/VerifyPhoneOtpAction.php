<?php

declare(strict_types=1);

namespace Modules\Client\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Client\Handlers\Client\VerifyPhoneOtpHandler;
use Modules\Client\Http\Requests\Client\VerifyPhoneOtpRequest;
use Modules\Client\Http\Resources\Client\ClientProfileResource;
use Modules\Core\Http\Actions\BaseApiAction;

final class VerifyPhoneOtpAction extends BaseApiAction
{
    public function __construct(
        private readonly VerifyPhoneOtpHandler $handler,
    ) {}

    public function __invoke(VerifyPhoneOtpRequest $request): JsonResponse
    {
        $result = $this->handler->handle($request->toCommand());

        if ($result->isPhoneInUse()) {
            return $this->unprocessable(message: $this->trans('core::messages.phone_already_in_use'));
        }

        if ($result->isInvalidCode()) {
            return $this->unprocessable(message: $this->trans('core::messages.invalid_phone_otp'));
        }

        return $this->ok(
            data: ClientProfileResource::make($result->client)->resolve(),
            message: $this->trans('core::messages.phone_verified'),
        );
    }
}
