<?php

declare(strict_types=1);

namespace Modules\Core\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Core\Http\Requests\Shared\RegisterDeviceTokenRequest;
use Modules\Core\Models\DeviceTokenModel;

final class RegisterDeviceTokenAction extends BaseApiAction
{
    public function __invoke(RegisterDeviceTokenRequest $request): JsonResponse
    {
        $actor = $request->user();

        $deviceToken = DeviceTokenModel::query()->updateOrCreate(
            ['token' => $request->string('token')->toString()],
            [
                'user_id' => $actor->getAuthIdentifier(),
                'user_type' => $actor::class,
                'platform' => $request->string('platform')->toString(),
                'last_used_at' => now(),
            ],
        );

        return $this->ok(data: ['id' => $deviceToken->id]);
    }
}
