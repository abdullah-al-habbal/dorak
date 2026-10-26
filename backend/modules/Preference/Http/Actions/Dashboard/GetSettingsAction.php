<?php

declare(strict_types=1);

namespace Modules\Preference\Http\Actions\Dashboard;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Preference\CQRS\Query\GetSettingsQuery;
use Modules\Preference\Handlers\GetSettingsHandler;
use Modules\Preference\Http\Resources\Shared\SettingsResource;
use Modules\Preference\Support\DashboardOwnerResolver;

final class GetSettingsAction extends BaseApiAction
{
    public function __construct(private readonly GetSettingsHandler $handler) {}

    public function __invoke(Request $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        [$ownerType, $ownerId] = DashboardOwnerResolver::resolve($actor);

        $settings = $this->handler->handle(new GetSettingsQuery($ownerType, $ownerId));

        return $this->ok(SettingsResource::make($settings)->resolve());
    }
}
