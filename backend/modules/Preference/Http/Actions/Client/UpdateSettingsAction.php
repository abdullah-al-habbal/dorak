<?php

declare(strict_types=1);

namespace Modules\Preference\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Preference\CQRS\Command\UpdateSettingsCommand;
use Modules\Preference\Enums\PreferenceableTypeEnum;
use Modules\Preference\Handlers\UpdateSettingsHandler;
use Modules\Preference\Http\Requests\Shared\UpdateSettingsRequest;
use Modules\Preference\Http\Resources\Shared\SettingsResource;

final class UpdateSettingsAction extends BaseApiAction
{
    public function __construct(private readonly UpdateSettingsHandler $handler) {}

    public function __invoke(UpdateSettingsRequest $request): JsonResponse
    {
        $settings = $this->handler->handle(new UpdateSettingsCommand(
            ownerType: PreferenceableTypeEnum::Client,
            ownerId: (string) $request->user()->getAuthIdentifier(),
            attributes: $request->toAttributes(),
        ));

        return $this->updated(SettingsResource::make($settings)->resolve());
    }
}
