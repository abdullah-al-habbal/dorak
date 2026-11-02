<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Modules\ClientInteraction\Enums\InteractableTypeEnum;
use Modules\ClientInteraction\Handlers\AddFavoriteHandler;
use Modules\ClientInteraction\Http\Requests\Client\AddFavoriteRequest;
use Modules\ClientInteraction\Http\Resources\Client\ClientFavoriteResource;
use Modules\ClientInteraction\Services\ClientInteractionRecorder;
use Modules\Core\Http\Actions\BaseApiAction;

final class AddFavoriteAction extends BaseApiAction
{
    public function __construct(
        private readonly ClientInteractionRecorder $interactions,
        private readonly AddFavoriteHandler $handler,
    ) {}

    public function __invoke(AddFavoriteRequest $request): JsonResponse
    {
        $command = $request->toCommand();
        $favorite = $this->handler->handle($command);
        $this->interactions->favorite($request, InteractableTypeEnum::from($command->favoritedType->value), $command->favoritedId);

        $resource = ClientFavoriteResource::make($favorite)->resolve($request);

        return $favorite->wasRecentlyCreated
            ? $this->created(data: $resource)
            : $this->ok(data: $resource);
    }
}
