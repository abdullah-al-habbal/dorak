<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Push;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Services\DeviceTokenService;
use Modules\Dashboard\Http\Requests\Push\RevokeDashboardPushTokenRequest;

/** Turns browser push off for one browser. Idempotent: an unknown token answers 204 like a revoked one. */
final class RevokeDashboardPushTokenAction extends BaseApiAction
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function __invoke(RevokeDashboardPushTokenRequest $request): JsonResponse
    {
        $deviceToken = $request->deviceToken();
        if ($deviceToken !== null) {
            $this->deviceTokens->revoke($deviceToken);
        }

        return $this->noContent();
    }
}
