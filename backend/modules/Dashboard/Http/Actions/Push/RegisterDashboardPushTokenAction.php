<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Push;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Services\DeviceTokenService;
use Modules\Dashboard\Http\Requests\Push\RegisterDashboardPushTokenRequest;

/** Turns browser push on for the signed-in dashboard account (admin, owner, branch or barber), only for that account. */
final class RegisterDashboardPushTokenAction extends BaseApiAction
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function __invoke(RegisterDashboardPushTokenRequest $request): JsonResponse
    {
        $deviceToken = $this->deviceTokens->register($request->account(), $request->toCommand());

        return $this->ok(data: ['id' => $deviceToken->id]);
    }
}
