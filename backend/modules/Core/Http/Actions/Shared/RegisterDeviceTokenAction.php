<?php

declare(strict_types=1);

namespace Modules\Core\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Http\Requests\Shared\RegisterDeviceTokenRequest;
use Modules\Core\Services\DeviceTokenService;

final class RegisterDeviceTokenAction extends BaseApiAction
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function __invoke(RegisterDeviceTokenRequest $request): JsonResponse
    {
        $deviceToken = $this->deviceTokens->register($request->user(), $request->toCommand());

        return $this->ok(data: ['id' => $deviceToken->id]);
    }
}
