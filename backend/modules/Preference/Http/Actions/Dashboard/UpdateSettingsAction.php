<?php

declare(strict_types=1);

namespace Modules\Preference\Http\Actions\Dashboard;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\Support\DashboardActor;
use Modules\Preference\CQRS\Command\UpdateSettingsCommand;
use Modules\Preference\Handlers\UpdateSettingsHandler;
use Modules\Preference\Http\Requests\UpdateSettingsRequest;
use Modules\Preference\Http\Resources\SettingsResource;
use Modules\Preference\Support\DashboardOwnerResolver;

final class UpdateSettingsAction extends BaseApiAction
{
    public function __construct(private readonly UpdateSettingsHandler $handler) {}

    public function __invoke(UpdateSettingsRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        [$ownerType, $ownerId] = DashboardOwnerResolver::resolve($actor);

        $settings = $this->handler->handle(new UpdateSettingsCommand(
            ownerType: $ownerType,
            ownerId: $ownerId,
            attributes: $request->toAttributes(),
        ));

        return $this->updated(SettingsResource::make($settings)->resolve());
    }
}
