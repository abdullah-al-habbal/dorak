<?php

declare(strict_types=1);

namespace Modules\Core\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Http\Requests\Shared\RevokeDeviceTokenRequest;
use Modules\Core\Services\DeviceTokenService;

/** Stops pushes to one device. Idempotent: an unknown token answers 204 like a revoked one. */
final class RevokeDeviceTokenAction extends BaseApiAction
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function __invoke(RevokeDeviceTokenRequest $request): JsonResponse
    {
        $deviceToken = $request->deviceToken();

        if ($deviceToken !== null) {
            $this->deviceTokens->revoke($deviceToken);
        }

        return $this->noContent();
    }
}
