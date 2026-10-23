<?php

declare(strict_types=1);

namespace Modules\Preference\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Preference\CQRS\Query\GetSettingsQuery;
use Modules\Preference\Handlers\GetSettingsHandler;
use Modules\Preference\Http\Resources\SettingsResource;

final class GetSettingsAction extends BaseApiAction
{
    public function __construct(private readonly GetSettingsHandler $handler) {}

    public function __invoke(Request $request): JsonResponse
    {
        $settings = $this->handler->handle(new GetSettingsQuery('client', (string) $request->user()->getAuthIdentifier()));

        return $this->ok(SettingsResource::make($settings)->resolve());
    }
}
